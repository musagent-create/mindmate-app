import { NextRequest, NextResponse } from 'next/server';
import { getProfile, updateProfile, deleteProfile, getConversationsByProfile, clearConversationsByProfile } from '@/lib/memory';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const profile = await getProfile(id);
    if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const conversations = await getConversationsByProfile(id);
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
