"use server";

import { fileUploads } from "..";
import {
  fetchActiveModelByCode,
  fetchActiveModels,
} from "../database/read_models";
import ModelHandler from "../handler/generator";
import { ModelData } from "../handler/types";
import { Messages } from "../types";

export type CouncilEvent =
  | { type: "round_start"; round: number; totalRounds: number }
  | { type: "member_turn_start"; modelCode: string; modelName: string; round: number }
  | { type: "member_chunk"; modelCode: string; delta: string; round: number }
  | { type: "member_turn_done"; modelCode: string; content: string; round: number }
  | { type: "member_turn_error"; modelCode: string; message: string; round: number }
  | { type: "judge_start" }
  | { type: "judge_chunk"; delta: string }
  | { type: "judge_done"; content: string }
  | { type: "error"; message: string }
  | { type: "done" };

type RuntimeModelData = ModelData & { active: boolean };

const fallbackModel: RuntimeModelData = {
  model_code: "scout",
  provider_code: "meta-llama/llama-4-scout-17b-16e-instruct",
  max_completion_tokens: 8192,
  temperature: 1,
  top_p: 1,
  stream: true,
  stop: null,
  image_support: true,
  pdf_support: false,
  reasoning: false,
  system_prompt:
    "You are Scout. You are a helpful, knowledgeable, and friendly AI assistant designed to provide clear, natural, and supportive conversations.",
  provider: "groq" as "groq" | "openrouter",
  active: true,
};

const controllers = new Map<string, AbortController>();
const serializeEvent = (event: CouncilEvent) => `${JSON.stringify(event)}\n`;

async function resolveModel(modelCode: string): Promise<RuntimeModelData> {
  const model = await fetchActiveModelByCode(modelCode);
  if (model) return model;
  const models = await fetchActiveModels();
  const match = models.find((m) => m.model_code === modelCode);
  if (match) return match;
  return fallbackModel;
}

function buildConversationHistory(
  question: string,
  allTurns: Array<{ modelCode: string; modelName: string; round: number; content: string }>,
  currentRound: number,
  totalRounds: number,
): string {
  const lines: string[] = [`Original Question: ${question}\n`];

  if (allTurns.length === 0) {
    lines.push("This is the first response. No prior discussion yet.");
    return lines.join("\n");
  }

  let currentRoundStart = 1;
  for (const turn of allTurns) {
    if (turn.round > currentRoundStart) {
      lines.push(`--- End of Round ${currentRoundStart} ---`);
      currentRoundStart = turn.round;
    }
    lines.push(`${turn.modelName}: ${turn.content}`);
  }

  lines.push(`\nCurrent Round: ${currentRound} of ${totalRounds}`);
  lines.push("Build on the previous discussion. Reference and respond to the points made by other models.");

  return lines.join("\n\n");
}

async function* streamMemberResponse(
  modelCode: string,
  systemPrompt: string,
  userPrompt: string,
  chatHistory: Messages[],
  imageData: fileUploads[] | undefined,
  signal: AbortSignal | undefined,
): AsyncGenerator<string> {
  const modelData = await resolveModel(modelCode);
  const inc = {
    message: userPrompt,
    chats: chatHistory,
    imageData,
  };

  const modelWithSystem: RuntimeModelData = {
    ...modelData,
    system_prompt: systemPrompt,
  };

  for await (const chunk of ModelHandler({ inc, model_data: modelWithSystem, signal })) {
    if (signal?.aborted) break;
    if (chunk.type === "content") {
      yield chunk.delta;
    }
  }
}

const COUNCIL_MEMBER_SYSTEM_PROMPT = `You are a member of an AI Council. You will participate in a structured multi-round debate with other AI models.

Guidelines:
- Keep responses focused and substantive
- Reference and build upon points made by other council members in previous rounds
- If you agree with a previous point, say so and extend it
- If you disagree, explain your reasoning respectfully
- Be concise — quality over quantity
- Adapt your position as new information emerges from other members`;

const JUDGE_SYSTEM_PROMPT = `You are the presiding judge of an AI Council. Multiple AI models have debated the user's question over multiple rounds. Your role is to synthesize their discussion into a single, authoritative final judgment.

Instructions:
- Carefully analyze each model's contributions across all rounds for strengths, weaknesses, and unique insights
- Identify areas of agreement and disagreement between the models
- Resolve disagreements by weighing the reasoning quality of each position
- Combine the strongest arguments into a cohesive, well-structured answer
- If models disagree significantly, acknowledge the disagreement and explain which position you find most compelling and why
- Reference which models contributed key insights where it adds credibility
- Your judgment should be comprehensive yet concise — aim for clarity over verbosity
- Format your response using markdown for readability`;

function buildJudgePrompt(
  question: string,
  allTurns: Array<{ modelCode: string; modelName: string; round: number; content: string }>,
): string {
  const lines: string[] = [`## User's Question\n\n${question}\n`];

  let currentRound = 1;
  for (const turn of allTurns) {
    if (turn.round > currentRound) {
      lines.push(`--- End of Round ${currentRound} ---`);
      currentRound = turn.round;
    }
    lines.push(`### ${turn.modelName} (Round ${turn.round})\n\n${turn.content}`);
  }

  lines.push("\n---\nBased on the above multi-round debate, provide your final synthesized judgment.");

  return lines.join("\n\n");
}

const CouncilProvider = async ({
  question,
  memberModelCodes,
  judgeModelCode,
  rounds = 2,
  chats,
  imageData,
  sessionId,
}: {
  question: string;
  memberModelCodes: string[];
  judgeModelCode: string;
  rounds?: number;
  chats: Messages[];
  imageData?: fileUploads[];
  sessionId?: string;
}): Promise<ReadableStream<string>> => {
  return new ReadableStream<string>({
    async start(controller) {
      const abortController = new AbortController();
      const { signal } = abortController;

      if (sessionId) {
        controllers.set(sessionId, abortController);
      }

      const allTurns: Array<{ modelCode: string; modelName: string; round: number; content: string }> = [];
      const chatHistory = chats.slice(-24);

      try {
        for (let round = 1; round <= rounds; round++) {
          if (signal.aborted) break;

          controller.enqueue(serializeEvent({ type: "round_start", round, totalRounds: rounds }));

          for (const modelCode of memberModelCodes) {
            if (signal.aborted) break;

            const modelName = modelCode;
            controller.enqueue(
              serializeEvent({ type: "member_turn_start", modelCode, modelName, round }),
            );

            const conversationHistory = buildConversationHistory(
              question,
              allTurns,
              round,
              rounds,
            );

            try {
              let content = "";
              for await (const delta of streamMemberResponse(
                modelCode,
                COUNCIL_MEMBER_SYSTEM_PROMPT,
                conversationHistory,
                chatHistory,
                imageData,
                signal,
              )) {
                if (signal.aborted) break;
                content += delta;
                controller.enqueue(
                  serializeEvent({ type: "member_chunk", modelCode, delta, round }),
                );
              }

              if (!signal.aborted) {
                content = content.trim();
                controller.enqueue(
                  serializeEvent({ type: "member_turn_done", modelCode, content, round }),
                );
                allTurns.push({ modelCode, modelName, round, content });
              }
            } catch (error) {
              if (!signal.aborted) {
                const message = error instanceof Error ? error.message : "Model failed to respond";
                controller.enqueue(
                  serializeEvent({ type: "member_turn_error", modelCode, message, round }),
                );
                allTurns.push({ modelCode, modelName, round, content: `[Error: ${message}]` });
              }
            }
          }
        }

        if (signal.aborted) {
          controller.close();
          return;
        }

        controller.enqueue(serializeEvent({ type: "judge_start" }));

        let judgeContent = "";
        const judgePrompt = buildJudgePrompt(question, allTurns);
        const judgeModelData = await resolveModel(judgeModelCode);

        for await (const delta of streamMemberResponse(
          judgeModelCode,
          JUDGE_SYSTEM_PROMPT,
          judgePrompt,
          chatHistory,
          imageData,
          signal,
        )) {
          if (signal.aborted) break;
          judgeContent += delta;
          controller.enqueue(serializeEvent({ type: "judge_chunk", delta }));
        }

        if (!signal.aborted) {
          controller.enqueue(
            serializeEvent({ type: "judge_done", content: judgeContent.trim() }),
          );
          controller.enqueue(serializeEvent({ type: "done" }));
        }
      } catch (error) {
        if (!signal.aborted) {
          console.error("Council error:", error);
          controller.enqueue(
            serializeEvent({
              type: "error",
              message: error instanceof Error ? error.message : "An error occurred during the council session",
            }),
          );
        }
      } finally {
        if (sessionId) {
          controllers.delete(sessionId);
        }
        controller.close();
      }
    },
    cancel() {
      if (sessionId) {
        const controller = controllers.get(sessionId);
        if (controller) {
          controller.abort("User cancelled");
          controllers.delete(sessionId);
        }
      }
    },
  });
};

export async function cancelCouncil(sessionId: string) {
  const controller = controllers.get(sessionId);
  if (controller) {
    controller.abort("User cancelled");
    controllers.delete(sessionId);
    return true;
  }
  return false;
}

export default CouncilProvider;
