import { supabaseAdmin as supabase } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, password, username } = req.body;
  if (!email || !password || !username) {
    return res.status(400).json({ error: "email, password and username are required" });
  }

  // 1. Create Supabase auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) return res.status(400).json({ error: authError.message });

  const userId = authData.user?.id;
  if (!userId) return res.status(400).json({ error: "Failed to create user account" });

  // 2. Insert profile row
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert({ id: userId, username, email, music_token_balance: 1000 })
    .select()
    .single();

  if (profileError) {
    console.error("register profile insert error:", profileError);
    return res.status(400).json({ error: profileError.message });
  }

  return res.status(201).json({ user: profile });
}
