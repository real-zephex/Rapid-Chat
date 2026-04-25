import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;

  if (provider === "groq") {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "GROQ_API_KEY not set." }, { status: 500 });

    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await res.json();
    const models = (data.data as any[]).map((m) => ({ id: m.id, name: m.id, provider: "groq" }));
    return NextResponse.json(models);
  }

  if (provider === "openrouter") {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "OPENROUTER_API_KEY not set." }, { status: 500 });

    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await res.json();
    const models = (data.data as any[]).map((m) => ({ id: m.id, name: m.name || m.id, provider: "openrouter" }));
    return NextResponse.json(models);
  }

  return NextResponse.json({ error: "Unknown provider." }, { status: 400 });
}
