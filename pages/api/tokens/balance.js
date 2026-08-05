import { supabaseAdmin as supabase } from "../../../lib/supabaseAdmin";

// GET /api/tokens/balance?userId=xxx
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId is required" });

  const { data } = await supabase
    .from("profiles")
    .select("music_tokens")
    .eq("id", userId)
    .single();

  return res.status(200).json({ balance: data?.music_tokens ?? 0 });
}
