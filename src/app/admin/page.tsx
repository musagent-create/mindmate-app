"use client";

import { useState, useEffect, useCallback } from "react";

const BG = "linear-gradient(160deg, #FDF6EC 0%, #F0EBE3 100%)";

interface Profile {
  id: string;
  name: string;
  age: number | null;
  family: string;
  interests: string;
  stories: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  profile_id: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

interface Recap {
  id: string;
  date: string;
  messageCount: number;
  recap: string;
}

type View = "list" | "create" | "edit" | "conversations" | "recaps";

// ─── Form felter ─────────────────────────────────────────────────────────────

function FormField({
  label,
  placeholder,
  value,
  onChange,
  multiline,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const base =
    "w-full px-4 py-3 rounded-xl text-[#4A3F38] placeholder-[#C0B0A0] text-base " +
    "border border-[#DDD0C0] focus:outline-none focus:ring-2 focus:ring-[#4A9B8F]/40 " +
    "transition-all duration-200 resize-none";
  return (
    <div>
      <label className="block text-sm font-medium text-[#7A6A5A] mb-1.5">
        {label}
      </label>
      {multiline ? (
        <textarea
          rows={3}
          className={base}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ background: "rgba(255,255,255,0.75)" }}
        />
      ) : (
        <input
          type="text"
          className={base}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ background: "rgba(255,255,255,0.75)" }}
        />
      )}
    </div>
  );
}

// ─── Profile Form ────────────────────────────────────────────────────────────

function ProfileForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: Profile;
  onSave: (data: Record<string, string>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [age, setAge] = useState(initial?.age?.toString() || "");
  const [family, setFamily] = useState(initial?.family || "");
  const [interests, setInterests] = useState(initial?.interests || "");
  const [stories, setStories] = useState(initial?.stories || "");

  return (
    <div className="space-y-5">
      <FormField label="Navn *" placeholder="f.eks. Jørgen" value={name} onChange={setName} />
      <FormField label="Alder" placeholder="f.eks. 78" value={age} onChange={setAge} />
      <FormField
        label="Familie og nære"
        placeholder="f.eks. Gift med Kirsten i 52 år. Søn Henrik (48), datter Mette (45)."
        value={family}
        onChange={setFamily}
        multiline
      />
      <FormField
        label="Interesser og hobbyer"
        placeholder="f.eks. Elsker at snakke om sit arbejde som tømrer."
        value={interests}
        onChange={setInterests}
        multiline
      />
      <FormField
        label="Historier og minder"
        placeholder="f.eks. Fortæller tit om dengang han byggede huset i 1972."
        value={stories}
        onChange={setStories}
        multiline
      />

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => name.trim() && onSave({ name, age, family, interests, stories })}
          disabled={!name.trim() || saving}
          className="flex-1 py-3 rounded-xl text-white font-medium transition-all duration-200
            disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: name.trim() ? "#4A9B8F" : "#aaa" }}
        >
          {saving ? "Gemmer…" : initial ? "Opdater profil" : "Opret profil"}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 rounded-xl text-[#7A6A5A] border border-[#DDD0C0]
            hover:bg-white/50 transition-all duration-200"
        >
          Annuller
        </button>
      </div>
    </div>
  );
}

// ─── Conversations View ──────────────────────────────────────────────────────

function ConversationsView({
  profile,
  conversations,
  onBack,
}: {
  profile: Profile;
  conversations: Conversation[];
  onBack: () => void;
}) {
  return (
    <div>
      <button
        onClick={onBack}
        className="text-sm text-[#4A9B8F] hover:text-[#3D8578] mb-4 transition-colors"
      >
        ← Tilbage til profiler
      </button>
      <h2 className="text-2xl font-semibold text-[#3D3530] mb-6">
        Samtaler med {profile.name}
      </h2>

      {conversations.length === 0 ? (
        <p className="text-[#9C8A7A] text-center py-8">Ingen samtaler endnu</p>
      ) : (
        <div className="space-y-4">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className="rounded-2xl p-5 border border-[#DDD0C0]/60"
              style={{ background: "rgba(255,255,255,0.7)" }}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-[#9C8A7A]">
                  {new Date(conv.created_at).toLocaleDateString("da-DK", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="text-sm text-[#B0A090]">
                  {conv.messages.length} beskeder
                </span>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {conv.messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`text-sm py-2 px-3 rounded-xl ${
                      msg.role === "user"
                        ? "bg-[#4A9B8F]/10 text-[#3D3530] ml-8"
                        : "bg-[#F5EDE3] text-[#4A3F38] mr-8"
                    }`}
                  >
                    <span className="font-medium text-xs text-[#9C8A7A] block mb-0.5">
                      {msg.role === "user" ? profile.name : "MindMate"}
                    </span>
                    {msg.content}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Recaps View ─────────────────────────────────────────────────────────────

function RecapsView({
  profile,
  recaps,
  loading,
  onBack,
}: {
  profile: Profile;
  recaps: Recap[];
  loading: boolean;
  onBack: () => void;
}) {
  return (
    <div>
      <button
        onClick={onBack}
        className="text-sm text-[#4A9B8F] hover:text-[#3D8578] mb-4 transition-colors"
      >
        ← Tilbage til profiler
      </button>
      <h2 className="text-2xl font-semibold text-[#3D3530] mb-2">
        Dagbogsnotater for {profile.name}
      </h2>
      <p className="text-sm text-[#9C8A7A] mb-6">
        AI-genereret resumé af samtaler — hvad der blev talt om og hvordan det gik
      </p>

      {loading ? (
        <p className="text-center text-[#9C8A7A] py-8">Genererer resuméer…</p>
      ) : recaps.length === 0 ? (
        <p className="text-[#9C8A7A] text-center py-8">Ingen samtaler at opsummere endnu</p>
      ) : (
        <div className="space-y-4">
          {recaps.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl p-6 border border-[#DDD0C0]/60"
              style={{ background: "rgba(255,255,255,0.7)" }}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-[#7A6A5A]">
                  📅{" "}
                  {new Date(r.date).toLocaleDateString("da-DK", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="text-xs text-[#B0A090]">
                  {r.messageCount} beskeder
                </span>
              </div>
              <p className="text-[#4A3F38] leading-relaxed">{r.recap}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Admin Panel ─────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [view, setView] = useState<View>("list");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [viewProfile, setViewProfile] = useState<Profile | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [recaps, setRecaps] = useState<Recap[]>([]);
  const [recapLoading, setRecapLoading] = useState(false);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profiles");
      if (res.ok) setProfiles(await res.json());
    } catch (e) {
      console.error("Failed to fetch profiles:", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleCreate = async (data: Record<string, string>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchProfiles();
        setView("list");
      }
    } catch (e) {
      console.error("Failed to create profile:", e);
    }
    setSaving(false);
  };

  const handleUpdate = async (data: Record<string, string>) => {
    if (!editingProfile) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/profiles/${editingProfile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchProfiles();
        setEditingProfile(null);
        setView("list");
      }
    } catch (e) {
      console.error("Failed to update profile:", e);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Er du sikker? Alle samtaler slettes også.")) return;
    try {
      const res = await fetch(`/api/profiles/${id}`, { method: "DELETE" });
      if (res.ok) await fetchProfiles();
    } catch (e) {
      console.error("Failed to delete profile:", e);
    }
  };

  const handleClearMemory = async (profile: Profile) => {
    if (!confirm(`Slet alle samtaler for ${profile.name}? Profilen beholdes.`)) return;
    try {
      const res = await fetch(`/api/profiles/${profile.id}?clear=conversations`, { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        alert(`${data.cleared} samtale(r) slettet for ${profile.name}`);
      }
    } catch (e) {
      console.error("Failed to clear memory:", e);
    }
  };

  const handleViewRecaps = async (profile: Profile) => {
    setViewProfile(profile);
    setRecaps([]);
    setRecapLoading(true);
    setView("recaps");
    try {
      const res = await fetch(`/api/profiles/${profile.id}?recap=true`);
      if (res.ok) {
        const data = await res.json();
        setRecaps(data.recaps);
      }
    } catch (e) {
      console.error("Failed to fetch recaps:", e);
    }
    setRecapLoading(false);
  };

  const handleViewConversations = async (profile: Profile) => {
    try {
      const res = await fetch(`/api/profiles/${profile.id}`);
      if (res.ok) {
        const data = await res.json();
        setViewProfile(profile);
        setConversations(data.conversations);
        setView("conversations");
      }
    } catch (e) {
      console.error("Failed to fetch conversations:", e);
    }
  };

  return (
    <div className="min-h-screen px-6 py-12" style={{ background: BG }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-[#3D3530] tracking-tight">
              MindMate Admin
            </h1>
            <p className="text-[#9C8A7A] text-sm mt-1">Administrer brugerprofiler</p>
          </div>
          <div className="flex gap-3">
            <a
              href="/"
              className="px-4 py-2 rounded-xl text-sm text-[#7A6A5A] border border-[#DDD0C0]
                hover:bg-white/50 transition-all duration-200"
            >
              ← Til chat
            </a>
            {view === "list" && (
              <button
                onClick={() => setView("create")}
                className="px-4 py-2 rounded-xl text-sm text-white font-medium
                  transition-all duration-200"
                style={{ background: "#4A9B8F" }}
              >
                + Ny profil
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {view === "create" && (
          <div
            className="rounded-2xl p-6 border border-[#DDD0C0]/60"
            style={{ background: "rgba(255,255,255,0.6)" }}
          >
            <h2 className="text-xl font-semibold text-[#3D3530] mb-5">
              Opret ny profil
            </h2>
            <ProfileForm
              onSave={handleCreate}
              onCancel={() => setView("list")}
              saving={saving}
            />
          </div>
        )}

        {view === "edit" && editingProfile && (
          <div
            className="rounded-2xl p-6 border border-[#DDD0C0]/60"
            style={{ background: "rgba(255,255,255,0.6)" }}
          >
            <h2 className="text-xl font-semibold text-[#3D3530] mb-5">
              Rediger {editingProfile.name}
            </h2>
            <ProfileForm
              initial={editingProfile}
              onSave={handleUpdate}
              onCancel={() => {
                setEditingProfile(null);
                setView("list");
              }}
              saving={saving}
            />
          </div>
        )}

        {view === "recaps" && viewProfile && (
          <RecapsView
            profile={viewProfile}
            recaps={recaps}
            loading={recapLoading}
            onBack={() => {
              setViewProfile(null);
              setView("list");
            }}
          />
        )}

        {view === "conversations" && viewProfile && (
          <ConversationsView
            profile={viewProfile}
            conversations={conversations}
            onBack={() => {
              setViewProfile(null);
              setView("list");
            }}
          />
        )}

        {view === "list" && (
          <>
            {loading ? (
              <p className="text-center text-[#9C8A7A] py-12">Indlæser…</p>
            ) : profiles.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[#9C8A7A] text-lg mb-2">Ingen profiler endnu</p>
                <p className="text-[#B0A090] text-sm">
                  Opret den første profil for at komme i gang
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {profiles.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-2xl p-5 border border-[#DDD0C0]/60 transition-all duration-200
                      hover:shadow-md"
                    style={{ background: "rgba(255,255,255,0.7)" }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-[#3D3530]">
                          {p.name}
                          {p.age && (
                            <span className="text-sm font-normal text-[#9C8A7A] ml-2">
                              {p.age} år
                            </span>
                          )}
                        </h3>
                        {p.family && (
                          <p className="text-sm text-[#7A6A5A] mt-1 truncate">
                            {p.family}
                          </p>
                        )}
                        {p.interests && (
                          <p className="text-sm text-[#9C8A7A] mt-0.5 truncate">
                            {p.interests}
                          </p>
                        )}
                        <p className="text-xs text-[#B0A090] mt-2">
                          Oprettet{" "}
                          {new Date(p.created_at).toLocaleDateString("da-DK", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="flex gap-2 ml-4 flex-shrink-0">
                        <button
                          onClick={() => handleViewRecaps(p)}
                          className="px-3 py-1.5 rounded-lg text-xs text-[#4A9B8F] border border-[#4A9B8F]/30
                            hover:bg-[#4A9B8F]/10 transition-colors"
                        >
                          📖 Dagbog
                        </button>
                        <button
                          onClick={() => handleViewConversations(p)}
                          className="px-3 py-1.5 rounded-lg text-xs text-[#7A6A5A] border border-[#DDD0C0]
                            hover:bg-white/80 transition-colors"
                        >
                          Samtaler
                        </button>
                        <button
                          onClick={() => handleClearMemory(p)}
                          className="px-3 py-1.5 rounded-lg text-xs text-[#C4956A] border border-[#C4956A]/30
                            hover:bg-[#C4956A]/10 transition-colors"
                        >
                          Nulstil hukommelse
                        </button>
                        <button
                          onClick={() => {
                            setEditingProfile(p);
                            setView("edit");
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs text-[#7A6A5A] border border-[#DDD0C0]
                            hover:bg-white/80 transition-colors"
                        >
                          Rediger
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="px-3 py-1.5 rounded-lg text-xs text-[#E07B6A] border border-[#E07B6A]/30
                            hover:bg-[#E07B6A]/10 transition-colors"
                        >
                          Slet
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
