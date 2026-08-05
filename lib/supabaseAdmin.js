import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// In API routes, env vars MUST be present
if (typeof window === "undefined" && (!supabaseUrl || !supabaseServiceRoleKey)) {
  console.error("FATAL: Missing Supabase admin environment variables!");
  console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓" : "✗ MISSING");
  console.error("SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceRoleKey ? "✓" : "✗ MISSING");
}

// Use placeholders ONLY during build
const url = supabaseUrl || "https://placeholder.supabase.co";
const key = supabaseServiceRoleKey || "placeholder-key";

// Server-side only — bypasses RLS for all operations
export const supabaseAdmin = createClient(url, key, {
  auth: { persistSession: false },
});
