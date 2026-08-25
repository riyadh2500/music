import { supabase } from "../../../lib/supabase";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  // Authenticate via Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: error.message });

  // Fetch profile using admin client (bypasses RLS)
  const { data: profile, error: profileErr } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profileErr || !profile) {
    // Profile may not exist yet — create it
    const { data: newProfile } = await supabaseAdmin
      .from("profiles")
      .insert({ id: data.user.id, email, username: email.split("@")[0], music_token_balance: 1000 })
      .select()
      .single();
    return res.status(200).json({ user: newProfile });
  }

  return res.status(200).json({ user: profile });
}
