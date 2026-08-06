import { supabaseAdmin as supabase } from "../../../lib/supabaseAdmin";

// GET /api/notifications/debug?userId=xxx
// Returns raw notification rows + any table errors so we can diagnose issues
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "GET only" });

  const { userId } = req.query;

  // 1. Check if notifications table exists by trying a count
  const { count, error: tableErr } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true });

  if (tableErr) {
    return res.status(200).json({
      tableExists: false,
      tableError: tableErr.message,
      fix: "Run the notifications table SQL in Supabase SQL Editor",
    });
  }

  // 2. Get all notifications for this user (raw, no joins)
  const { data: rows, error: rowErr } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  // 3. Get total count in table
  const { count: totalCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true });

  return res.status(200).json({
    tableExists: true,
    totalRowsInTable: totalCount,
    rowsForUser: rows?.length ?? 0,
    rows: rows ?? [],
    rowError: rowErr?.message ?? null,
  });
}
