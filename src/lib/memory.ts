import type Anthropic from "@anthropic-ai/sdk";

interface Session {
  messages: Anthropic.MessageParam[];
  context: string;
}

// In-memory session store — erstattes af Supabase i v2
const sessions = new Map<string, Session>();

export function getSession(sessionId: string): Session {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { messages: [], context: "" });
  }
  return sessions.get(sessionId)!;
}

export function addMessage(
  sessionId: string,
  role: "user" | "assistant",
  content: string
): void {
  const session = getSession(sessionId);
  session.messages.push({ role, content });
}

export function setContext(sessionId: string, context: string): void {
  const session = getSession(sessionId);
  session.context = context;
}
