import React from "react";
import { BsPlayFill } from "react-icons/bs";

const PlayNow = ({ track }) => {
  const t = track || {
    title: "Midnight Vibes",
    artist: "CryptoBeats",
    gradient: "linear-gradient(135deg,#1e3a5f,#0f2027)",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: 10,
        padding: "10px 14px",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          background: t.gradient,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BsPlayFill size={16} color="#fff" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#171717" }}>{t.title}</div>
        <div style={{ fontSize: 11, color: "#737373" }}>{t.artist}</div>
      </div>
    </div>
  );
};

export default PlayNow;
