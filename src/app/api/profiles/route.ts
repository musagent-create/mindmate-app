import { NextRequest, NextResponse } from 'next/server';
import { getAllProfiles, createProfile } from '@/lib/memory';

export async function GET() {
  try {
    const profiles = await getAllProfiles();
    return NextResponse.json(profiles);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.name?.trim()) {
      return NextResponse.json({ error: 'Navn er påkrævet' }, { status: 400 });
    }
    const profile = await createProfile({
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
