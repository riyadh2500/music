-- Run this in Supabase SQL Editor to permanently fix RLS
-- =========================================================

-- 1. Disable RLS on all tables
ALTER TABLE public.profiles        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts           DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes           DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_purchases DISABLE ROW LEVEL SECURITY;

-- 2. Also add wallet_encrypted_key and generated_wallet_address columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS wallet_encrypted_key TEXT,
  ADD COLUMN IF NOT EXISTS generated_wallet_address TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS twitter TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS website TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS music_tokens INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
