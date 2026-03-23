"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type AppState = "idle" | "listening" | "thinking" | "speaking";

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [lastReply, setLastReply] = useState("");
  const [sessionId] = useState(() => crypto.randomUUID());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
  }, []);

  const speakWithBrowserTTS = useCallback((text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "da-DK";
    utterance.rate = 0.85;
    utterance.onend = () => setState("idle");
    speechSynthesis.speak(utterance);
  }, []);

  const playReply = useCallback(
    async (text: string) => {
      setState("speaking");
      setLastReply(text);

      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (!res.ok) {
          speakWithBrowserTTS(text);
          return;
        }

        const contentType = res.headers.get("Content-Type");
        if (contentType?.includes("audio/mpeg")) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const audio = audioRef.current!;
          audio.src = url;
          audio.onended = () => {
            URL.revokeObjectURL(url);
            setState("idle");
          };
          audio.onerror = () => {
            URL.revokeObjectURL(url);
            speakWithBrowserTTS(text);
          };
          await audio.play();
        } else {
          // fallback: true response
          speakWithBrowserTTS(text);
        }
      } catch {
        speakWithBrowserTTS(text);
      }
    },
    [speakWithBrowserTTS]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      setState("thinking");

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, sessionId }),
        });

        if (!res.ok) {
          setLastReply("Undskyld, der skete en fejl. Prøv igen.");
          setState("idle");
          return;
        }

        const data = await res.json();
        await playReply(data.reply);
      } catch {
        setLastReply("Undskyld, jeg kan ikke svare lige nu. Prøv igen.");
        setState("idle");
      }
    },
    [sessionId, playReply]
  );

  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setLastReply("Din browser understøtter ikke talegenkendelse.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "da-DK";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        sendMessage(transcript);
      } else {
        setState("idle");
      }
    };

    recognition.onerror = () => {
      setState("idle");
    };

    recognition.onend = () => {
      if (state === "listening") {
        // If still in listening state when recognition ends without result
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setState("listening");
  }, [sendMessage, state]);

  const handleButtonPress = useCallback(() => {
    if (state === "idle") {
      startListening();
    } else if (state === "listening" && recognitionRef.current) {
      recognitionRef.current.stop();
    } else if (state === "speaking") {
      audioRef.current?.pause();
      speechSynthesis.cancel();
      setState("idle");
    }
  }, [state, startListening]);

  const buttonColor =
    state === "listening"
      ? "bg-red-500"
      : state === "thinking"
        ? "bg-yellow-400"
        : state === "speaking"
          ? "bg-green-400"
          : "bg-green-500";

  const buttonAnimation =
    state === "listening"
      ? "animate-pulse"
      : state === "speaking"
        ? "animate-pulse"
        : state === "thinking"
          ? "animate-bounce"
          : "";

  const buttonLabel =
    state === "listening"
      ? "Lytter..."
      : state === "thinking"
        ? "Tænker..."
        : state === "speaking"
          ? "Taler..."
          : "Tryk for at tale";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white select-none px-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">MindMate</h1>
      <p className="text-xl text-gray-500 mb-16">Din samtalepartner</p>

      <button
        onClick={handleButtonPress}
        disabled={state === "thinking"}
        className={`w-48 h-48 rounded-full ${buttonColor} ${buttonAnimation} shadow-2xl
          flex items-center justify-center transition-all duration-300
          active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed
          focus:outline-none focus:ring-4 focus:ring-green-200`}
        aria-label={buttonLabel}
      >
        <svg
          className="w-20 h-20 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          {state === "speaking" ? (
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          ) : (
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          )}
        </svg>
      </button>

      <p className="mt-8 text-2xl font-medium text-gray-600">{buttonLabel}</p>

      {lastReply && (
        <div className="mt-12 max-w-lg w-full bg-gray-50 rounded-2xl p-6 shadow-sm">
          <p className="text-xl text-gray-700 leading-relaxed text-center">
            {lastReply}
          </p>
        </div>
      )}
    </div>
  );
}
