import { supabaseAdmin as supabase } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {

  // GET /api/comments?postId=x
  if (req.method === "GET") {
    const { postId } = req.query;
    if (!postId) return res.status(400).json({ error: "postId is required" });

    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        profile:profiles(id, username, avatar_url),
        replies:comments!comments_parent_id_fkey(
          *,
          profile:profiles(id, username, avatar_url)
        )
      `)
      .eq("post_id", postId)
      .is("parent_id", null)
      .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ comments: data });
  }

  // POST /api/comments — add comment or reply
  if (req.method === "POST") {
    const { postId, userId, text, parentId } = req.body;

    if (!postId || !userId || !text?.trim()) {
      return res.status(400).json({ error: "postId, userId and text are required" });
    }

    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: userId,
        text: text.trim(),
        parent_id: parentId || null,
      })
      .select(`
        *,
        profile:profiles(id, username, avatar_url)
      `)
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json({ comment: data });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
