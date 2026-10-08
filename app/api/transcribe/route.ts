import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { audio, mimeType = "audio/webm" } = await req.json();

    if (!audio || typeof audio !== "string") {
      return NextResponse.json({ error: "Missing or invalid audio data" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing Gemini API key" }, { status: 500 });
    }

    // Strip data URL header if present (e.g. "data:audio/webm;base64,")
    const cleanBase64 = audio.includes(",") ? audio.split(",")[1] : audio;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Transcribe the spoken words in this audio exactly. Output ONLY the transcribed words. Do not wrap in quotes or add notes. If only silence, static, or noise is present, return nothing.",
              },
              {
                inlineData: {
                  mimeType: mimeType || "audio/webm",
                  data: cleanBase64,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini audio transcription error:", res.status, errText);
      return NextResponse.json({ text: "", error: "Transcription failed" }, { status: res.status });
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanText = rawText.trim().replace(/^["']|["']$/g, "");

    if (cleanText.toUpperCase() === "SILENCE" || cleanText.toUpperCase() === "SILENT") {
      return NextResponse.json({ text: "" });
    }

    return NextResponse.json({ text: cleanText });
  } catch (err: any) {
    console.error("Transcribe API error:", err);
    return NextResponse.json({ text: "", error: err.message }, { status: 500 });
  }
}
