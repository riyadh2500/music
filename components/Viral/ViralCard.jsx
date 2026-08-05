import React, { useState } from "react";
import { BsPlayFill, BsPauseFill } from "react-icons/bs";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import toast from "react-hot-toast";

const ViralCard = ({ track, rank }) => {
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);

  const handlePlay = () => {
    const next = !playing;
    setPlaying(next);
    toast(next ? `Now playing: ${track.title}` : "Paused", { icon: next ? "▶️" : "⏸" });
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked((l) => !l);
    toast(liked ? "Removed from liked songs" : "Added to liked songs ❤️");
  };

  return (
    <div
      onClick={handlePlay}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 16px",
        background: playing ? "#f0fdf4" : "#fff",
        border: `1px solid ${playing ? "#a7f3d0" : "#e5e5e5"}`,
        borderRadius: 10,
        marginBottom: 10,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => { if (!playing) { e.currentTarget.style.background = "#fafafa"; e.currentTarget.style.borderColor = "#d4d4d4"; } }}
      onMouseLeave={(e) => { if (!playing) { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e5e5e5"; } }}
    >
      <span
        style={{
          fontSize: 16,
          fontWeight: 800,
          color: rank <= 3 ? "#10b981" : "#d4d4d4",
          width: 24,
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        {rank}
      </span>

      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 8,
          background: track.gradient,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {playing ? <BsPauseFill size={18} color="#fff" /> : <BsPlayFill size={18} color="#fff" />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: playing ? "#10b981" : "#171717", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {track.title}
        </div>
        <div style={{ fontSize: 12, color: "#737373", marginTop: 2 }}>{track.artist}</div>
      </div>

      <button
        onClick={handleLike}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 4, flexShrink: 0 }}
      >
        {liked ? <AiFillHeart size={15} color="#ef4444" /> : <AiOutlineHeart size={15} color="#a3a3a3" />}
      </button>

      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#171717" }}>{track.plays}</div>
        <div style={{ fontSize: 11, color: "#10b981", marginTop: 2 }}>▲ {track.change}</div>
      </div>
    </div>
  );
};

export default ViralCard;
