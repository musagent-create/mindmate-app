import { NextRequest, NextResponse } from 'next/server';
import { askClaude, Message } from '@/lib/claude';
import { getSession, addMessage } from '@/lib/memory';

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, userContext } = await req.json();

    if (!message || !sessionId) {
      return NextResponse.json({ error: 'Missing message or sessionId' }, { status: 400 });
    }

    const session = getSession(sessionId, userContext);

    // Add user message to history
    addMessage(sessionId, { role: 'user', content: message });

    // Build messages array for Claude (last 20 turns to keep context manageable)
    const messages: Message[] = session.messages.slice(-20);

    // Call Claude CLI
    const reply = askClaude(messages, session.context);

    // Add assistant reply to history
    addMessage(sessionId, { role: 'assistant', content: reply });

    return NextResponse.json({ reply, sessionId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Chat error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
