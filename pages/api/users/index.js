import { supabaseAdmin as supabase } from "../../../lib/supabaseAdmin";

// GET /api/users — list all profiles (creators page)
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { search, limit = 20, offset = 0 } = req.query;

  let query = supabase
    .from("profiles")
    .select("id, username, avatar_url, bio, wallet_address, created_at")
    .order("created_at", { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (search) {
    query = query.ilike("username", `%${search}%`);
  }

  const { data, error } = await query;

  if (error) return res.status(400).json({ error: error.message });
  return res.status(200).json({ users: data });
}
