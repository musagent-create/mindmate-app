import { Message } from './claude';
import { supabaseAdmin } from './supabase';

// ─── Profile types ───────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  name: string;
  age: number | null;
  family: string;
  interests: string;
  stories: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  profile_id: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

// ─── Profile CRUD ────────────────────────────────────────────────────────────

export async function createProfile(data: {
  name: string;
  age?: number | null;
  family?: string;
  interests?: string;
  stories?: string;
}): Promise<Profile> {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .insert({
      name: data.name,
      age: data.age || null,
      family: data.family || '',
      interests: data.interests || '',
      stories: data.stories || '',
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create profile: ${error.message}`);
  return profile;
}

export async function getProfile(id: string): Promise<Profile | null> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select()
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select()
    .order('updated_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch profiles: ${error.message}`);
  return data || [];
}

export async function updateProfile(id: string, data: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>): Promise<Profile> {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update profile: ${error.message}`);
  return profile;
}

export async function deleteProfile(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Failed to delete profile: ${error.message}`);
}

// ─── Conversation CRUD ───────────────────────────────────────────────────────

export async function getOrCreateConversation(profileId: string): Promise<Conversation> {
  // Hent den seneste aktive samtale (opdateret inden for sidste 24 timer)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: existing } = await supabaseAdmin
    .from('conversations')
    .select()
    .eq('profile_id', profileId)
    .gte('updated_at', oneDayAgo)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (existing) return existing;

  // Opret ny samtale
  const { data: conversation, error } = await supabaseAdmin
    .from('conversations')
    .insert({ profile_id: profileId, messages: [] })
    .select()
    .single();

  if (error) throw new Error(`Failed to create conversation: ${error.message}`);
  return conversation;
}

export async function addMessageToConversation(conversationId: string, message: Message): Promise<void> {
  // Hent nuværende beskeder
  const { data: conv, error: fetchError } = await supabaseAdmin
    .from('conversations')
    .select('messages')
    .eq('id', conversationId)
    .single();

  if (fetchError) throw new Error(`Failed to fetch conversation: ${fetchError.message}`);

  const messages = [...(conv.messages as Message[]), message];

  const { error } = await supabaseAdmin
    .from('conversations')
    .update({ messages })
    .eq('id', conversationId);

  if (error) throw new Error(`Failed to add message: ${error.message}`);
}

export async function getConversationsByProfile(profileId: string): Promise<Conversation[]> {
  const { data, error } = await supabaseAdmin
    .from('conversations')
    .select()
    .eq('profile_id', profileId)
    .order('updated_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch conversations: ${error.message}`);
  return data || [];
}

// ─── Legacy helpers (bruges af chat route) ───────────────────────────────────

export function buildUserContext(profile: Profile): string {
  return [
    `Brugerens navn er ${profile.name}.`,
    profile.age && `${profile.name} er ${profile.age} år gammel.`,
    profile.family && `Familie: ${profile.family}`,
    profile.interests && `Interesser: ${profile.interests}`,
    profile.stories && `Historier og minder: ${profile.stories}`,
  ].filter(Boolean).join('\n');
}
