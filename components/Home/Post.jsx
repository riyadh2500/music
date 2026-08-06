import React, { useState, useContext } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FiMessageCircle, FiShare2, FiDownload } from "react-icons/fi";
import { BsPlayFill, BsPauseFill } from "react-icons/bs";
import toast from "react-hot-toast";
import { AudioPlayerContext } from "../../Context/AudioPlayerContext";

const GENRE_COLORS = {
  Electronic: "#8b5cf6", "Hip-Hop": "#f59e0b",
  Pop: "#ec4899", Jazz: "#3b82f6", Rock: "#ef4444",
};

const Post = ({ post, user }) => {
  const context = useContext(AudioPlayerContext);
  const initialLikes    = post?.likes?.[0]?.count ?? 0;
  const initialComments = post?.comments?.[0]?.count ?? 0;

  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);

  // Safely destructure (context might be null during SSR)
  const {
    currentTrack = null,
    isPlaying = false,
    playTrack = () => {},
    pauseTrack = () => {},
  } = context || {};

  const audioUrl = post?.audio_url || post?.audioUrl;
  const isCurrentTrack = currentTrack?.id === post?.id;
  const isThisPlaying = isCurrentTrack && isPlaying;

  const handlePlay = () => {
    if (!audioUrl) { toast.error("No audio file for this track."); return; }
    
    if (isCurrentTrack) {
      isPlaying ? pauseTrack() : playTrack(post);
    } else {
      playTrack({ ...post, audioUrl });
    }
  };

  const handleLike = async () => {
    if (!user) { toast.error("Sign in to like tracks"); return; }
    const next = !liked;
    setLiked(next);
    setLikes((n) => (next ? n + 1 : n - 1));
    try {
      await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, userId: user.id }),
      });
    } catch {
      setLiked(!next);
      setLikes((n) => (!next ? n + 1 : n - 1));
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success("Link copied!");
  };

  const handleDownload = async () => {
    if (!user) { toast.error("Sign in to download tracks"); return; }
    if (!audioUrl) { toast.error("No audio file available"); return; }
    
    const loadingToast = toast.loading("Processing download...");
    try {
      const res = await fetch("/api/downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, userId: user.id }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (data.insufficientTokens) {
          toast.error(`You need ${data.required} MUSIC tokens. You have ${data.balance}. Buy more tokens!`, { id: loadingToast });
          return;
        }
        throw new Error(data.error || "Download failed");
      }

      // Download the file
      const link = document.createElement("a");
      link.href = data.downloadUrl;
      link.download = `${post.title || "track"}.mp3`;
      link.click();

      toast.success(`Downloaded! -10 MUSIC (Balance: ${data.newBalance})`, { id: loadingToast });
    } catch (err) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  const genre      = post?.genre || "Electronic";
  const genreColor = GENRE_COLORS[genre] || "#10b981";
  const artistName = post?.profile?.username || post?.artist || "Unknown Artist";

  return (
    <div
      style={{
        background: "#fff", border: "1px solid #e5e5e5",
        borderRadius: 12, overflow: "hidden", marginBottom: 16,
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* Cover */}
      <div
        onClick={handlePlay}
        style={{
          height: 180, cursor: "pointer",
          background: post?.cover_gradient || "linear-gradient(135deg,#0f0f0f,#1f2d3d)",
          backgroundImage: post?.cover_url ? `url(${post.cover_url})` : undefined,
          backgroundSize: "cover", backgroundPosition: "center",
          position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <button style={{
          width: 52, height: 52, borderRadius: "50%",
          background: isThisPlaying ? "rgba(16,185,129,0.9)" : "rgba(255,255,255,0.2)",
          border: "2px solid rgba(255,255,255,0.6)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(8px)", transition: "background 0.2s",
        }}>
          {isThisPlaying ? <BsPauseFill size={22} color="#fff" /> : <BsPlayFill size={22} color="#fff" />}
        </button>
        <span style={{ position: "absolute", top: 12, right: 12, background: genreColor, color: "#fff", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
          {genre}
        </span>
        <span style={{ position: "absolute", bottom: 10, left: 14, color: "rgba(255,255,255,0.8)", fontSize: 12 }}>
          {post?.duration || "—"}
        </span>
        {isThisPlaying && (
          <span style={{ position: "absolute", bottom: 10, right: 14, color: "#10b981", fontSize: 11, fontWeight: 600 }}>
            ● PLAYING
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          {/* Profile avatar - show image if available */}
          {post?.profile?.avatar_url ? (
            <img
              src={post.profile.avatar_url}
              alt={artistName}
              style={{
                width: 36, height: 36, borderRadius: "50%",
                flexShrink: 0, objectFit: "cover",
              }}
            />
          ) : (
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg,#10b981,#059669)",
              flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: 14,
            }}>
              {artistName[0]?.toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: "#171717" }}>{post?.title}</div>
            <div style={{ fontSize: 13, color: "#737373", marginTop: 2 }}>{artistName}</div>
          </div>
        </div>

        {post?.description && (
          <p style={{ fontSize: 13, color: "#525252", marginTop: 10, lineHeight: 1.6 }}>
            {post.description}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 14, paddingTop: 12, borderTop: "1px solid #f0f0f0" }}>
          <button onClick={handleLike} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            fontSize: 13, color: liked ? "#ef4444" : "#737373", padding: 0,
          }}>
            {liked ? <AiFillHeart size={17} /> : <AiOutlineHeart size={17} />}
            {likes}
          </button>
          <button onClick={() => toast("Comments coming soon! 💬")}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#737373", padding: 0 }}>
            <FiMessageCircle size={15} /> {initialComments}
          </button>
          <button onClick={handleDownload}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#737373", padding: 0 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#10b981")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#737373")}
            title="Download (10 MUSIC)">
            <FiDownload size={15} /> Download
          </button>
          <button onClick={handleShare}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#737373", padding: 0, marginLeft: "auto" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#10b981")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#737373")}>
            <FiShare2 size={15} /> Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default Post;
