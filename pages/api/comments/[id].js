import { supabase } from "../../../lib/supabase";

export default async function handler(req, res) {
  const { id } = req.query;

  // PUT /api/comments/:id — edit
  if (req.method === "PUT") {
    const { text, userId } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: "text is required" });

    const { data, error } = await supabase
      .from("comments")
      .update({ text: text.trim(), updated_at: new Date() })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ comment: data });
  }

  // DELETE /api/comments/:id
  if (req.method === "DELETE") {
    const { userId } = req.body;
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: "Comment deleted" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
