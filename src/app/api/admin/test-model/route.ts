import { NextResponse } from "next/server";
import { fetchActiveModelByCode } from "@/models/database/read_models";
import ModelHandler from "@/models/handler/generator";

export async function POST(request: Request) {
  let model_code: string;

  try {
    const body = (await request.json()) as { model_code?: string };
    model_code = body.model_code || "";
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
  }

  if (!model_code) {
    return NextResponse.json({ success: false, error: "model_code is required." }, { status: 400 });
  }

  const modelData = await fetchActiveModelByCode(model_code);

  if (!modelData) {
    return NextResponse.json({ success: false, error: `Model "${model_code}" not found.` }, { status: 404 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    let response = "";

    for await (const chunk of ModelHandler({
      inc: {
        message: "Reply with exactly one word: hello",
        chats: [],
      },
      model_data: modelData,
      signal: controller.signal,
    })) {
      if (chunk.type === "content") {
        response += chunk.delta;
      }
    }

    clearTimeout(timeout);

    return NextResponse.json({
      success: true,
      response: response.trim() || "(empty response)",
    });
  } catch (error) {
    clearTimeout(timeout);

    if (controller.signal.aborted) {
      return NextResponse.json({ success: false, error: "Test timed out after 20 seconds." }, { status: 504 });
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error during test.",
    }, { status: 500 });
  }
}
