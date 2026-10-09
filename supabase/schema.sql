-- ==============================================================================
-- TYPEFLOW - SUPABASE DATABASE SCHEMA MIGRATION
-- ==============================================================================

-- 1. Profiles Table (Linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  test_count INTEGER DEFAULT 0,
  wpm_history INTEGER[] DEFAULT '{}',
  accuracy_history NUMERIC[] DEFAULT '{}',
  leaderboard_rank INTEGER,
  leaderboard_score INTEGER,
  last_leaderboard_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to automatically create a profile when a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Scores Table
CREATE TABLE IF NOT EXISTS public.scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  wpm INTEGER NOT NULL,
  accuracy NUMERIC(5, 2) NOT NULL,
  difficulty TEXT DEFAULT 'medium',
  mode TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scores_wpm_created ON public.scores (wpm DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_scores_user ON public.scores (user_id);

-- 3. Daily Challenges Table
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date_key TEXT UNIQUE NOT NULL,
  text TEXT NOT NULL,
  source TEXT DEFAULT 'n8n',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_daily_challenges_date_key ON public.daily_challenges (date_key);

-- 4. Leaderboard Snapshots Table
CREATE TABLE IF NOT EXISTS public.leaderboard_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date_key TEXT UNIQUE NOT NULL,
  entries JSONB DEFAULT '[]'::jsonb,
  total_ranked_users INTEGER DEFAULT 0,
  source TEXT DEFAULT 'n8n',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- Profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Scores
DROP POLICY IF EXISTS "Scores are viewable by everyone" ON public.scores;
CREATE POLICY "Scores are viewable by everyone"
  ON public.scores FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own scores" ON public.scores;
CREATE POLICY "Users can insert their own scores"
  ON public.scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Daily Challenges
DROP POLICY IF EXISTS "Challenges are viewable by everyone" ON public.daily_challenges;
CREATE POLICY "Challenges are viewable by everyone"
  ON public.daily_challenges FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role can modify challenges" ON public.daily_challenges;
CREATE POLICY "Service role can modify challenges"
  ON public.daily_challenges FOR ALL
  USING (true);

-- Leaderboard Snapshots
DROP POLICY IF EXISTS "Snapshots are viewable by everyone" ON public.leaderboard_snapshots;
CREATE POLICY "Snapshots are viewable by everyone"
  ON public.leaderboard_snapshots FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role can modify snapshots" ON public.leaderboard_snapshots;
CREATE POLICY "Service role can modify snapshots"
  ON public.leaderboard_snapshots FOR ALL
  USING (true);

