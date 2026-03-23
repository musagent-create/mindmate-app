"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type AppState = "idle" | "listening" | "thinking" | "speaking";
type Screen = "select" | "setup" | "chat";

const STATE_CONFIG = {
  idle: { bg: "bg-[#4A9B8F]", ring: "ring-[#4A9B8F]/30", label: "Tryk for at starte", hint: "Klar til en snak" },
  listening: { bg: "bg-[#E07B6A]", ring: "ring-[#E07B6A]/30", label: "Lytter…", hint: "Tag dig god tid" },
  thinking: { bg: "bg-[#C4956A]", ring: "ring-[#C4956A]/30", label: "Tænker…", hint: "Et øjeblik" },
  speaking: { bg: "bg-[#4A9B8F]", ring: "ring-[#4A9B8F]/30", label: "Taler…", hint: "Tryk for at stoppe" },
};

const BG = "linear-gradient(160deg, #FDF6EC 0%, #F0EBE3 100%)";

interface UserProfile {
  id?: string;
  name: string;
  age: string;
  family: string;
  interests: string;
  stories: string;
}

interface SavedProfile {
  id: string;
  name: string;
  age: number | null;
  family: string;
  interests: string;
  stories: string;
  updated_at: string;
}

// ─── Profile Selection Screen ────────────────────────────────────────────────

function SelectScreen({
  onSelect,
  onCreateNew,
}: {
  onSelect: (profile: SavedProfile) => void;
  onCreateNew: () => void;
}) {
  const [profiles, setProfiles] = useState<SavedProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profiles")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setProfiles(data))
      .catch(() => setProfiles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen px-6 py-12" style={{ background: BG }}>
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-semibold text-[#3D3530] tracking-tight mb-2">MindMate</h1>
          <p className="text-[#9C8A7A] text-base">Hvem skal vi tale med i dag?</p>
        </div>

        {loading ? (
          <p className="text-center text-[#9C8A7A] py-8">Indlæser…</p>
        ) : (
          <>
            {profiles.length > 0 && (
              <div className="space-y-3 mb-8">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onSelect(p)}
                    className="w-full text-left rounded-2xl p-5 border border-[#DDD0C0]/60
                      transition-all duration-200 hover:shadow-md active:scale-[0.99]"
                    style={{ background: "rgba(255,255,255,0.7)" }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-[#3D3530]">
                          {p.name}
                          {p.age && (
                            <span className="text-sm font-normal text-[#9C8A7A] ml-2">
                              {p.age} år
                            </span>
                          )}
                        </h3>
                        {p.family && (
                          <p className="text-sm text-[#9C8A7A] mt-0.5 truncate">{p.family}</p>
                        )}
                      </div>
                      <span className="text-2xl text-[#4A9B8F]">→</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={onCreateNew}
              className="w-full py-5 rounded-2xl text-white text-xl font-medium shadow-lg
                transition-all duration-300 active:scale-[0.98]"
              style={{ background: "#4A9B8F" }}
            >
              {profiles.length > 0 ? "Opret ny profil" : "Kom i gang"}
            </button>

            {profiles.length === 0 && (
              <p className="text-center text-[#B0A090] text-sm mt-4">
                Opret en profil for at starte din første samtale
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Setup Screen ────────────────────────────────────────────────────────────

function SetupScreen({ onStart }: { onStart: (profile: UserProfile) => void }) {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    age: "",
    family: "",
    interests: "",
    stories: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof UserProfile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setProfile((p) => ({ ...p, [k]: e.target.value }));

  const canStart = profile.name.trim().length > 0 && !saving;

  const handleStart = async () => {
    if (!canStart) return;
    setSaving(true);
    try {
      // Gem profil i Supabase
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        const saved = await res.json();
        onStart({ ...profile, id: saved.id });
      } else {
        onStart(profile); // Fallback: start uden gemt profil
      }
    } catch {
      onStart(profile); // Fallback ved netværksfejl
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col items-center min-h-screen px-6 py-12" style={{ background: BG }}>
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-semibold text-[#3D3530] tracking-tight mb-2">MindMate</h1>
          <p className="text-[#9C8A7A] text-base">Fortæl os lidt om den vi skal tale med</p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <Field label="Navn *" placeholder="f.eks. Jørgen" value={profile.name} onChange={set("name")} />
          <Field label="Alder" placeholder="f.eks. 78" value={profile.age} onChange={set("age")} />
          <Field
            label="Familie og nære"
            placeholder="f.eks. Gift med Kirsten i 52 år. Søn Henrik (48), datter Mette (45). 4 børnebørn."
            value={profile.family}
            onChange={set("family")}
            multiline
          />
          <Field
            label="Interesser og hobbyer"
            placeholder="f.eks. Elsker at snakke om sit arbejde som tømrer. Glad for FC København og sommerhuset i Gilleleje."
            value={profile.interests}
            onChange={set("interests")}
            multiline
          />
          <Field
            label="Historier og minder"
            placeholder="f.eks. Fortæller tit om dengang han byggede huset i 1972. Husk at spørge ind til Gilleleje."
            value={profile.stories}
            onChange={set("stories")}
            multiline
          />
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={!canStart}
          className="mt-10 w-full py-5 rounded-2xl text-white text-xl font-medium shadow-lg
            transition-all duration-300 active:scale-[0.98]
            disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: canStart ? "#4A9B8F" : "#aaa" }}
        >
          {saving ? "Opretter…" : `Start samtale med ${profile.name || "…"}`}
        </button>

        <p className="text-center text-[#B0A090] text-sm mt-4">
          Kun navn er påkrævet — jo mere du fortæller, jo bedre samtale
        </p>
      </div>
    </div>
  );
}

function Field({
  label, placeholder, value, onChange, multiline,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  multiline?: boolean;
}) {
  const base =
    "w-full px-4 py-3 rounded-xl text-[#4A3F38] placeholder-[#C0B0A0] text-base " +
    "border border-[#DDD0C0] focus:outline-none focus:ring-2 focus:ring-[#4A9B8F]/40 " +
    "transition-all duration-200 resize-none";
  return (
    <div>
      <label className="block text-sm font-medium text-[#7A6A5A] mb-1.5">{label}</label>
      {multiline ? (
        <textarea
          rows={3}
          className={base}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{ background: "rgba(255,255,255,0.75)" }}
        />
      ) : (
        <input
          type="text"
          className={base}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{ background: "rgba(255,255,255,0.75)" }}
        />
      )}
    </div>
  );
}

// ─── Chat Screen ─────────────────────────────────────────────────────────────

function ChatScreen({ profile, onReset }: { profile: UserProfile; onReset: () => void }) {
  const [state, setState] = useState<AppState>("idle");
  const [lastReply, setLastReply] = useState("");
  const [dots, setDots] = useState(0);
  const [conversationActive, setConversationActive] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcriptRef = useRef<string>("");
  const checkedInRef = useRef(false);

  useEffect(() => { audioRef.current = new Audio(); }, []);

  useEffect(() => {
    let t: ReturnType<typeof setInterval>;
    if (state === "thinking" || state === "listening") {
      t = setInterval(() => setDots((d) => (d + 1) % 4), 500);
    } else {
      setDots(0);
    }
    return () => clearInterval(t);
  }, [state]);

  // Find dansk stemme
  const getDanishVoice = useCallback(() => {
    const voices = speechSynthesis.getVoices();
    return voices.find(v => v.lang === "da-DK")
      || voices.find(v => v.lang.startsWith("da"))
      || voices.find(v => v.name.toLowerCase().includes("danish"))
      || null;
  }, []);

  // Preload stemmer (nogle browsere loader dem async)
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  useEffect(() => {
    const loadVoices = () => {
      const v = speechSynthesis.getVoices();
      if (v.length > 0) setVoicesLoaded(true);
    };
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    return () => { speechSynthesis.onvoiceschanged = null; };
  }, []);

  // TTS der kalder onDone når færdig (bruges til auto-loop)
  const speakText = useCallback((text: string, onDone: () => void) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "da-DK";
    u.rate = 0.82;
    u.pitch = 1.05;
    const dv = getDanishVoice();
    if (dv) {
      u.voice = dv;
    } else {
      // Ingen dansk stemme — brug en blødere engelsk stemme
      // og sæt rate lidt ned så det lyder mere roligt
      u.rate = 0.75;
    }
    // Safari bug: onend fires ikke altid. Fallback med timeout.
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      onDone();
    };

    u.onend = finish;
    u.onerror = finish;

    // Estimér taletid: ~80ms per tegn ved rate 0.82 + 2s buffer
    const estimatedMs = Math.max(3000, text.length * 80 + 2000);
    const fallbackTimer = setTimeout(finish, estimatedMs);

    u.addEventListener("end", () => clearTimeout(fallbackTimer));

    // Safari kræver at speechSynthesis ikke er paused
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }, [getDanishVoice, voicesLoaded]);

  // Start lytning — returnerer promise med transkriberet tekst (eller "" ved timeout)
  const listenOnce = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) { resolve(""); return; }

      const r = new SR();
      r.lang = "da-DK";
      r.continuous = true;
      r.interimResults = true;
      transcriptRef.current = "";

      const resetTimer = (ms: number) => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => r.stop(), ms);
      };

      r.onresult = (e: SpeechRecognitionEvent) => {
        let full = "";
        for (let i = 0; i < e.results.length; i++) {
          full += e.results[i][0].transcript;
        }
        transcriptRef.current = full;
        resetTimer(3000); // 3 sek efter sidste ord
      };

      r.onend = () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        resolve(transcriptRef.current.trim());
      };

      r.onerror = () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        resolve("");
      };

      recognitionRef.current = r;
      r.start();
      resetTimer(10000); // 10 sek initial timeout — plads til tænkepauser
      setState("listening");
    });
  }, []);

  // Send besked til Claude og få svar
  const getReply = useCallback(async (text: string): Promise<string> => {
    setState("thinking");
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, profileId: profile.id }),
      });
      if (!res.ok) return "Undskyld, der skete en fejl.";
      return (await res.json()).reply;
    } catch { return "Undskyld, jeg kan ikke svare lige nu."; }
  }, [profile.id]);

  // Tal og vent til færdig
  const speakAndWait = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      setState("speaking");
      setLastReply(text);
      speakText(text, resolve);
    });
  }, [speakText]);

  // Detect om brugeren vil stoppe samtalen
  const wantsToStop = useCallback((text: string) => {
    const lower = text.toLowerCase().trim();
    const stopPhrases = [
      "farvel", "hej hej", "vi ses", "tak for i dag", "jeg vil ikke snakke mere",
      "stop", "slut", "det var det", "det er nok", "god nat", "adjø",
      "nej tak", "ikke mere", "vi stopper", "lad os stoppe", "jeg er færdig",
      "tak for snakken", "det var hyggeligt",
    ];
    return stopPhrases.some(p => lower.includes(p));
  }, []);

  // ─── Samtale-loop ──────────────────────────────────────────────────────────
  const startConversation = useCallback(async () => {
    try { await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch { setLastReply("Mikrofon-adgang nægtet. Tillad mikrofon og prøv igen."); return; }

    setConversationActive(true);
    checkedInRef.current = false;

    // Loop: lyt → send → svar → gentag
    const loop = async () => {
      while (true) {
        // Lyt til brugeren
        const userText = await listenOnce();

        if (!userText) {
          // Ingen tale — check-in eller afslut
          if (!checkedInRef.current) {
            checkedInRef.current = true;
            await speakAndWait("Er du stadig der? Bare sig noget, så fortsætter vi.");
            const retry = await listenOnce();
            if (retry) {
              checkedInRef.current = false;
              const reply = await getReply(retry);
              await speakAndWait(reply);
              continue;
            }
          }
          // Stadig stille — afslut samtalen
          await speakAndWait("Det var hyggeligt at snakke! Tryk på knappen når du vil tale igen.");
          setConversationActive(false);
          setState("idle");
          return;
        }

        // Bruger sagde noget — tjek om de vil stoppe
        if (wantsToStop(userText)) {
          // Send til Claude så den kan sige pænt farvel
          const reply = await getReply(userText);
          await speakAndWait(reply);
          setConversationActive(false);
          setState("idle");
          return;
        }

        // Fortsæt samtalen
        checkedInRef.current = false;
        const reply = await getReply(userText);
        await speakAndWait(reply);
      }
    };

    loop();
  }, [listenOnce, getReply, speakAndWait, wantsToStop]);

  const handlePress = useCallback(() => {
    if (!conversationActive && state === "idle") {
      startConversation();
    } else if (state === "listening") {
      // Stop lytning tidligt — sender hvad der er sagt
      recognitionRef.current?.stop();
    } else if (state === "speaking") {
      // Afbryd tale
      audioRef.current?.pause();
      speechSynthesis.cancel();
      setState("idle");
      setConversationActive(false);
    }
  }, [state, conversationActive, startConversation]);

  const cfg = STATE_CONFIG[state];
  const animLabel = (state === "thinking" || state === "listening")
    ? cfg.label.replace("…", "") + ".".repeat(dots)
    : cfg.label;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen select-none px-8" style={{ background: BG }}>
      {/* Name + reset */}
      <div className="absolute top-6 right-6">
        <button onClick={onReset} className="text-sm text-[#B0A090] hover:text-[#7A6A5A] transition-colors">
          ← Skift bruger
        </button>
      </div>

      <div className="text-center mb-14">
        <h1 className="text-5xl font-semibold text-[#3D3530] tracking-tight mb-2">Hej, {profile.name}</h1>
        <p className="text-lg text-[#9C8A7A]">Altid klar til en god snak</p>
      </div>

      {/* Button */}
      <div className="relative flex items-center justify-center mb-10">
        {(state === "listening" || state === "speaking") && (
          <>
            <span className={`absolute rounded-full ${cfg.bg} opacity-10`}
              style={{ width: 260, height: 260, animation: "ping 1.6s cubic-bezier(0,0,0.2,1) infinite" }} />
            <span className={`absolute rounded-full ${cfg.bg} opacity-10`}
              style={{ width: 220, height: 220, animation: "ping 1.6s cubic-bezier(0,0,0.2,1) infinite 0.4s" }} />
          </>
        )}
        <button
          onClick={handlePress}
          disabled={state === "thinking"}
          className={`relative w-52 h-52 rounded-full ${cfg.bg} shadow-2xl
            flex items-center justify-center transition-all duration-500
            active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed
            focus:outline-none ring-8 ${cfg.ring}`}
        >
          <svg className="w-20 h-20 text-white/90" fill="currentColor" viewBox="0 0 24 24">
            {state === "speaking"
              ? <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              : <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            }
          </svg>
        </button>
      </div>

      <p className="text-2xl font-medium text-[#5C4F47] mb-2 min-h-[2rem]">{animLabel}</p>
      <p className="text-base text-[#9C8A7A] mb-10">{cfg.hint}</p>

      {lastReply && (
        <div className="max-w-md w-full rounded-3xl p-7 shadow-sm"
          style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", border: "1px solid rgba(200,185,170,0.3)" }}>
          <p className="text-[1.2rem] text-[#4A3F38] leading-relaxed text-center font-light">{lastReply}</p>
        </div>
      )}

      <style jsx>{`
        @keyframes ping { 75%, 100% { transform: scale(1.4); opacity: 0; } }
      `}</style>
    </div>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [screen, setScreen] = useState<Screen>("select");
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const handleSelectExisting = (p: SavedProfile) => {
    setProfile({
      id: p.id,
      name: p.name,
      age: p.age?.toString() || "",
      family: p.family,
      interests: p.interests,
      stories: p.stories,
    });
    setScreen("chat");
  };

  const handleStart = (p: UserProfile) => {
    setProfile(p);
    setScreen("chat");
  };

  const handleReset = () => {
    setProfile(null);
    setScreen("select");
  };

  if (screen === "chat" && profile) return <ChatScreen profile={profile} onReset={handleReset} />;
  if (screen === "setup") return <SetupScreen onStart={handleStart} />;
  return <SelectScreen onSelect={handleSelectExisting} onCreateNew={() => setScreen("setup")} />;
}
