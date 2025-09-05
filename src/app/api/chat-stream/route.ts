import { NextRequest } from "next/server";
import ModelProvider from "@/models";
import { processMessageContent } from "@/utils/responseCleaner";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, model, previousMessages, images, chatId } = body;

    if (!message || !model) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get response stream from ModelProvider
    const response = await ModelProvider({
      type: model,
      query: message,
      chats: previousMessages || [],
      imageData: images,
    });

    if (!(response instanceof ReadableStream)) {
      throw new Error("Expected a ReadableStream response");
    }

    // Create a new ReadableStream that processes the content
    const processedStream = new ReadableStream({
      async start(controller) {
        try {
          const reader = response.getReader();
          let assistantMessage = "";
          const startTime = performance.now();

          // Send initial status
          controller.enqueue(
            `data: ${JSON.stringify({
              type: "status",
              chatId,
              data: { status: "processing" },
            })}\n\n`
          );

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const text =
              typeof value === "string"
                ? value
                : new TextDecoder().decode(value);
            assistantMessage += text;

            const { displayContent, reasoning } =
              processMessageContent(assistantMessage);

            // Send chunk
            controller.enqueue(
              `data: ${JSON.stringify({
                type: "chunk",
                chatId,
                data: { chunk: text, content: displayContent, reasoning },
              })}\n\n`
            );
          }

          const endTime = performance.now();
          const { displayContent, reasoning } =
            processMessageContent(assistantMessage);

          // Send completion
          controller.enqueue(
            `data: ${JSON.stringify({
              type: "complete",
              chatId,
              data: {
                content: displayContent,
                reasoning,
                startTime,
                endTime,
              },
            })}\n\n`
          );

          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.enqueue(
            `data: ${JSON.stringify({
              type: "error",
              chatId,
              data: {
                error: error instanceof Error ? error.message : "Unknown error",
              },
            })}\n\n`
          );
          controller.close();
        }
      },
    });

    return new Response(processedStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
