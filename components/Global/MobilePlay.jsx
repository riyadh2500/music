import React, { useState } from "react";
import { BsPlayFill, BsPauseFill, BsSkipEndFill, BsSkipStartFill } from "react-icons/bs";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

const DEMO = { title: "Midnight Vibes", artist: "CryptoBeats", duration: 210 };

const MobilePlay = ({ track = DEMO }) => {
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <div
      className="mobilePlayer"
      style={{
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        background: "#111",
        borderTop: "1px solid #2a2a2a",
        zIndex: 1800,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Progress bar */}
      <div
        style={{ height: 3, background: "#333", cursor: "pointer" }}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setProgress(Math.round(((e.clientX - r.left) / r.width) * track.duration));
        }}
      >
        <div
          style={{
            width: `${(progress / track.duration) * 100}%`,
            height: "100%", background: "#10b981",
          }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 12 }}>
        {/* Cover */}
        <div
          style={{
            width: 40, height: 40, borderRadius: 6, flexShrink: 0,
            background: "linear-gradient(135deg,#1e3a5f,#10b981)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 16 }}>🎵</span>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {track.title}
          </div>
          <div style={{ fontSize: 11, color: "#737373" }}>{track.artist}</div>
        </div>

        {/* Like */}
        <button onClick={() => setLiked((l) => !l)} style={{ background: "none", border: "none", cursor: "pointer" }}>
          {liked ? <AiFillHeart size={18} color="#10b981" /> : <AiOutlineHeart size={18} color="#737373" />}
        </button>

        {/* Controls */}
        <button style={{ background: "none", border: "none", cursor: "pointer" }}>
          <BsSkipStartFill size={20} color="#d4d4d4" />
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "#fff", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {playing ? <BsPauseFill size={16} color="#111" /> : <BsPlayFill size={16} color="#111" />}
        </button>
        <button style={{ background: "none", border: "none", cursor: "pointer" }}>
          <BsSkipEndFill size={20} color="#d4d4d4" />
        </button>
      </div>
    </div>
  );
};

export default MobilePlay;
