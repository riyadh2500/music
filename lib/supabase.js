import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // During build time on Vercel, just use placeholder values
  // The actual runtime will have the correct env vars from Vercel settings
  console.warn("Missing Supabase environment variables - using placeholders for build");
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    db: {
      schema: "public",
    },
    global: {
      headers: {
        "Accept-Profile": "public",
        "Content-Profile": "public",
      },
    },
  }
);
