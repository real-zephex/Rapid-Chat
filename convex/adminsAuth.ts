"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

type AdminDoc = {
  _id: { toString(): string };
  email: string;
  password_hash: string;
  created_at: number;
};

type VerifyResult = { adminId: string; email: string } | null;

export const verifyAdmin = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args): Promise<VerifyResult> => {
    const admin = (await ctx.runQuery(internal.admins.getByEmail, {
      email: args.email,
    })) as AdminDoc | null;

    if (!admin) return null;

    const valid: boolean = await bcrypt.compare(args.password, admin.password_hash);
    if (!valid) return null;

    return { adminId: admin._id.toString(), email: admin.email };
  },
});
