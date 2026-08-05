import React, { useState } from "react";
import { BsPlayFill, BsPauseFill } from "react-icons/bs";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import toast from "react-hot-toast";

const ExploreCard = ({ item }) => {
  const [liked, setLiked] = useState(false);
  const [playing, setPlaying] = useState(false);

  const handlePlay = (e) => {
    e.stopPropagation();
    const next = !playing;
    setPlaying(next);
    toast(next ? `Now playing: ${item.title}` : "Paused", { icon: next ? "▶️" : "⏸" });
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked((l) => !l);
    toast(liked ? "Removed from liked songs" : "Added to liked songs ❤️");
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          height: 140,
          background: item.gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          onClick={handlePlay}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: playing ? "rgba(16,185,129,0.9)" : "rgba(255,255,255,0.2)",
            border: "2px solid rgba(255,255,255,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s",
          }}
        >
          {playing ? <BsPauseFill size={20} color="#fff" /> : <BsPlayFill size={20} color="#fff" />}
        </div>

        <button
          onClick={handleLike}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "rgba(0,0,0,0.3)",
            border: "none",
            borderRadius: "50%",
            width: 30,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.5)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.3)")}
        >
          {liked ? <AiFillHeart size={14} color="#ef4444" /> : <AiOutlineHeart size={14} color="#fff" />}
        </button>

        {playing && (
          <span style={{ position: "absolute", bottom: 6, left: 10, fontSize: 10, color: "#10b981", fontWeight: 700 }}>
            ● PLAYING
          </span>
        )}
      </div>

      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: "#171717" }}>{item.title}</div>
        <div style={{ fontSize: 12, color: "#737373", marginTop: 3 }}>{item.artist}</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: "#a3a3a3" }}>
          <span>{item.plays} plays</span>
          <span
            style={{
              background: item.tagColor || "#f0fdf4",
              color: item.tagTextColor || "#059669",
              padding: "2px 8px",
              borderRadius: 20,
              fontWeight: 500,
            }}
          >
            {item.genre}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExploreCard;
