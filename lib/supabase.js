import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// In production (client-side), env vars MUST be present
if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("FATAL: Missing Supabase environment variables in browser!");
    console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓" : "✗ MISSING");
    console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✓" : "✗ MISSING");
  }
}

// Use actual values or throw during runtime
if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === "production" && typeof window !== "undefined") {
    throw new Error("Cannot initialize Supabase without credentials");
  }
}

const url = supabaseUrl || "https://placeholder.supabase.co";
const key = supabaseAnonKey || "placeholder-key";

export const supabase = createClient(url, key, {
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
});
