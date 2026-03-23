import { NextRequest, NextResponse } from 'next/server';
import { getProfile, updateProfile, deleteProfile, getConversationsByProfile, clearConversationsByProfile } from '@/lib/memory';
import { generateRecap, Message } from '@/lib/claude';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const profile = await getProfile(id);
    if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const conversations = await getConversationsByProfile(id);

    // Generér recap hvis ?recap=true
    const { searchParams } = new URL(_req.url);
    if (searchParams.get('recap') === 'true') {
      const recaps = conversations
        .filter(c => (c.messages as Message[]).length > 0)
        .slice(0, 5) // Max 5 seneste samtaler
        .map(c => ({
          id: c.id,
          date: c.created_at,
          messageCount: (c.messages as Message[]).length,
          recap: generateRecap(c.messages as Message[], profile!.name),
        }));
      return NextResponse.json({ profile, recaps });
    }

    return NextResponse.json({ profile, conversations });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    if (!data.name?.trim()) {
      return NextResponse.json({ error: 'Navn er påkrævet' }, { status: 400 });
    }
    const profile = await updateProfile(id, {
      name: data.name.trim(),
      age: data.age ? parseInt(data.age, 10) : null,
      family: data.family || '',
      interests: data.interests || '',
      stories: data.stories || '',
    });
    return NextResponse.json(profile);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);

    // ?clear=conversations — slet kun samtaler, behold profil
    if (searchParams.get('clear') === 'conversations') {
      const count = await clearConversationsByProfile(id);
      return NextResponse.json({ success: true, cleared: count });
    }

    // Default: slet hele profilen (+ samtaler via CASCADE)
    await deleteProfile(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
