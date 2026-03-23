const VOICE_ID = "pFZP5JQG7iQjIQuC4Bku";
const FALLBACK_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
const MODEL_ID = "eleven_multilingual_v2";

export async function textToSpeech(text: string): Promise<ArrayBuffer | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey === "your-elevenlabs-api-key-here") {
    return null;
  }

  const voiceId = VOICE_ID;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.7,
          similarity_boost: 0.8,
        },
      }),
    }
  );

  if (!response.ok) {
    // Try fallback voice
    const fallbackResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${FALLBACK_VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: MODEL_ID,
          voice_settings: {
            stability: 0.7,
            similarity_boost: 0.8,
          },
        }),
      }
    );

    if (!fallbackResponse.ok) {
      return null;
    }

    return fallbackResponse.arrayBuffer();
  }

  return response.arrayBuffer();
}
