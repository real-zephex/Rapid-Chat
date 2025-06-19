import FlashLite from "@/models/google/gemini-2.5-flash-lite";
import CompoundBeta from "@/models/groq/compound";
import LlamaScout from "@/models/groq/llama-scout";
import Qwen from "@/models/groq/qwen";
import Deepseek from "@/models/openrouter/deepseek";
import Devstral from "@/models/openrouter/devstral";
import Phi4 from "@/models/openrouter/phi-4-reasoning";
import Phi4Plus from "@/models/openrouter/phi-4-reasoning-plus";
import Sarvam from "@/models/openrouter/sarvam";
import { NextRequest } from "next/server";
import { models } from "../../utils/model-list";
// export const models = [
//   "compound",
//   "flash",
//   "qwen",
//   "scout",
//   "devstral",
//   "deepseek",
//   "phi4",
//   "phi4plus",
//   "sarvam",
// ];
const mappings = {
  compound: CompoundBeta,
  flash: FlashLite,
  qwen: Qwen,
  scout: LlamaScout,
  devstral: Devstral,
  deepseek: Deepseek,
  phi4: Phi4,
  phi4plus: Phi4Plus,
  sarvam: Sarvam,
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url).searchParams;

  const model = url.get("model") as keyof typeof mappings;
  const query = url.get("message") as string;

  const allowedHosts = ["localhost", "127.0.0.1", "::1"];
  const reqHost = req.headers.get("host")?.split(":")[0];
  if (!reqHost || !allowedHosts.includes(reqHost)) {
    console.log("error occured");
    return Response.json({ message: "Access denied" }, { status: 403 });
  }
  console.log(model, query);

  if (!model || !query) {
    console.log("error occured - 2");
    return Response.json(
      { message: "please provide valid inputs" },
      { status: 501 }
    );
  }

  if (!models.includes(model)) {
    console.log("error occured - 3");
    return Response.json({ message: "Invalid model" }, { status: 404 });
  }
  const fin = mappings[model];

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of fin(query)) {
          if (chunk.length > 0) {
            controller.enqueue(`${chunk}`);
          }
        }
        controller.close();
      } catch (error) {
        console.error(error);
        controller.enqueue("event: error\n");
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
