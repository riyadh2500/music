import React, { useState, useContext } from "react";
import {
  BsPlayFill, BsPauseFill,
  BsSkipStartFill, BsSkipEndFill,
  BsShuffle, BsRepeat,
} from "react-icons/bs";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { HiOutlineVolumeUp, HiOutlineVolumeOff } from "react-icons/hi";
import { AudioPlayerContext } from "../../context/AudioPlayerContext";

const fmt = (s) => {
  const m   = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

// ── Equalizer visualizer bars ────────────────────────────────
const Equalizer = () => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 18, marginLeft: 6 }}>
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        style={{
          width: 3, borderRadius: 2,
          background: "linear-gradient(to top, #10b981, #34d399)",
          animationName: "equalizer",
          animationDuration: "0.7s",
          animationTimingFunction: "ease-in-out",
          animationIterationCount: "infinite",
          animationDelay: `${i * 0.18}s`,
          height: "100%",
        }}
      />
    ))}
  </div>
);

const Player = () => {
  const context = useContext(AudioPlayerContext);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted]   = useState(false);
  const [liked, setLiked]   = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);

  const {
    currentTrack = null,
    isPlaying    = false,
    progress     = 0,
    duration     = 0,
    playTrack    = () => {},
    pauseTrack   = () => {},
    seekTo       = () => {},
    setVolume: setVol = () => {},
  } = context || {};

  if (!currentTrack) return null;

  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;
  const coverSrc    = currentTrack.cover_url || currentTrack.coverUrl;
  const coverBg     = currentTrack.cover_gradient || currentTrack.coverGradient;

  const handleLike = () => {
    const next = !liked;
    setLiked(next);
    if (next) {
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 500);
    }
  };

  return (
    <div
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, height: 72,
        background: "linear-gradient(90deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%)",
        borderTop: "1px solid #222",
        display: "flex", alignItems: "center",
        padding: "0 24px", gap: 24, zIndex: 1600,
        animation: "slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      {/* ── Track info ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, width: 240, flexShrink: 0 }}>
        {/* Vinyl cover — spins while playing */}
        <div
          style={{
            width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
            background: coverSrc
              ? `url(${coverSrc}) center/cover no-repeat`
              : (coverBg || "linear-gradient(135deg,#10b981,#059669)"),
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid #333",
            boxShadow: isPlaying ? "0 0 0 3px rgba(16,185,129,0.3)" : "none",
            animationName:           isPlaying ? "vinylSpin" : "none",
            animationDuration:       "4s",
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            transition: "box-shadow 0.3s",
          }}
        >
          {!coverSrc && <span style={{ fontSize: 18 }}>🎵</span>}
        </div>

        <div style={{ overflow: "hidden", flex: 1 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: "#fff",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {currentTrack.title}
          </div>
          <div style={{ fontSize: 11, color: "#a3a3a3", marginTop: 2 }}>
            {currentTrack.artist || currentTrack.profile?.username || "Unknown Artist"}
          </div>
        </div>

        {/* Equalizer visible when playing */}
        {isPlaying && <Equalizer />}

        {/* Like */}
        <button
          onClick={handleLike}
          style={{
            background: "none", border: "none", cursor: "pointer", flexShrink: 0,
            animation: heartAnim ? "heartBurst 0.5s ease-out" : "none",
          }}
        >
          {liked
            ? <AiFillHeart size={17} color="#ef4444" />
            : <AiOutlineHeart size={17} color="#555" />}
        </button>
      </div>

      {/* ── Controls + progress ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", transition: "color 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}>
            <BsShuffle size={15} color="inherit" />
          </button>
          <button style={{ background: "none", border: "none", cursor: "pointer" }}>
            <BsSkipStartFill size={18} color="#aaa" />
          </button>

          {/* Play/Pause with pulse ring */}
          <div style={{ position: "relative" }}>
            {isPlaying && (
              <div style={{
                position: "absolute", inset: -4, borderRadius: "50%",
                border: "2px solid rgba(16,185,129,0.4)",
                animation: "pulse 1.5s ease-in-out infinite",
              }} />
            )}
            <button
              onClick={() => isPlaying ? pauseTrack() : playTrack(currentTrack)}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: isPlaying
                  ? "linear-gradient(135deg,#10b981,#059669)"
                  : "#fff",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "transform 0.15s, background 0.2s",
                boxShadow: isPlaying ? "0 0 16px rgba(16,185,129,0.4)" : "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {isPlaying
                ? <BsPauseFill size={18} color="#fff" />
                : <BsPlayFill size={18} color="#111" />}
            </button>
          </div>

          <button style={{ background: "none", border: "none", cursor: "pointer" }}>
            <BsSkipEndFill size={18} color="#aaa" />
          </button>
          <button style={{ background: "none", border: "none", cursor: "pointer" }}>
            <BsRepeat size={15} color="#555" />
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", maxWidth: 500 }}>
          <span style={{ fontSize: 11, color: "#666", width: 32, textAlign: "right" }}>
            {fmt(progress)}
          </span>
          <div
            style={{
              flex: 1, height: 4, background: "#2a2a2a",
              borderRadius: 2, position: "relative", cursor: "pointer",
            }}
            onClick={(e) => {
              const rect  = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              seekTo(ratio * duration);
            }}
            onMouseEnter={(e) => (e.currentTarget.style.height = "6px")}
            onMouseLeave={(e) => (e.currentTarget.style.height = "4px")}
          >
            <div style={{
              width: `${progressPct}%`, height: "100%",
              background: "linear-gradient(90deg, #059669, #10b981, #34d399)",
              borderRadius: 2,
              transition: "width 0.1s linear",
            }} />
            {/* Thumb dot */}
            <div style={{
              position: "absolute", top: "50%", left: `${progressPct}%`,
              transform: "translate(-50%, -50%)",
              width: 12, height: 12, borderRadius: "50%",
              background: "#10b981", opacity: progressPct > 0 ? 1 : 0,
              boxShadow: "0 0 6px rgba(16,185,129,0.6)",
              transition: "left 0.1s linear",
            }} />
          </div>
          <span style={{ fontSize: 11, color: "#666", width: 32 }}>
            {fmt(duration)}
          </span>
        </div>
      </div>

      {/* ── Volume ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, width: 140, flexShrink: 0 }}>
        <button
          onClick={() => setMuted((m) => !m)}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          {muted
            ? <HiOutlineVolumeOff size={17} color="#666" />
            : <HiOutlineVolumeUp size={17} color="#666" />}
        </button>
        <input
          type="range" min={0} max={100}
          value={muted ? 0 : volume}
          onChange={(e) => {
            const v = +e.target.value;
            setVolume(v); setVol(v); setMuted(false);
          }}
          style={{ width: 90, accentColor: "#10b981", cursor: "pointer" }}
        />
      </div>
    </div>
  );
};

export default Player;
