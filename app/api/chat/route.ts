import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { wrapModelWithMemWal } from "@/lib/memwal";

export async function POST(req: Request) {
  try {
    const { messages, memoryEnabled } = await req.json();

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "Missing GOOGLE_GENERATIVE_AI_API_KEY in environment",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const modelId = process.env.TUSK_MODEL_ID || "gemini-3.8-flash";
    let model = google(modelId);

    // M2 Quick-Win: wrap model with withMemWal if memory is enabled
    if (memoryEnabled !== false) {
      model = wrapModelWithMemWal(model, "default_user");
    }

    const systemPrompt = `You are Tusk, a warm, quick-witted assistant with long-term memory.
Be concise and natural. Use what you remember when it helps; do not recite
memories unprompted or make the user feel watched.`;

    const result = streamText({
      model,
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
