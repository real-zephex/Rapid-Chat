import CouncilProvider, { cancelCouncil, type CouncilEvent } from "@/models/council";
import {
  saveCouncilSession,
  loadCouncilSession,
  type CouncilSessionData,
} from "@/utils/councilIndexedDB";

export type CouncilTurnState = {
  modelCode: string;
  modelName: string;
  round: number;
  content: string;
  status: "waiting" | "streaming" | "done" | "error";
  errorMessage?: string;
};

export type CouncilState = {
  sessionId: string;
  question: string;
  rounds: number;
  currentRound: number;
  turns: CouncilTurnState[];
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
    rounds: number = 2,
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
      rounds,
      currentRound: 0,
      turns: [],
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
      rounds,
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
    rounds: number,
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
        rounds,
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
        case "round_start": {
          session.state.currentRound = event.round;
          break;
        }
        case "member_turn_start": {
          session.state.turns = [
            ...session.state.turns,
            {
              modelCode: event.modelCode,
              modelName: event.modelName || event.modelCode,
              round: event.round,
              content: "",
              status: "streaming" as const,
            },
          ];
          break;
        }
        case "member_chunk": {
          const turn = session.state.turns[session.state.turns.length - 1];
          if (turn && turn.modelCode === event.modelCode) {
            turn.content += event.delta;
          }
          break;
        }
        case "member_turn_done": {
          const turn = session.state.turns[session.state.turns.length - 1];
          if (turn && turn.modelCode === event.modelCode) {
            turn.content = event.content;
            turn.status = "done";
          }
          break;
        }
        case "member_turn_error": {
          const turn = session.state.turns[session.state.turns.length - 1];
          if (turn && turn.modelCode === event.modelCode) {
            turn.status = "error";
            turn.errorMessage = event.message;
            turn.content = event.message;
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

    const state = this.activeSession.state;
    const freshState: CouncilState = {
      ...state,
      turns: state.turns.map((t) => ({ ...t })),
      judgment: { ...state.judgment },
    };

    for (const callback of this.listeners) {
      try {
        callback(freshState);
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
        memberModels: [],
        judgeModel: judgeModelCode,
        rounds: state.rounds,
        turns: state.turns.map((t) => ({
          modelCode: t.modelCode,
          modelName: t.modelName,
          round: t.round,
          content: t.content,
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
