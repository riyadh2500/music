import { supabaseAdmin as supabase } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {

  // ── GET /api/notifications?userId=x ─────────────────────────────────────
  if (req.method === "GET") {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const { data, error } = await supabase
      .from("notifications")
      .select(`
        *,
        actor:profiles!notifications_actor_id_fkey(id, username, avatar_url)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Notifications fetch error:", error);
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ notifications: data || [] });
  }

  // ── POST /api/notifications — create a notification ──────────────────────
  if (req.method === "POST") {
    const { userId, actorId, type, postId = null, message } = req.body;

    if (!userId || !type) {
      return res.status(400).json({ error: "userId and type are required" });
    }
    // Don't notify yourself
    if (userId === actorId) {
      return res.status(200).json({ skipped: true, reason: "self-notification" });
    }

    const { data, error } = await supabase.from("notifications").insert({
      user_id:  userId,
      actor_id: actorId || null,
      type,
      post_id:  postId || null,
      message:  message || null,
      read:     false,
    }).select().single();

    if (error) {
      console.error("Notification insert error:", error);
      return res.status(400).json({ error: error.message });
    }
    return res.status(201).json({ notification: data });
  }

  // ── PUT /api/notifications — mark all read ───────────────────────────────
  if (req.method === "PUT") {
    const { userId: uid } = req.body;
    if (!uid) return res.status(400).json({ error: "userId is required" });

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", uid)
      .eq("read", false);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: "All marked as read" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
