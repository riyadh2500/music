import { supabaseAdmin as supabase } from "../../../lib/supabaseAdmin";

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
      // Unlike
      await supabase.from("likes").delete().eq("id", existing.id);
      const { count } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);
      return res.status(200).json({ liked: false, count });
    } else {
      // Like
      await supabase.from("likes").insert({ post_id: postId, user_id: userId });
      const { count } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);
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
