import React, { useState } from "react";
import { BsPlayFill, BsPauseFill } from "react-icons/bs";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

const SAMPLE_TRACKS = [];

const MusicRow = ({ track, index, currentPlaying, onPlay }) => {
  const [liked, setLiked] = useState(false);
  const isPlaying = currentPlaying === track.id;

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked((l) => !l);
    toast(liked ? "Removed from liked songs" : "Added to liked songs ❤️");
  };

  return (
    <div
      onClick={() => onPlay(track)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "10px 14px",
        borderRadius: 8,
        cursor: "pointer",
        background: isPlaying ? "#f0fdf4" : "transparent",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => { if (!isPlaying) e.currentTarget.style.background = "#f9f9f9"; }}
      onMouseLeave={(e) => { if (!isPlaying) e.currentTarget.style.background = "transparent"; }}
    >
      <span style={{ width: 18, fontSize: 12, color: "#a3a3a3", textAlign: "center", flexShrink: 0 }}>
        {isPlaying ? <span style={{ color: "#10b981", fontWeight: 700 }}>♫</span> : index + 1}
      </span>

      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 6,
          background: track.gradient,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isPlaying ? (
          <BsPauseFill size={18} color="#fff" />
        ) : (
          <BsPlayFill size={18} color="#fff" />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: isPlaying ? 600 : 500,
            color: isPlaying ? "#10b981" : "#171717",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {track.title}
        </div>
        <div style={{ fontSize: 12, color: "#737373", marginTop: 2 }}>{track.artist}</div>
      </div>

      <div style={{ fontSize: 12, color: "#a3a3a3", flexShrink: 0 }}>{track.plays}</div>

      <button
        onClick={handleLike}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
      >
        {liked ? (
          <AiFillHeart size={15} color="#ef4444" />
        ) : (
          <AiOutlineHeart size={15} color="#a3a3a3" />
        )}
      </button>

      <div style={{ fontSize: 12, color: "#a3a3a3", flexShrink: 0, width: 36, textAlign: "right" }}>
        {track.duration}
      </div>
    </div>
  );
};

const Music = ({ tracks = SAMPLE_TRACKS }) => {
  const [currentPlaying, setCurrentPlaying] = useState(null);
  const router = useRouter();

  const handlePlay = (track) => {
    if (currentPlaying === track.id) {
      setCurrentPlaying(null);
      toast("Paused", { icon: "⏸" });
    } else {
      setCurrentPlaying(track.id);
      toast(`Now playing: ${track.title}`, { icon: "▶️" });
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        padding: "16px 4px",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 14px 12px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#171717" }}>
          Trending Now
        </h3>
        <span
          onClick={() => router.push("/explore")}
          style={{ fontSize: 13, color: "#10b981", cursor: "pointer", fontWeight: 500 }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        >
          See all →
        </span>
      </div>

      <div style={{ marginTop: 8 }}>
        {tracks.map((track, i) => (
          <MusicRow
            key={track.id}
            track={track}
            index={i}
            currentPlaying={currentPlaying}
            onPlay={handlePlay}
          />
        ))}
      </div>
    </div>
  );
};

export default Music;
