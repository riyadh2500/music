-- ============================================================
-- Run ALL of this in Supabase SQL Editor
-- https://supabase.com/dashboard → your project → SQL Editor
-- ============================================================

-- 1. profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username       TEXT,
  email          TEXT,
  wallet_address TEXT UNIQUE,
  avatar_url     TEXT,
  cover_url      TEXT,
  bio            TEXT DEFAULT '',
  twitter        TEXT DEFAULT '',
  website        TEXT DEFAULT '',
  music_tokens   INTEGER DEFAULT 0,
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 2. posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  artist         TEXT DEFAULT 'Unknown Artist',
  genre          TEXT DEFAULT 'Electronic',
  description    TEXT DEFAULT '',
  duration       TEXT DEFAULT '0:00',
  cover_gradient TEXT,
  cover_url      TEXT,
  audio_url      TEXT,
  nft_price      NUMERIC(18,8),
  wallet_address TEXT,
  plays          INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 3. likes table
CREATE TABLE IF NOT EXISTS public.likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 4. comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. follows table
CREATE TABLE IF NOT EXISTS public.follows (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- 6. token_purchases table (prevents double-crediting)
CREATE TABLE IF NOT EXISTS public.token_purchases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_hash         TEXT UNIQUE NOT NULL,
  wallet_address  TEXT NOT NULL,
  tokens_credited INTEGER NOT NULL,
  eth_paid        NUMERIC(18,8) NOT NULL,
  profile_id      UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Disable RLS on all tables (dev mode — open access)
ALTER TABLE public.profiles        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts           DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes           DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_purchases DISABLE ROW LEVEL SECURITY;

-- 8. Make the music storage bucket public
-- (run separately if bucket already exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('music', 'music', true)
ON CONFLICT (id) DO UPDATE SET public = true;
