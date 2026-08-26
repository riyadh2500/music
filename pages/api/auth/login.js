import { supabase } from "../../../lib/supabase";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  try {
    // Authenticate via Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: error.message });

    if (!data?.user) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    // Fetch profile using admin client (bypasses RLS)
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileErr || !profile) {
      // Profile doesn't exist - create it now
      console.log("Profile not found for user, creating:", data.user.id);
      
      const { data: newProfile, error: insertErr } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: data.user.id,
          email: email,
          username: email.split("@")[0],
          music_token_balance: 1000,
        })
        .select()
        .single();

      if (insertErr) {
        console.error("Failed to create profile:", insertErr);
        return res.status(500).json({ error: "Failed to create profile: " + insertErr.message });
      }

      return res.status(200).json({ user: newProfile });
    }

    return res.status(200).json({ user: profile });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Login failed: " + error.message });
  }
}
