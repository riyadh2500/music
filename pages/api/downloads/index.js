import { supabaseAdmin as supabase } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { postId, userId } = req.body;

  if (!postId || !userId) {
    return res.status(400).json({ error: "postId and userId are required" });
  }

  const DOWNLOAD_COST = 10; // MUSIC tokens

  try {
    // Get post and creator info
    const { data: post, error: postErr } = await supabase
      .from("posts")
      .select("id, user_id, title, audio_url")
      .eq("id", postId)
      .single();

    if (postErr || !post) {
      return res.status(404).json({ error: "Track not found" });
    }

    if (!post.audio_url) {
      return res.status(400).json({ error: "This track has no audio file" });
    }

    // Can't download your own track
    if (post.user_id === userId) {
      return res.status(400).json({ error: "You can't download your own track" });
    }

    // Get downloader balance
    const { data: downloader, error: downloaderErr } = await supabase
      .from("profiles")
      .select("id, music_tokens")
      .eq("id", userId)
      .single();

    if (downloaderErr || !downloader) {
      return res.status(404).json({ error: "User not found" });
    }

    const downloaderBalance = downloader.music_tokens ?? 0;
    if (downloaderBalance < DOWNLOAD_COST) {
      return res.status(400).json({
        error: `Insufficient MUSIC tokens. You need ${DOWNLOAD_COST} MUSIC to download. You have ${downloaderBalance} MUSIC.`,
        insufficientTokens: true,
        required: DOWNLOAD_COST,
        balance: downloaderBalance,
      });
    }

    // Get creator balance
    const { data: creator, error: creatorErr } = await supabase
      .from("profiles")
      .select("id, music_tokens")
      .eq("id", post.user_id)
      .single();

    if (creatorErr || !creator) {
      return res.status(404).json({ error: "Creator not found" });
    }

    const creatorBalance = creator.music_tokens ?? 0;

    // Deduct from downloader
    await supabase
      .from("profiles")
      .update({ music_tokens: downloaderBalance - DOWNLOAD_COST })
      .eq("id", userId);

    // Add to creator
    await supabase
      .from("profiles")
      .update({ music_tokens: creatorBalance + DOWNLOAD_COST })
      .eq("id", post.user_id);

    // Log the download transaction (optional - you can create a downloads table later)
    // For now, just return success

    return res.status(200).json({
      success: true,
      downloadUrl: post.audio_url,
      tokensDeducted: DOWNLOAD_COST,
      newBalance: downloaderBalance - DOWNLOAD_COST,
      creatorEarned: DOWNLOAD_COST,
    });
  } catch (error) {
    console.error("Download error:", error);
    return res.status(500).json({ error: "Download failed" });
  }
}
