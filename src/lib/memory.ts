import { Message } from './claude';

interface Session {
  messages: Message[];
  context: string;
}

const sessions = new Map<string, Session>();

export function getSession(sessionId: string, userContext?: string): Session {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      messages: [],
      context: userContext || '',
    });
  }
  const session = sessions.get(sessionId)!;
  // Update context if provided
  if (userContext) session.context = userContext;
  return session;
}

export function addMessage(sessionId: string, message: Message): void {
  const session = getSession(sessionId);
  session.messages.push(message);
}

export function clearSession(sessionId: string): void {
  sessions.delete(sessionId);
}
