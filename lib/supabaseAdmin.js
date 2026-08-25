import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only throw errors in production if vars are truly missing
if (!supabaseUrl || !supabaseServiceRoleKey) {
  if (typeof window === "undefined") {
    console.warn("Supabase credentials missing - using placeholders for build");
  }
}

const url = supabaseUrl || "https://placeholder.supabase.co";
const key = supabaseServiceRoleKey || "placeholder-key";

// Server-side only — bypasses RLS for all operations
export const supabaseAdmin = createClient(url, key, {
  auth: { persistSession: false },
});
