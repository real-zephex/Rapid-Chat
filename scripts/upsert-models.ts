import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { ConvexHttpClient } from "convex/browser";

type Provider = "groq" | "openrouter";
type ModelType = "reasoning" | "conversational" | "general";

type UpsertModelPayload = {
  model_code: string;
  display_name?: string;
  description?: string;
  type?: ModelType;
  provider_code: string;
  system_prompt: string;
  max_completion_tokens: number;
  temperature: number;
  top_p: number;
  stream: boolean;
  stop: string | null;
  provider: Provider;
  image_support?: boolean;
  pdf_support?: boolean;
  reasoning?: boolean;
  active: boolean;
};

type CLIOptions = {
  filePath?: string;
  interactive: boolean;
  showHelp: boolean;
};

const DEFAULTS = {
  type: "general" as ModelType,
  max_completion_tokens: 8192,
  temperature: 1,
  top_p: 1,
  stream: true,
  stop: null as string | null,
  image_support: false,
  pdf_support: false,
  reasoning: false,
  active: true,
};

const HELP_TEXT = `
Upsert models into Convex.

Usage:
  bun run scripts/upsert-models.ts --interactive
  bun run scripts/upsert-models.ts --file ./models.json

Options:
  -i, --interactive   Prompt for one model interactively
  -f, --file <path>   Read one or more models from JSON file
  -h, --help          Show this help

JSON shape (single object, array, or { "models": [...] }):
{
  "model_code": "sonar_pro",
  "display_name": "Sonar Pro",
  "description": "Fast model for synthesis",
  "type": "general",
  "provider_code": "perplexity/sonar-pro",
  "system_prompt": "You are a helpful assistant.",
  "max_completion_tokens": 8192,
  "temperature": 0.7,
  "top_p": 1,
  "stream": true,
  "stop": null,
  "provider": "openrouter",
  "image_support": false,
  "pdf_support": false,
  "reasoning": true,
  "active": true
}
`;

function parseArgs(argv: string[]): CLIOptions {
  const options: CLIOptions = {
    interactive: false,
    showHelp: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "-h" || arg === "--help") {
      options.showHelp = true;
      continue;
    }

    if (arg === "-i" || arg === "--interactive") {
      options.interactive = true;
      continue;
    }

    if (arg === "-f" || arg === "--file") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("Missing value for --file option");
      }
      options.filePath = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  return options;
}

function getConvexClient() {
  const convexUrl =
    process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL;

  if (!convexUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_CONVEX_URL (or CONVEX_URL) in environment.",
    );
  }

  return new ConvexHttpClient(convexUrl, { logger: false });
}

function asString(
  value: unknown,
  field: string,
  required = true,
): string | undefined {
  if (value === undefined || value === null) {
    if (required) {
      throw new Error(`Missing required field: ${field}`);
    }
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(`Field '${field}' must be a string`);
  }

  const normalized = value.trim();
  if (required && normalized.length === 0) {
    throw new Error(`Field '${field}' cannot be empty`);
  }

  return normalized.length === 0 ? undefined : normalized;
}

function asNumber(value: unknown, field: string, fallback: number): number {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const normalized = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(normalized)) {
    throw new Error(`Field '${field}' must be a valid number`);
  }

  return normalized;
}

function asBoolean(value: unknown, field: string, fallback: boolean): boolean {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "y"].includes(normalized)) {
      return true;
    }
    if (["false", "0", "no", "n"].includes(normalized)) {
      return false;
    }
  }

  throw new Error(`Field '${field}' must be a boolean`);
}

function asProvider(value: unknown): Provider {
  const provider = asString(value, "provider") as string;

  if (provider !== "groq" && provider !== "openrouter") {
    throw new Error("Field 'provider' must be 'groq' or 'openrouter'");
  }

  return provider;
}

function asModelType(value: unknown): ModelType | undefined {
  if (value === undefined || value === null || value === "") {
    return DEFAULTS.type;
  }

  const type = asString(value, "type") as string;
  if (type !== "reasoning" && type !== "conversational" && type !== "general") {
    throw new Error(
      "Field 'type' must be 'reasoning', 'conversational', or 'general'",
    );
  }

  return type;
}

function normalizeModelPayload(input: unknown): UpsertModelPayload {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Each model entry must be an object");
  }

  const candidate = input as Record<string, unknown>;

  const payload: UpsertModelPayload = {
    model_code: asString(candidate.model_code, "model_code") as string,
    display_name: asString(candidate.display_name, "display_name", false),
    description: asString(candidate.description, "description", false),
    type: asModelType(candidate.type),
    provider_code: asString(candidate.provider_code, "provider_code") as string,
    system_prompt: asString(candidate.system_prompt, "system_prompt") as string,
    max_completion_tokens: asNumber(
      candidate.max_completion_tokens,
      "max_completion_tokens",
      DEFAULTS.max_completion_tokens,
    ),
    temperature: asNumber(
      candidate.temperature,
      "temperature",
      DEFAULTS.temperature,
    ),
    top_p: asNumber(candidate.top_p, "top_p", DEFAULTS.top_p),
    stream: asBoolean(candidate.stream, "stream", DEFAULTS.stream),
    stop:
      candidate.stop === undefined ||
      candidate.stop === null ||
      candidate.stop === ""
        ? DEFAULTS.stop
        : (asString(candidate.stop, "stop") as string),
    provider: asProvider(candidate.provider),
    image_support: asBoolean(
      candidate.image_support,
      "image_support",
      DEFAULTS.image_support,
    ),
    pdf_support: asBoolean(
      candidate.pdf_support,
      "pdf_support",
      DEFAULTS.pdf_support,
    ),
    reasoning: asBoolean(candidate.reasoning, "reasoning", DEFAULTS.reasoning),
    active: asBoolean(candidate.active, "active", DEFAULTS.active),
  };

  return payload;
}

function extractModelsFromFileContent(content: string): unknown[] {
  const parsed = JSON.parse(content) as unknown;

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (parsed && typeof parsed === "object") {
    const record = parsed as Record<string, unknown>;
    if (Array.isArray(record.models)) {
      return record.models;
    }
    return [record];
  }

  throw new Error(
    "JSON file must contain an object, an array, or { models: [...] }",
  );
}

async function readInteractiveModel(): Promise<UpsertModelPayload> {
  const rl = createInterface({ input, output });

  const ask = async (label: string, fallback?: string) => {
    const prompt = fallback ? `${label} [${fallback}]: ` : `${label}: `;
    const answer = (await rl.question(prompt)).trim();
    return answer.length === 0 ? (fallback ?? "") : answer;
  };

  try {
    const payload = normalizeModelPayload({
      model_code: await ask("Model code (unique)"),
      display_name: await ask("Display name", ""),
      description: await ask("Description", ""),
      type: await ask("Type (reasoning/conversational/general)", DEFAULTS.type),
      provider_code: await ask("Provider model code"),
      provider: await ask("Provider (groq/openrouter)", "openrouter"),
      system_prompt: await ask("System prompt"),
      max_completion_tokens: await ask(
        "Max completion tokens",
        String(DEFAULTS.max_completion_tokens),
      ),
      temperature: await ask("Temperature", String(DEFAULTS.temperature)),
      top_p: await ask("Top P", String(DEFAULTS.top_p)),
      stream: await ask("Stream", String(DEFAULTS.stream)),
      stop: await ask("Stop sequence (blank for null)", ""),
      image_support: await ask(
        "Image support (true/false)",
        String(DEFAULTS.image_support),
      ),
      pdf_support: await ask(
        "PDF support (true/false)",
        String(DEFAULTS.pdf_support),
      ),
      reasoning: await ask(
        "Reasoning support (true/false)",
        String(DEFAULTS.reasoning),
      ),
      active: await ask("Active (true/false)", String(DEFAULTS.active)),
    });

    return payload;
  } finally {
    rl.close();
  }
}

async function upsertModels(payloads: UpsertModelPayload[]) {
  const client = getConvexClient();

  for (const payload of payloads) {
    await client.mutation("models:upsertModel" as any, payload);
    console.log(
      `Upserted model '${payload.model_code}' (${payload.provider}).`,
    );
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.showHelp) {
    console.log(HELP_TEXT.trim());
    return;
  }

  if (options.filePath) {
    const absolutePath = resolve(process.cwd(), options.filePath);
    if (!existsSync(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`);
    }

    const raw = readFileSync(absolutePath, "utf-8");
    const entries = extractModelsFromFileContent(raw);
    const payloads = entries.map((entry, index) => {
      try {
        return normalizeModelPayload(entry);
      } catch (error) {
        throw new Error(
          `Error in file entry #${index + 1}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    });

    await upsertModels(payloads);
    console.log(`Finished upserting ${payloads.length} model(s).`);
    return;
  }

  if (options.interactive || !options.filePath) {
    const payload = await readInteractiveModel();
    await upsertModels([payload]);
    console.log("Finished upserting 1 model.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
