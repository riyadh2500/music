import { supabaseAdmin as supabase } from "../../../lib/supabaseAdmin";

// POST /api/auth/callback — upserts profile after OAuth login (no wallet generation)
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId, email, name, avatar_url } = req.body;
  if (!userId || !email) return res.status(400).json({ error: "userId and email are required" });

  const { data: existing } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("id", userId)
    .maybeSingle();

  let profile;
  if (!existing) {
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: userId, email,
        username: name || email.split("@")[0],
        avatar_url: avatar_url || null,
        music_token_balance: 1000,
        updated_at: new Date().toISOString(),
      })
      .select().single();
    if (error) return res.status(400).json({ error: error.message });
    profile = data;
  } else {
    const { data, error } = await supabase
      .from("profiles")
      .update({ avatar_url: avatar_url || null, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select().single();
    if (error) return res.status(400).json({ error: error.message });
    profile = data;
  }

  return res.status(200).json({ user: profile });
}
