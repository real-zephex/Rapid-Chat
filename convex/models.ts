import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const providerValidator = v.union(v.literal("groq"), v.literal("openrouter"));

const normalizeRuntimeModel = (model: {
  model_code: string;
  provider_code: string;
  max_completion_tokens: number;
  temperature: number;
  top_p: number;
  stream: boolean;
  stop: string | null;
  provider: "groq" | "openrouter";
  active: boolean;
  image_support?: boolean;
  pdf_support?: boolean;
  reasoning?: boolean;
  system_prompt: string;
}) => {
  return {
    model_code: model.model_code,
    provider_code: model.provider_code,
    max_completion_tokens: model.max_completion_tokens,
    temperature: model.temperature,
    top_p: model.top_p,
    stream: model.stream,
    stop: model.stop,
    provider: model.provider,
    active: model.active,
    image_support: model.image_support ?? false,
    pdf_support: model.pdf_support ?? false,
    reasoning: model.reasoning ?? false,
    system_prompt: model.system_prompt,
  };
};

export const listActiveRuntimeModels = query({
  args: {},
  handler: async (ctx) => {
    const models = await ctx.db
      .query("models")
      .withIndex("by_active", (q) => q.eq("active", true))
      .take(200);

    return models.map((model) => normalizeRuntimeModel(model));
  },
});

export const getActiveRuntimeModelByCode = query({
  args: {
    model_code: v.string(),
  },
  handler: async (ctx, args) => {
    const model = await ctx.db
      .query("models")
      .withIndex("by_active_and_model_code", (q) =>
        q.eq("active", true).eq("model_code", args.model_code),
      )
      .unique();

    if (!model) {
      return null;
    }

    return normalizeRuntimeModel(model);
  },
});

export const listActiveModelInformation = query({
  args: {},
  handler: async (ctx) => {
    const models = await ctx.db
      .query("models")
      .withIndex("by_active", (q) => q.eq("active", true))
      .take(200);

    return models.map((model) => {
      return {
        model_code: model.model_code,
        display_name: model.display_name ?? model.model_code,
        description: model.description ?? "No description available.",
        image_support: model.image_support ?? false,
        pdf_support: model.pdf_support ?? false,
        type: model.type ?? "general",
        active: model.active,
        usage_count: model.usage_count ?? 0,
      };
    });
  },
});

export const incrementModelUsage = mutation({
  args: {
    model_code: v.string(),
  },
  handler: async (ctx, args) => {
    const model = await ctx.db
      .query("models")
      .withIndex("by_model_code", (q) => q.eq("model_code", args.model_code))
      .unique();

    if (!model || !model.active) {
      return { success: false, usage_count: model?.usage_count ?? 0 };
    }

    const usage_count = (model.usage_count ?? 0) + 1;
    await ctx.db.patch(model._id, {
      usage_count,
      updated_at: Date.now(),
    });

    return { success: true, usage_count };
  },
});

export const listUsageTrends = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 20, 1), 100);

    const models = await ctx.db
      .query("models")
      .withIndex("by_active_and_usage_count", (q) => q.eq("active", true))
      .order("desc")
      .take(limit);

    return models.map((model) => ({
      model_code: model.model_code,
      display_name: model.display_name ?? model.model_code,
      provider: model.provider,
      usage_count: model.usage_count ?? 0,
      image_support: model.image_support ?? false,
      pdf_support: model.pdf_support ?? false,
    }));
  },
});

export const upsertModel = mutation({
  args: {
    model_code: v.string(),
    display_name: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("reasoning"),
        v.literal("conversational"),
        v.literal("general"),
      ),
    ),
    provider_code: v.string(),
    system_prompt: v.string(),
    max_completion_tokens: v.number(),
    temperature: v.number(),
    top_p: v.number(),
    stream: v.boolean(),
    stop: v.union(v.string(), v.null()),
    provider: providerValidator,
    image_support: v.optional(v.boolean()),
    pdf_support: v.optional(v.boolean()),
    reasoning: v.optional(v.boolean()),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("models")
      .withIndex("by_model_code", (q) => q.eq("model_code", args.model_code))
      .unique();

    const now = Date.now();

    if (!existing) {
      return await ctx.db.insert("models", {
        ...args,
        usage_count: 0,
        updated_at: now,
      });
    }

    await ctx.db.patch(existing._id, {
      ...args,
      usage_count: existing.usage_count ?? 0,
      updated_at: now,
    });

    return existing._id;
  },
});
