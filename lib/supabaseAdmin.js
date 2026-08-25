import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// In production (server-side), env vars MUST be present
if (typeof window === "undefined" && process.env.NODE_ENV === "production") {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing required Supabase environment variables in production!");
  }
}

// Use actual values or throw during build
if (!supabaseUrl || !supabaseServiceRoleKey) {
  // Only allow placeholders during local build
  if (process.env.NODE_ENV === "production") {
    throw new Error("Cannot initialize Supabase admin without credentials");
  }
}

const url = supabaseUrl || "https://placeholder.supabase.co";
const key = supabaseServiceRoleKey || "placeholder-key";

// Server-side only — bypasses RLS for all operations
export const supabaseAdmin = createClient(url, key, {
  auth: { persistSession: false },
});
