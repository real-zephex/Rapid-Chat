import { action, query } from "./_generated/server";
import { v } from "convex/values";

// Lists all models (active + inactive) for the admin dashboard.
// Protected at the network level by the JWT middleware.
export const listAllModels = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("models").collect();
  },
});

// Fetches available models directly from Groq / OpenRouter APIs.
export const fetchExternalModels = action({
  args: {
    provider: v.union(v.literal("groq"), v.literal("openrouter")),
  },
  handler: async (_ctx, args) => {
    if (args.provider === "groq") {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) throw new Error("GROQ_API_KEY is not set in Convex environment.");

      const res = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const data = await res.json();
      return (data.data as any[]).map((m) => ({
        id: m.id,
        name: m.id,
        provider: "groq",
      }));
    } else {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set in Convex environment.");

      const res = await fetch("https://openrouter.ai/api/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const data = await res.json();
      return (data.data as any[]).map((m) => ({
        id: m.id,
        name: m.name || m.id,
        provider: "openrouter",
      }));
    }
  },
});
