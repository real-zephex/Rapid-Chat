import CouncilProvider, { cancelCouncil, type CouncilEvent } from "@/models/council";
import {
  saveCouncilSession,
  loadCouncilSession,
  type CouncilSessionData,
} from "@/utils/councilIndexedDB";

export type CouncilMemberState = {
  modelCode: string;
  modelName: string;
  content: string;
  status: "pending" | "streaming" | "done" | "error";
  errorMessage?: string;
};

export type CouncilState = {
  sessionId: string;
  question: string;
  members: CouncilMemberState[];
  judgment: { content: string; status: "pending" | "streaming" | "done" };
  status: "idle" | "running" | "done" | "error";
};

type UpdateCallback = (state: CouncilState) => void;

class CouncilManager {
  private activeSession: {
    sessionId: string;
    promise: Promise<void>;
    cancelRequested: boolean;
    state: CouncilState;
  } | null = null;
  private listeners = new Set<UpdateCallback>();

  async startCouncil(
    sessionId: string,
    question: string,
    memberModelCodes: string[],
    judgeModelCode: string,
    images: { mimeType: string; data: Uint8Array }[],
  ) {
    if (this.activeSession) {
      await this.stopCouncil();
      try {
        await this.activeSession.promise;
      } catch {
        // Previous session handled its own errors.
      }
    }

    const initialState: CouncilState = {
      sessionId,
      question,
      members: memberModelCodes.map((code) => ({
        modelCode: code,
        modelName: code,
        content: "",
        status: "pending",
      })),
      judgment: { content: "", status: "pending" },
      status: "running",
    };

    const session = {
      sessionId,
      promise: Promise.resolve(),
      cancelRequested: false,
      state: initialState,
    };

    this.activeSession = session;
    this.publishUpdate();

    session.promise = this.runCouncil(
      sessionId,
      question,
      memberModelCodes,
      judgeModelCode,
      images,
      session,
    );

    try {
      await session.promise;
    } finally {
      if (this.activeSession === session) {
        this.activeSession = null;
      }
    }
  }

  async stopCouncil() {
    const session = this.activeSession;
    if (!session) return false;

    session.cancelRequested = true;
    await cancelCouncil(session.sessionId);
    return true;
  }

  private async runCouncil(
    sessionId: string,
    question: string,
    memberModelCodes: string[],
    judgeModelCode: string,
    images: { mimeType: string; data: Uint8Array }[],
    session: {
      sessionId: string;
      promise: Promise<void>;
      cancelRequested: boolean;
      state: CouncilState;
    },
  ) {
    const imageData =
      images.length > 0
        ? images.map((img) => ({ mimeType: img.mimeType, data: img.data }))
        : undefined;

    try {
      const response = await CouncilProvider({
        question,
        memberModelCodes,
        judgeModelCode,
        chats: [],
        imageData,
        sessionId,
      });

      if (!(response instanceof ReadableStream)) {
        throw new Error("Expected a ReadableStream response");
      }

      const reader = response.getReader();
      const decoder = new TextDecoder();
      let pendingBuffer = "";

      while (true) {
        if (session.cancelRequested) break;

        const { done, value } = await reader.read();
        if (done) break;

        const chunkText =
          typeof value === "string"
            ? value
            : decoder.decode(value, { stream: true });

        if (!chunkText) continue;

        pendingBuffer += chunkText;

        let newlineIndex = pendingBuffer.indexOf("\n");
        while (newlineIndex !== -1) {
          const rawEvent = pendingBuffer.slice(0, newlineIndex).trim();
          pendingBuffer = pendingBuffer.slice(newlineIndex + 1);

          if (rawEvent) {
            this.handleEvent(rawEvent, session);
          }

          newlineIndex = pendingBuffer.indexOf("\n");
        }

        this.publishUpdate();
      }

      if (pendingBuffer.trim()) {
        this.handleEvent(pendingBuffer.trim(), session);
      }

      if (session.cancelRequested) {
        session.state.status = "error";
      } else {
        session.state.status = "done";
      }

      this.publishUpdate();
      await this.persistSession(session.state, judgeModelCode);
    } catch (error) {
      console.error("Council error:", error);
      session.state.status = "error";
      this.publishUpdate();
    }
  }

  private handleEvent(
    rawEvent: string,
    session: {
      sessionId: string;
      promise: Promise<void>;
      cancelRequested: boolean;
      state: CouncilState;
    },
  ) {
    try {
      const event = JSON.parse(rawEvent) as CouncilEvent;

      switch (event.type) {
        case "member_start": {
          const member = session.state.members.find(
            (m) => m.modelCode === event.modelCode,
          );
          if (member) {
            member.status = "streaming";
            member.modelName = event.modelName || event.modelCode;
          }
          break;
        }
        case "member_chunk": {
          const member = session.state.members.find(
            (m) => m.modelCode === event.modelCode,
          );
          if (member) {
            member.content += event.delta;
          }
          break;
        }
        case "member_done": {
          const member = session.state.members.find(
            (m) => m.modelCode === event.modelCode,
          );
          if (member) {
            member.content = event.content;
            member.status = "done";
          }
          break;
        }
        case "member_error": {
          const member = session.state.members.find(
            (m) => m.modelCode === event.modelCode,
          );
          if (member) {
            member.status = "error";
            member.errorMessage = event.message;
            member.content = event.message;
          }
          break;
        }
        case "judge_start": {
          session.state.judgment.status = "streaming";
          break;
        }
        case "judge_chunk": {
          session.state.judgment.content += event.delta;
          break;
        }
        case "judge_done": {
          session.state.judgment.content = event.content;
          session.state.judgment.status = "done";
          break;
        }
        case "error": {
          session.state.status = "error";
          break;
        }
      }
    } catch {
      // Ignore malformed events.
    }
  }

  private publishUpdate() {
    if (!this.activeSession) return;

    for (const callback of this.listeners) {
      try {
        callback(this.activeSession.state);
      } catch (error) {
        console.error("Error notifying council subscriber:", error);
      }
    }
  }

  private async persistSession(state: CouncilState, judgeModelCode: string) {
    try {
      const sessionData: CouncilSessionData = {
        id: state.sessionId,
        question: state.question,
        memberModels: state.members.map((m) => m.modelCode),
        judgeModel: judgeModelCode,
        memberResponses: state.members.map((m) => ({
          modelCode: m.modelCode,
          content: m.content,
        })),
        judgment: state.judgment.content,
        timestamp: Date.now(),
      };
      await saveCouncilSession(sessionData);
    } catch (error) {
      console.error("Failed to persist council session:", error);
    }
  }

  isRunning(): boolean {
    return this.activeSession !== null;
  }

  getSessionId(): string | undefined {
    return this.activeSession?.sessionId;
  }

  getCurrentState(): CouncilState | null {
    return this.activeSession?.state ?? null;
  }

  subscribe(onUpdate: UpdateCallback) {
    this.listeners.add(onUpdate);

    if (this.activeSession) {
      onUpdate(this.activeSession.state);
    }
  }

  unsubscribe(onUpdate?: UpdateCallback) {
    if (onUpdate) {
      this.listeners.delete(onUpdate);
    } else {
      this.listeners.clear();
    }
  }
}

export const councilManager = new CouncilManager();
export { loadCouncilSession };
