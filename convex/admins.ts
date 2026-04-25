import { internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Public — just a boolean, safe to expose
export const adminExists = query({
  args: {},
  handler: async (ctx) => {
    const admin = await ctx.db.query("admins").first();
    return !!admin;
  },
});

// Internal — only callable from Convex actions, never exposed publicly
export const getByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

// Only succeeds when no admin exists yet (first-time setup)
export const createAdmin = mutation({
  args: {
    email: v.string(),
    password_hash: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("admins").first();
    if (existing) throw new Error("An admin account already exists.");
    return await ctx.db.insert("admins", {
      email: args.email,
      password_hash: args.password_hash,
      created_at: Date.now(),
    });
  },
});
