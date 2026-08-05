import { supabaseAdmin as supabase } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {

  // POST /api/follows — toggle follow
  if (req.method === "POST") {
    const { followerId, followingId } = req.body;

    if (!followerId || !followingId) {
      return res.status(400).json({ error: "followerId and followingId are required" });
    }
    if (followerId === followingId) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    const { data: existing } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", followerId)
      .eq("following_id", followingId)
      .single();

    if (existing) {
      await supabase.from("follows").delete().eq("id", existing.id);
      return res.status(200).json({ following: false });
    } else {
      await supabase.from("follows").insert({
        follower_id: followerId,
        following_id: followingId,
      });
      return res.status(200).json({ following: true });
    }
  }

  // GET /api/follows?followerId=x&followingId=y
  if (req.method === "GET") {
    const { followerId, followingId } = req.query;
    const { data } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", followerId)
      .eq("following_id", followingId)
      .single();

    return res.status(200).json({ following: !!data });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
