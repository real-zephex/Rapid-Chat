"use client";

import { useModel } from "@/context/ModelContext";
import { useSidebar } from "@/context/SidebarContext";
import {
  councilManager,
  type CouncilMemberState,
  type CouncilState,
} from "@/utils/councilManager";
import { loadCouncilSession } from "@/utils/councilIndexedDB";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { HiOutlineScale, HiOutlineUserGroup } from "react-icons/hi2";
import { FaStop } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";

import CouncilInput from "./council-input";
import CouncilJudgment from "./council-judgment";
import CouncilMemberCard from "./council-member-card";

interface CouncilWorkspaceProps {
  id: string;
}

const CouncilWorkspace = ({ id }: CouncilWorkspaceProps) => {
  const { models } = useModel();
  const { refreshCouncilSessions } = useSidebar();
  const router = useRouter();

  const [memberModels, setMemberModels] = useState<string[]>([]);
  const [judgeModel, setJudgeModel] = useState("");
  const [question, setQuestion] = useState("");
  const [state, setState] = useState<CouncilState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleStateUpdate = useCallback(
    (newState: CouncilState) => {
      setState(newState);
      const wasRunning = newState.status === "running";
      setIsRunning(wasRunning);

      if (newState.status === "done") {
        void refreshCouncilSessions();
      }
    },
    [refreshCouncilSessions],
  );

  useEffect(() => {
    councilManager.subscribe(handleStateUpdate);
    return () => councilManager.unsubscribe(handleStateUpdate);
  }, [handleStateUpdate]);

  useEffect(() => {
    if (models.length > 0 && memberModels.length === 0) {
      setMemberModels(models.slice(0, 3).map((m) => m.code));
      setJudgeModel(models[0].code);
    }
  }, [models]);

  useEffect(() => {
    const loadExisting = async () => {
      if (councilManager.isRunning()) return;

      const session = await loadCouncilSession(id);
      if (session) {
        setState({
          sessionId: session.id,
          question: session.question,
          members: session.memberResponses.map((r) => ({
            modelCode: r.modelCode,
            modelName: r.modelCode,
            content: r.content,
            status: "done" as const,
          })),
          judgment: { content: session.judgment, status: "done" },
          status: "done",
        });
        setQuestion(session.question);
        setMemberModels(session.memberModels);
        setJudgeModel(session.judgeModel);
      }
    };

    loadExisting();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state?.judgment.content?.length, state?.members?.map((m) => m.content.length).join(",")]);

  const handleSubmit = () => {
    if (!question.trim() || isRunning) return;
    if (memberModels.length < 2) return;

    const sessionId = id || uuidv4();

    setState({
      sessionId,
      question: question.trim(),
      members: memberModels.map((code) => ({
        modelCode: code,
        modelName: models.find((m) => m.code === code)?.name || code,
        content: "",
        status: "pending" as const,
      })),
      judgment: { content: "", status: "pending" as const },
      status: "running",
    });
    setIsRunning(true);

    councilManager.startCouncil(
      sessionId,
      question.trim(),
      memberModels,
      judgeModel,
      [],
    );
  };

  const handleStop = async () => {
    await councilManager.stopCouncil();
  };

  const handleNewCouncil = () => {
    const newId = uuidv4();
    setState(null);
    setQuestion("");
    setIsRunning(false);
    router.push(`/council/${newId}`);
  };

  const hasResults = state && (state.members.some((m) => m.content) || state.judgment.content);

  return (
    <section className="relative flex h-dvh min-h-0 flex-col overflow-hidden bg-background">
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-2.5">
          <HiOutlineUserGroup size={16} className="text-accent" />
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-primary">
            AI Council
          </span>
          {isRunning && (
            <span className="inline-flex items-center rounded-md bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-accent animate-pulse">
              In Session
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isRunning && (
            <button
              type="button"
              onClick={handleStop}
              className="flex items-center gap-1.5 rounded-lg border border-error/30 bg-error/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-error transition-colors hover:bg-error/20"
            >
              <FaStop size={10} />
              Stop
            </button>
          )}
          {hasResults && !isRunning && (
            <button
              type="button"
              onClick={handleNewCouncil}
              className="rounded-lg border border-border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              New Session
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 py-6">
          {!state && (
            <div className="flex flex-col items-center justify-center py-20 text-text-muted/70">
              <HiOutlineScale size={40} className="mb-4 text-accent/50" />
              <h2 className="text-lg font-semibold text-text-secondary mb-2">
                AI Council
              </h2>
              <p className="text-sm text-text-muted max-w-md text-center">
                Select 2-5 AI models to act as council members, choose a judge
                model to synthesize their responses, then ask a question below.
              </p>
            </div>
          )}

          {state && (
            <div className="space-y-6">
              {state.question && (
                <div className="rounded-xl border border-border bg-surface px-5 py-3.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted mb-1">
                    Question
                  </p>
                  <p className="text-sm text-text-primary leading-relaxed">
                    {state.question}
                  </p>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HiOutlineUserGroup size={14} className="text-text-muted" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                    Council Members
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {state.members.map((member: CouncilMemberState) => (
                    <CouncilMemberCard
                      key={member.modelCode}
                      modelCode={member.modelCode}
                      modelName={
                        models.find((m) => m.code === member.modelCode)?.name ||
                        member.modelName
                      }
                      content={member.content}
                      status={member.status}
                      errorMessage={member.errorMessage}
                    />
                  ))}
                </div>
              </div>

              <CouncilJudgment
                content={state.judgment.content}
                status={state.judgment.status}
                judgeModel={
                  models.find((m) => m.code === judgeModel)?.name || judgeModel
                }
              />

              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      <CouncilInput
        memberModels={memberModels}
        judgeModel={judgeModel}
        question={question}
        isRunning={isRunning}
        onMemberModelsChange={setMemberModels}
        onJudgeModelChange={setJudgeModel}
        onQuestionChange={setQuestion}
        onSubmit={handleSubmit}
      />
    </section>
  );
};

export default CouncilWorkspace;
