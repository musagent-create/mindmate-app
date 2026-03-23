import { NextRequest, NextResponse } from "next/server";
import { textToSpeech } from "@/lib/elevenlabs";

export async function POST(request: NextRequest) {
  const { text } = await request.json();

  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const audioBuffer = await textToSpeech(text);

  if (!audioBuffer) {
    return NextResponse.json({ fallback: true });
  }

  return new NextResponse(audioBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "audio/mpeg",
    },
  });
}
