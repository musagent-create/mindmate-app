// ElevenLabs TTS — Flash v2.5 (lav latency, dansk, ~50% billigere end v2)
// Voice: "Matilda" — varm, rolig, naturlig dansk-kompatibel stemme
// Alternativ: "Charlotte" (mere formel), "Lily" (lysere)

const VOICE_ID = "XrExE9yKIg1WjnnlVkGX"; // Matilda — varm og rolig
const MODEL_ID = "eleven_flash_v2_5";      // Flash v2.5 — 75ms latency, 0.5 credits/char

export async function textToSpeech(text: string): Promise<ArrayBuffer | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey === "your-elevenlabs-api-key-here") {
    return null; // Fallback til browser TTS
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: MODEL_ID,
          voice_settings: {
            stability: 0.65,        // Lidt variation = mere naturlig
            similarity_boost: 0.85, // Tæt på original stemme
            style: 0.2,             // Subtil udtryksevne
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) return null;
    return response.arrayBuffer();
  } catch {
    return null;
  }
}
