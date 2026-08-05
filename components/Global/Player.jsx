import React, { useState, useRef, useEffect } from "react";
import {
  BsPlayFill,
  BsPauseFill,
  BsSkipStartFill,
  BsSkipEndFill,
  BsShuffle,
  BsRepeat,
} from "react-icons/bs";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { HiOutlineVolumeUp, HiOutlineVolumeOff } from "react-icons/hi";

const DEMO_TRACK = {
  title: "Midnight Vibes",
  artist: "The Blockchain Coders",
  cover: "/audiowave.png",
  duration: 210,
};

const fmt = (s) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const Player = ({ track = DEMO_TRACK }) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [liked, setLiked] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => (p >= track.duration ? 0 : p + 1));
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, track.duration]);

  const progressPct = (progress / track.duration) * 100;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 72,
        background: "#111",
        borderTop: "1px solid #2a2a2a",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: 24,
        zIndex: 1600,
      }}
    >
      {/* Track info */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, width: 220, flexShrink: 0 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 6,
            background: "linear-gradient(135deg,#10b981,#059669)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 20 }}>🎵</span>
        </div>
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#fff",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {track.title}
          </div>
          <div style={{ fontSize: 11, color: "#a3a3a3", marginTop: 2 }}>{track.artist}</div>
        </div>
        <button
          onClick={() => setLiked((l) => !l)}
          style={{ background: "none", border: "none", cursor: "pointer", marginLeft: 4 }}
        >
          {liked ? (
            <AiFillHeart size={17} color="#10b981" />
          ) : (
            <AiOutlineHeart size={17} color="#737373" />
          )}
        </button>
      </div>

      {/* Controls + progress */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button style={{ background: "none", border: "none", cursor: "pointer" }}>
            <BsShuffle size={15} color="#737373" />
          </button>
          <button style={{ background: "none", border: "none", cursor: "pointer" }}>
            <BsSkipStartFill size={18} color="#d4d4d4" />
          </button>
          <button
            onClick={() => setPlaying((p) => !p)}
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "#fff",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {playing ? (
              <BsPauseFill size={18} color="#111" />
            ) : (
              <BsPlayFill size={18} color="#111" />
            )}
          </button>
          <button style={{ background: "none", border: "none", cursor: "pointer" }}>
            <BsSkipEndFill size={18} color="#d4d4d4" />
          </button>
          <button style={{ background: "none", border: "none", cursor: "pointer" }}>
            <BsRepeat size={15} color="#737373" />
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", maxWidth: 500 }}>
          <span style={{ fontSize: 11, color: "#737373", width: 32, textAlign: "right" }}>
            {fmt(progress)}
          </span>
          <div
            style={{
              flex: 1,
              height: 4,
              background: "#333",
              borderRadius: 2,
              position: "relative",
              cursor: "pointer",
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              setProgress(Math.round(ratio * track.duration));
            }}
          >
            <div
              style={{
                width: `${progressPct}%`,
                height: "100%",
                background: "#10b981",
                borderRadius: 2,
              }}
            />
          </div>
          <span style={{ fontSize: 11, color: "#737373", width: 32 }}>{fmt(track.duration)}</span>
        </div>
      </div>

      {/* Volume */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, width: 140, flexShrink: 0 }}>
        <button
          onClick={() => setMuted((m) => !m)}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          {muted ? (
            <HiOutlineVolumeOff size={17} color="#737373" />
          ) : (
            <HiOutlineVolumeUp size={17} color="#737373" />
          )}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={muted ? 0 : volume}
          onChange={(e) => { setVolume(+e.target.value); setMuted(false); }}
          style={{ width: 90, accentColor: "#10b981" }}
        />
      </div>
    </div>
  );
};

export default Player;
