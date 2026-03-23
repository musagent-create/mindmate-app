import { ElevenLabsClient } from "elevenlabs";

// Matilda — varm, rolig, naturlig (multilingual v2 kompatibel)
const VOICE_ID = "XrExE9yKIg1WjnnlVkGX";

// Flash v2.5 — 75ms latency, 50% billigere end standard, fuld dansk support
const MODEL_ID = "eleven_flash_v2_5";

let client: ElevenLabsClient | null = null;

function getClient(): ElevenLabsClient | null {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey === "your-elevenlabs-api-key-here") return null;
  if (!client) client = new ElevenLabsClient({ apiKey });
  return client;
}

export async function textToSpeech(text: string): Promise<Buffer | null> {
  const el = getClient();
  if (!el) return null; // Ingen key → browser TTS fallback

  try {
    const audioStream = await el.textToSpeech.convert(VOICE_ID, {
      text,
      model_id: MODEL_ID,
      voice_settings: {
        stability: 0.65,
        similarity_boost: 0.85,
        style: 0.2,
        use_speaker_boost: true,
      },
    });

    // Collect stream into buffer
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  } catch (err) {
    console.error("ElevenLabs error:", err);
    return null;
  }
}
