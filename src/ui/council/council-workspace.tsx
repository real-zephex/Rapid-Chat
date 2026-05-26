"use client";

import { useModel } from "@/context/ModelContext";
import { useSidebar } from "@/context/SidebarContext";
import {
  councilManager,
  type CouncilTurnState,
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
import CouncilTurnMessage from "./council-member-card";

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
  const [rounds, setRounds] = useState(2);
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
        setRounds(session.rounds || 1);
        setState({
          sessionId: session.id,
          question: session.question,
          rounds: session.rounds || 1,
          currentRound: session.rounds || 1,
          turns: (session.turns || []).map((t) => ({
            modelCode: t.modelCode,
            modelName: t.modelName || t.modelCode,
            round: t.round,
            content: t.content,
            status: "done" as const,
          })),
          judgment: { content: session.judgment, status: "done" as const },
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
  }, [state?.judgment.content?.length, state?.turns?.length]);

  const handleSubmit = () => {
    if (!question.trim() || isRunning) return;
    if (memberModels.length < 2) return;

    const sessionId = id || uuidv4();

    setState({
      sessionId,
      question: question.trim(),
      rounds,
      currentRound: 0,
      turns: [],
      judgment: { content: "", status: "pending" },
      status: "running",
    });
    setIsRunning(true);

    councilManager.startCouncil(
      sessionId,
      question.trim(),
      memberModels,
      judgeModel,
      [],
      rounds,
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
    setRounds(2);
    router.push(`/council/${newId}`);
  };

  const hasTurns = state && state.turns.length > 0;
  const hasJudgment = state && state.judgment.content;
  const hasResults = hasTurns || hasJudgment;

  const currentRound = state?.currentRound || 0;

  const sortedTurns = state
    ? [...state.turns].sort((a, b) => {
        if (a.round !== b.round) return a.round - b.round;
        const aIdx = memberModels.indexOf(a.modelCode);
        const bIdx = memberModels.indexOf(b.modelCode);
        return aIdx - bIdx;
      })
    : [];

  const roundNumbers = state ? Array.from({ length: state.rounds }, (_, i) => i + 1) : [];

  return (
    <section className="relative flex h-dvh min-h-0 flex-col overflow-hidden bg-background">
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-2.5">
          <HiOutlineUserGroup size={16} className="text-accent" />
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-primary">
            AI Council
          </span>
          {isRunning && (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-accent">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Round {currentRound} of {state?.rounds || rounds}
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
        <div className="mx-auto max-w-3xl px-4 py-6">
          {!state && (
            <div className="flex flex-col items-center justify-center py-20 text-text-muted/70">
              <HiOutlineScale size={40} className="mb-4 text-accent/50" />
              <h2 className="text-lg font-semibold text-text-secondary mb-2">
                AI Council
              </h2>
              <p className="text-sm text-text-muted max-w-md text-center">
                Select 2-5 AI models as council members, choose a judge, set the
                number of debate rounds, then ask a question.
              </p>
            </div>
          )}

          {state && (
            <div className="space-y-1">
              {state.question && (
                <div className="flex gap-3 pb-6">
                  <div className="flex flex-col items-center gap-1.5 pt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                    <div className="w-px flex-1 bg-border/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-text-primary">You</span>
                    </div>
                    <div className="rounded-xl border border-border bg-surface px-4 py-3">
                      <p className="text-sm text-text-primary leading-relaxed">
                        {state.question}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {roundNumbers.map((rn) => {
                const roundTurns = sortedTurns.filter((t) => t.round === rn);
                const isCurrentRound = rn === currentRound && isRunning;
                const isPastRound = rn < currentRound || !isRunning;
                const isVisible = isPastRound || isCurrentRound;

                if (!isVisible && roundTurns.length === 0) return null;

                return (
                  <div key={rn} className="relative">
                    <div className="flex items-center gap-3 py-2 mb-2">
                      <div className="flex-1 h-px bg-border/30" />
                      <span
                        className={`text-[10px] font-bold uppercase tracking-[0.16em] ${
                          isCurrentRound
                            ? "text-accent"
                            : "text-text-muted"
                        }`}
                      >
                        {isCurrentRound ? "Current Round" : `Round ${rn} of ${state.rounds}`}
                      </span>
                      <div className="flex-1 h-px bg-border/30" />
                    </div>

                    <div className="space-y-1">
                      {roundTurns.map((turn) => (
                        <CouncilTurnMessage
                          key={`${turn.modelCode}-${turn.round}`}
                          modelCode={turn.modelCode}
                          modelName={
                            models.find((m) => m.code === turn.modelCode)?.name ||
                            turn.modelName
                          }
                          round={turn.round}
                          totalRounds={state.rounds}
                          content={turn.content}
                          status={turn.status}
                          errorMessage={turn.errorMessage}
                        />
                      ))}

                      {isCurrentRound && roundTurns.length === 0 && (
                        <div className="flex gap-3 py-2">
                          <div className="flex flex-col items-center gap-1.5 pt-2">
                            <div className="w-2 h-2 rounded-full bg-border animate-pulse" />
                          </div>
                          <div className="flex-1">
                            <div className="rounded-xl border border-border/40 bg-surface/30 px-4 py-3">
                              <p className="text-sm text-text-muted italic">
                                Council is convening...
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {isCurrentRound && roundTurns.length > 0 && (
                        <div className="flex gap-3 py-2">
                          <div className="flex flex-col items-center gap-1.5 pt-2">
                            <div className="w-2 h-2 rounded-full bg-border/40" />
                          </div>
                          <div className="flex-1">
                            <div className="rounded-xl border border-border/30 bg-surface/20 px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-border animate-pulse" />
                                <span className="text-sm text-text-muted italic">
                                  Awaiting next speaker...
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {state.judgment.status !== "pending" && (
                <div className="pt-4">
                  <CouncilJudgment
                    content={state.judgment.content}
                    status={state.judgment.status}
                    judgeModel={
                      models.find((m) => m.code === judgeModel)?.name || judgeModel
                    }
                  />
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      <CouncilInput
        memberModels={memberModels}
        judgeModel={judgeModel}
        question={question}
        rounds={rounds}
        isRunning={isRunning}
        onMemberModelsChange={setMemberModels}
        onJudgeModelChange={setJudgeModel}
        onQuestionChange={setQuestion}
        onRoundsChange={setRounds}
        onSubmit={handleSubmit}
      />
    </section>
  );
};

export default CouncilWorkspace;
