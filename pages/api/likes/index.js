import { supabaseAdmin as supabase } from "../../../lib/supabaseAdmin";

// ── helper: silently insert a notification ───────────────────────────────────
async function notify({ userId, actorId, type, postId = null, message }) {
  // Don't notify yourself
  if (userId === actorId) return;
  try {
    await supabase.from("notifications").insert({
      user_id:  userId,
      actor_id: actorId,
      type,
      post_id:  postId,
      message,
      read:     false,
    });
  } catch (e) {
    console.error("notify() failed:", e);
  }
}

export default async function handler(req, res) {
  const { postId, userId } = req.body || req.query;

  // POST /api/likes — toggle like
  if (req.method === "POST") {
    if (!postId || !userId) {
      return res.status(400).json({ error: "postId and userId are required" });
    }

    // Check if already liked
    const { data: existing } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single();

    if (existing) {
      // Unlike — remove notification too (best-effort)
      await supabase.from("likes").delete().eq("id", existing.id);
      await supabase
        .from("notifications")
        .delete()
        .eq("actor_id", userId)
        .eq("type", "like")
        .eq("post_id", postId);

      const { count } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);

      return res.status(200).json({ liked: false, count });
    } else {
      // Like — insert like row
      await supabase.from("likes").insert({ post_id: postId, user_id: userId });

      const { count } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);

      // Get post creator so we can notify them
      const { data: post } = await supabase
        .from("posts")
        .select("user_id, title")
        .eq("id", postId)
        .single();

      if (post) {
        await notify({
          userId:  post.user_id,
          actorId: userId,
          type:    "like",
          postId,
          message: `liked your track "${post.title || "your track"}"`,
        });
      }

      return res.status(200).json({ liked: true, count });
    }
  }

  // GET /api/likes?postId=x&userId=y — check if liked
  if (req.method === "GET") {
    const { data } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single();

    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    return res.status(200).json({ liked: !!data, count });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
