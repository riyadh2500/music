import { supabaseAdmin as supabase } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {

  // GET /api/posts
  if (req.method === "GET") {
    const { limit = 20, offset = 0, genre, userId, search } = req.query;

    let query = supabase
      .from("posts")
      .select(`
        *,
        profile:profiles(id, username, avatar_url),
        likes(count),
        comments(count)
      `)
      .order("created_at", { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (genre && genre !== "All") query = query.eq("genre", genre);
    if (userId) query = query.eq("user_id", userId);
    if (search && search.trim()) {
      query = query.or(
        `title.ilike.%${search.trim()}%,artist.ilike.%${search.trim()}%`
      );
    }

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ posts: data });
  }

  // POST /api/posts
  if (req.method === "POST") {
    const {
      userId, title, artist, genre, description,
      duration, coverGradient, coverUrl, audioUrl, nftPrice,
    } = req.body;

    if (!userId || !title) {
      return res.status(400).json({ error: "userId and title are required" });
    }

    const UPLOAD_COST = 10; // MUSIC tokens per upload

    // ── Check user has enough MUSIC tokens ───────────────
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, music_tokens")
      .eq("id", userId)
      .single();

    if (profileErr || !profile) {
      return res.status(400).json({ error: "User profile not found." });
    }

    const currentTokens = profile.music_tokens ?? 0;
    if (currentTokens < UPLOAD_COST) {
      return res.status(400).json({
        error: `Insufficient MUSIC tokens. You need ${UPLOAD_COST} MUSIC to upload. You have ${currentTokens} MUSIC.`,
        insufficientTokens: true,
        required: UPLOAD_COST,
        balance: currentTokens,
      });
    }

    // ── Insert post ───────────────────────────────────────
    const insertData = {
      user_id:     userId,
      title,
      artist:      artist || "Unknown Artist",
      genre:       genre  || "Electronic",
      description: description || "",
      duration:    duration    || "0:00",
      audio_url:   audioUrl    || null,
      plays:       0,
    };

    if (coverUrl)      insertData.cover_url      = coverUrl;
    if (coverGradient) insertData.cover_gradient = coverGradient;
    if (nftPrice)      insertData.nft_price      = nftPrice;

    const { data, error } = await supabase
      .from("posts")
      .insert(insertData)
      .select(`*, profile:profiles(id, username, avatar_url)`)
      .single();

    if (error) {
      console.error("posts insert error:", error);
      return res.status(400).json({ error: error.message });
    }

    // ── Deduct 10 MUSIC tokens ────────────────────────────
    await supabase
      .from("profiles")
      .update({ music_tokens: currentTokens - UPLOAD_COST })
      .eq("id", userId);

    return res.status(201).json({
      post: data,
      tokensDeducted: UPLOAD_COST,
      newTokenBalance: currentTokens - UPLOAD_COST,
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
