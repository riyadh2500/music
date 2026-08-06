import { supabaseAdmin as supabase } from "../../../lib/supabaseAdmin";

// ── helper: silently insert a notification ───────────────────────────────────
async function notify({ userId, actorId, type, message }) {
  if (userId === actorId) return;
  try {
    await supabase.from("notifications").insert({
      user_id:  userId,
      actor_id: actorId,
      type,
      message,
      read:     false,
    });
  } catch (e) {
    console.error("notify() failed:", e);
  }
}

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
      // Unfollow — remove notification too (best-effort)
      await supabase.from("follows").delete().eq("id", existing.id);
      await supabase
        .from("notifications")
        .delete()
        .eq("actor_id", followerId)
        .eq("type", "follow")
        .eq("user_id", followingId);

      return res.status(200).json({ following: false });
    } else {
      // Follow
      await supabase.from("follows").insert({
        follower_id:  followerId,
        following_id: followingId,
      });

      // Get follower username for the message
      const { data: follower } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", followerId)
        .single();

      await notify({
        userId:  followingId,
        actorId: followerId,
        type:    "follow",
        message: `started following you`,
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
