-- MindMate Supabase Schema
-- Kør dette i Supabase SQL Editor for at oprette tabellerne

-- Profiler for brugere (ældre med demens)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER,
  family TEXT,
  interests TEXT,
  stories TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Samtalehistorik per profil
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for hurtig opslag af samtaler per profil
CREATE INDEX IF NOT EXISTS idx_conversations_profile_id ON conversations(profile_id);

-- Auto-opdater updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security (deaktiveret i v1 prototype)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Tillad alt via service role (server-side)
CREATE POLICY "Service role full access on profiles"
  ON profiles FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on conversations"
  ON conversations FOR ALL
  USING (true) WITH CHECK (true);
