import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const providerValidator = v.union(v.literal("groq"), v.literal("openrouter"));
const modelTypeValidator = v.union(
  v.literal("reasoning"),
  v.literal("conversational"),
  v.literal("general"),
);

export default defineSchema({
  admins: defineTable({
    email: v.string(),
    password_hash: v.string(),
    created_at: v.number(),
  }).index("by_email", ["email"]),

  models: defineTable({
    model_code: v.string(),
    display_name: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(modelTypeValidator),
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
    usage_count: v.number(),
    updated_at: v.optional(v.number()),
  })
    .index("by_model_code", ["model_code"])
    .index("by_active", ["active"])
    .index("by_active_and_model_code", ["active", "model_code"])
    .index("by_active_and_usage_count", ["active", "usage_count"]),
});
