"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type AppState = "idle" | "listening" | "thinking" | "speaking";

const STATE_CONFIG = {
  idle: {
    bg: "bg-[#4A9B8F]",
    ring: "ring-[#4A9B8F]/30",
    label: "Tryk for at tale",
    hint: "Jeg lytter, når du er klar",
  },
  listening: {
    bg: "bg-[#E07B6A]",
    ring: "ring-[#E07B6A]/30",
    label: "Lytter…",
    hint: "Tal roligt og tydeligt",
  },
  thinking: {
    bg: "bg-[#C4956A]",
    ring: "ring-[#C4956A]/30",
    label: "Tænker…",
    hint: "Et øjeblik",
  },
  speaking: {
    bg: "bg-[#4A9B8F]",
    ring: "ring-[#4A9B8F]/30",
    label: "Taler…",
    hint: "Tryk for at afbryde",
  },
};

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [lastReply, setLastReply] = useState("");
  const [sessionId] = useState(() => crypto.randomUUID());
  const [dots, setDots] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const dotsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
  }, []);

  // Animated dots for thinking/listening states
  useEffect(() => {
    if (state === "thinking" || state === "listening") {
      dotsTimerRef.current = setInterval(() => {
        setDots((d) => (d + 1) % 4);
      }, 500);
    } else {
      if (dotsTimerRef.current) clearInterval(dotsTimerRef.current);
      setDots(0);
    }
    return () => {
      if (dotsTimerRef.current) clearInterval(dotsTimerRef.current);
    };
  }, [state]);

  const speakWithBrowserTTS = useCallback((text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "da-DK";
    utterance.rate = 0.82;
    utterance.pitch = 1.05;
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

        if (!res.ok) { speakWithBrowserTTS(text); return; }

        const contentType = res.headers.get("Content-Type");
        if (contentType?.includes("audio/mpeg")) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const audio = audioRef.current!;
          audio.src = url;
          audio.onended = () => { URL.revokeObjectURL(url); setState("idle"); };
          audio.onerror = () => { URL.revokeObjectURL(url); speakWithBrowserTTS(text); };
          await audio.play();
        } else {
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
        if (!res.ok) { setLastReply("Undskyld, der skete en fejl. Prøv igen."); setState("idle"); return; }
        const data = await res.json();
        await playReply(data.reply);
      } catch {
        setLastReply("Undskyld, jeg kan ikke svare lige nu.");
        setState("idle");
      }
    },
    [sessionId, playReply]
  );

  const startListening = useCallback(async () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setLastReply("Din browser understøtter ikke talegenkendelse. Prøv Safari eller Chrome."); return; }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setLastReply("Mikrofon-adgang nægtet. Tillad mikrofon og prøv igen.");
      return;
    }

    const recognition = new SR();
    recognition.lang = "da-DK";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) sendMessage(transcript);
      else setState("idle");
    };

    recognition.onerror = () => {
      setLastReply("Kunne ikke høre dig. Prøv igen.");
      setState("idle");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setState("listening");
  }, [sendMessage]);

  const handlePress = useCallback(() => {
    if (state === "idle") startListening();
    else if (state === "listening") recognitionRef.current?.stop();
    else if (state === "speaking") {
      audioRef.current?.pause();
      speechSynthesis.cancel();
      setState("idle");
    }
  }, [state, startListening]);

  const cfg = STATE_CONFIG[state];
  const animDots = ".".repeat(dots);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen select-none px-8"
      style={{ background: "linear-gradient(160deg, #FDF6EC 0%, #F0EBE3 100%)" }}
    >
      {/* Header */}
      <div className="text-center mb-14">
        <h1 className="text-5xl font-semibold text-[#3D3530] tracking-tight mb-2">
          MindMate
        </h1>
        <p className="text-lg text-[#9C8A7A]">Din tålmodige samtalepartner</p>
      </div>

      {/* Button with ripple rings */}
      <div className="relative flex items-center justify-center mb-10">
        {/* Ripple rings — only when listening or speaking */}
        {(state === "listening" || state === "speaking") && (
          <>
            <span
              className={`absolute rounded-full ${cfg.bg} opacity-10`}
              style={{ width: 260, height: 260, animation: "ping 1.6s cubic-bezier(0,0,0.2,1) infinite" }}
            />
            <span
              className={`absolute rounded-full ${cfg.bg} opacity-10`}
              style={{ width: 220, height: 220, animation: "ping 1.6s cubic-bezier(0,0,0.2,1) infinite 0.4s" }}
            />
          </>
        )}

        <button
          onClick={handlePress}
          disabled={state === "thinking"}
          className={`relative w-52 h-52 rounded-full ${cfg.bg} shadow-2xl
            flex items-center justify-center transition-all duration-500
            active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed
            focus:outline-none ring-8 ${cfg.ring}`}
          aria-label={cfg.label}
        >
          {/* Icon */}
          <svg className="w-20 h-20 text-white/90" fill="currentColor" viewBox="0 0 24 24">
            {state === "speaking" ? (
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            ) : state === "thinking" ? (
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
            ) : (
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            )}
          </svg>
        </button>
      </div>

      {/* State label */}
      <p className="text-2xl font-medium text-[#5C4F47] mb-2 min-h-[2rem]">
        {state === "thinking" || state === "listening"
          ? cfg.label.replace("…", "") + animDots
          : cfg.label}
      </p>
      <p className="text-base text-[#9C8A7A] mb-10">{cfg.hint}</p>

      {/* Reply card */}
      {lastReply && (
        <div
          className="max-w-md w-full rounded-3xl p-7 shadow-sm"
          style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", border: "1px solid rgba(200,185,170,0.3)" }}
        >
          <p className="text-[1.2rem] text-[#4A3F38] leading-relaxed text-center font-light">
            {lastReply}
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes ping {
          75%, 100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
