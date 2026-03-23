import { NextRequest, NextResponse } from 'next/server';
import { askClaude, Message } from '@/lib/claude';
import {
  getProfile,
  getOrCreateConversation,
  addMessageToConversation,
  buildUserContext,
} from '@/lib/memory';

export async function POST(req: NextRequest) {
  try {
    const { message, profileId } = await req.json();

    if (!message || !profileId) {
      return NextResponse.json({ error: 'Missing message or profileId' }, { status: 400 });
    }

    // Hent profil fra Supabase
    const profile = await getProfile(profileId);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Hent eller opret samtale
    const conversation = await getOrCreateConversation(profileId);

    // Tilføj brugerens besked
    await addMessageToConversation(conversation.id, { role: 'user', content: message });

    // Byg kontekst og besked-historik (sidste 20 beskeder)
    const userContext = buildUserContext(profile);
    const allMessages = [...(conversation.messages as Message[]), { role: 'user' as const, content: message }];
    const recentMessages = allMessages.slice(-20);

    // Kald Claude CLI
    const reply = askClaude(recentMessages, userContext);

    // Gem assistentens svar
    await addMessageToConversation(conversation.id, { role: 'assistant', content: reply });

    return NextResponse.json({ reply, profileId, conversationId: conversation.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Chat error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
