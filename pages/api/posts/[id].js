import { supabaseAdmin as supabase } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  const { id } = req.query;

  // GET /api/posts/:id
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("posts")
      .select(`*, profile:profiles(id, username, avatar_url), likes(count), comments(count)`)
      .eq("id", id)
      .single();

    if (error) return res.status(404).json({ error: "Post not found" });
    return res.status(200).json({ post: data });
  }

  // DELETE /api/posts/:id
  if (req.method === "DELETE") {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: "Post deleted" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
