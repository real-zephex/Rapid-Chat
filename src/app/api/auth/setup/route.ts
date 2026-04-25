import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const exists = await convex.query(api.admins.adminExists, {});
    if (exists) {
      return NextResponse.json({ error: "An admin account already exists." }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 12);
    await convex.mutation(api.admins.createAdmin, { email, password_hash });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[setup]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
