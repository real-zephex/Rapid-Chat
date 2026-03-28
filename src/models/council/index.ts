"use server";

import { fileUploads } from "..";
import {
  fetchActiveModelByCode,
  fetchActiveModels,
} from "../database/read_models";
import ModelHandler from "../handler/generator";
import { ModelData } from "../handler/types";
import { Messages } from "../types";
import { buildJudgePrompt, JUDGE_SYSTEM_PROMPT } from "./prompts";

export type CouncilEvent =
  | { type: "member_start"; modelCode: string; modelName: string }
  | { type: "member_chunk"; modelCode: string; delta: string }
  | { type: "member_done"; modelCode: string; content: string }
  | { type: "member_error"; modelCode: string; message: string }
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

async function collectMemberResponse(
  modelCode: string,
  question: string,
  chatHistory: Messages[],
  imageData?: fileUploads[],
  signal?: AbortSignal,
): Promise<string> {
  const modelData = await resolveModel(modelCode);
  let content = "";

  const inc = {
    message: question,
    chats: chatHistory,
    imageData,
  };

  for await (const chunk of ModelHandler({ inc, model_data: modelData, signal })) {
    if (signal?.aborted) break;
    if (chunk.type === "content") {
      content += chunk.delta;
    }
  }

  return content.trim();
}

async function* generateJudgeStream(
  judgeModelCode: string,
  question: string,
  memberResponses: Array<{ modelCode: string; content: string }>,
  signal?: AbortSignal,
): AsyncGenerator<{ type: "content" | "reasoning"; delta: string }> {
  const modelData = await resolveModel(judgeModelCode);

  const judgePrompt = buildJudgePrompt(question, memberResponses);

  const inc = {
    message: judgePrompt,
    chats: [],
    imageData: undefined,
  };

  const judgeModelData: RuntimeModelData = {
    ...modelData,
    system_prompt: JUDGE_SYSTEM_PROMPT,
  };

  for await (const chunk of ModelHandler({
    inc,
    model_data: judgeModelData,
    signal,
  })) {
    if (signal?.aborted) break;
    yield chunk;
  }
}

const CouncilProvider = async ({
  question,
  memberModelCodes,
  judgeModelCode,
  chats,
  imageData,
  sessionId,
}: {
  question: string;
  memberModelCodes: string[];
  judgeModelCode: string;
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

      const memberResponses: Array<{ modelCode: string; content: string }> = [];
      const chatHistory = chats.slice(-24);

      try {
        const memberPromises = memberModelCodes.map(async (modelCode) => {
          controller.enqueue(
            serializeEvent({
              type: "member_start",
              modelCode,
              modelName: modelCode,
            }),
          );

          try {
            const content = await collectMemberResponse(
              modelCode,
              question,
              chatHistory,
              imageData,
              signal,
            );

            if (!signal.aborted) {
              controller.enqueue(
                serializeEvent({
                  type: "member_done",
                  modelCode,
                  content,
                }),
              );
              memberResponses.push({ modelCode, content });
            }
          } catch (error) {
            if (!signal.aborted) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Model failed to respond";
              controller.enqueue(
                serializeEvent({
                  type: "member_error",
                  modelCode,
                  message,
                }),
              );
              memberResponses.push({
                modelCode,
                content: `[Error: ${message}]`,
              });
            }
          }
        });

        await Promise.all(memberPromises);

        if (signal.aborted) {
          controller.close();
          return;
        }

        controller.enqueue(serializeEvent({ type: "judge_start" }));

        let judgeContent = "";
        for await (const chunk of generateJudgeStream(
          judgeModelCode,
          question,
          memberResponses,
          signal,
        )) {
          if (signal.aborted) break;
          if (chunk.type === "content") {
            judgeContent += chunk.delta;
            controller.enqueue(
              serializeEvent({
                type: "judge_chunk",
                delta: chunk.delta,
              }),
            );
          }
        }

        if (!signal.aborted) {
          controller.enqueue(
            serializeEvent({
              type: "judge_done",
              content: judgeContent.trim(),
            }),
          );
          controller.enqueue(serializeEvent({ type: "done" }));
        }
      } catch (error) {
        if (!signal.aborted) {
          console.error("Council error:", error);
          controller.enqueue(
            serializeEvent({
              type: "error",
              message:
                error instanceof Error
                  ? error.message
                  : "An error occurred during the council session",
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
