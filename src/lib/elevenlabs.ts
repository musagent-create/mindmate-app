// ElevenLabs TTS — deaktiveret indtil videre
// Plapre (dansk open source TTS) kræver Linux/CUDA — ikke macOS ARM
// Plan: ElevenLabs gratis tier til PoC-test, Plapre på Linux VPS til V2
// For nu: browser TTS fallback (Web Speech API, da-DK)

export async function textToSpeech(_text: string): Promise<Buffer | null> {
  // Returner null → browser TTS fallback i /api/tts
  return null;
}
