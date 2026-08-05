import { supabaseAdmin as supabase } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  const { id } = req.query;

  // GET /api/users/:id
  if (req.method === "GET") {
    // Fetch profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return res.status(404).json({ error: "User not found" });

    // Fetch post count
    const { count: postCount } = await supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", id);

    // Fetch follower/following counts (graceful if follows table missing)
    let followersCount = 0;
    let followingCount = 0;
    try {
      const { count: fc } = await supabase
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("following_id", id);
      followersCount = fc ?? 0;

      const { count: fg } = await supabase
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("follower_id", id);
      followingCount = fg ?? 0;
    } catch { /* follows table may not exist yet */ }

    return res.status(200).json({
      user: {
        ...profile,
        post_count:       postCount    ?? 0,
        followers_count:  followersCount,
        following_count:  followingCount,
      },
    });
  }

  // PUT /api/users/:id
  if (req.method === "PUT") {
    const { username, bio, twitter, website, avatar_url, cover_url } = req.body;

    const { data, error } = await supabase
      .from("profiles")
      .update({ username, bio, twitter, website, avatar_url, cover_url, updated_at: new Date() })
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ user: data });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
