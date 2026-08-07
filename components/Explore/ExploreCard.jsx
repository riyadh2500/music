import React, { useState, useContext } from "react";
import { BsPlayFill, BsPauseFill } from "react-icons/bs";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import toast from "react-hot-toast";
import { AudioPlayerContext } from "../../context/AudioPlayerContext";

// ── Floating music note particles on play ───────────────────
const NOTES = ["♪", "♫", "♩", "♬"];

const ExploreCard = ({ item, user }) => {
  const [liked, setLiked]         = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const [notes, setNotes]         = useState([]);
  const context = useContext(AudioPlayerContext);

  const {
    currentTrack = null,
    isPlaying    = false,
    playTrack    = () => {},
    pauseTrack   = () => {},
  } = context || {};

  const isCurrentTrack = currentTrack?.id === item.id;
  const isThisPlaying  = isCurrentTrack && isPlaying;

  const handlePlay = (e) => {
    e.stopPropagation();
    if (isCurrentTrack) {
      isPlaying ? pauseTrack?.() : playTrack?.(item);
    } else {
      playTrack?.(item);
      // Spawn floating notes
      const newNotes = Array.from({ length: 4 }, (_, i) => ({
        id:   Date.now() + i,
        note: NOTES[i % NOTES.length],
        left: 30 + Math.random() * 40,
      }));
      setNotes((prev) => [...prev, ...newNotes]);
      setTimeout(() => setNotes([]), 3000);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) { toast.error("Sign in to like tracks"); return; }

    const next = !liked;
    setLiked(next);
    if (next) {
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 500);
    }
    toast(next ? "Added to liked songs ❤️" : "Removed from liked songs");

    try {
      const res = await fetch("/api/likes", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ postId: item.id, userId: user.id }),
      });
      if (!res.ok) {
        setLiked(!next);
        toast.error("Couldn't update like. Try again.");
      }
    } catch {
      setLiked(!next);
      toast.error("Couldn't update like. Try again.");
    }
  };

  const coverSrc   = item.cover_url || item.coverUrl;
  const coverStyle = coverSrc
    ? { backgroundImage: `url(${coverSrc})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: item.cover_gradient || item.coverGradient || "linear-gradient(135deg,#1e3a5f,#0f2027)" };

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(16,185,129,0.08)",
        borderRadius: 12, overflow: "hidden", cursor: "pointer",
        transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
        e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,0.12), 0 0 0 1px rgba(16,185,129,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
      }}
    >
      <div
        style={{
          height: 140, ...coverStyle,
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", overflow: "hidden",
        }}
      >
        {/* Play button */}
        <div
          onClick={handlePlay}
          style={{
            width: 44, height: 44, borderRadius: "50%",
            background: isThisPlaying ? "rgba(16,185,129,0.9)" : "rgba(255,255,255,0.2)",
            border: "2px solid rgba(255,255,255,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s, transform 0.15s",
            transform: "scale(1)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {isThisPlaying ? <BsPauseFill size={20} color="#fff" /> : <BsPlayFill size={20} color="#fff" />}
        </div>

        {/* Like button */}
        <button
          onClick={handleLike}
          style={{
            position: "absolute", top: 10, right: 10,
            background: liked ? "rgba(239,68,68,0.15)" : "rgba(0,0,0,0.3)",
            border: "none", borderRadius: "50%",
            width: 30, height: 30,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "background 0.2s",
            animation: heartAnim ? "heartBurst 0.5s ease-out" : "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = liked ? "rgba(239,68,68,0.3)" : "rgba(0,0,0,0.5)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = liked ? "rgba(239,68,68,0.15)" : "rgba(0,0,0,0.3)")}
        >
          {liked
            ? <AiFillHeart size={14} color="#ef4444" />
            : <AiOutlineHeart size={14} color="#fff" />}
        </button>

        {/* Equalizer bars while playing */}
        {isThisPlaying && (
          <div style={{
            position: "absolute", bottom: 8, left: 10,
            display: "flex", alignItems: "flex-end", gap: 2,
          }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  width: 3, borderRadius: 2,
                  background: "#10b981",
                  animationName: "equalizer",
                  animationDuration: "0.8s",
                  animationTimingFunction: "ease-in-out",
                  animationIterationCount: "infinite",
                  animationDelay: `${i * 0.15}s`,
                  height: 12,
                }}
              />
            ))}
          </div>
        )}

        {/* Floating music notes */}
        {notes.map((n) => (
          <span
            key={n.id}
            style={{
              position: "absolute", bottom: 30,
              left: `${n.left}%`,
              fontSize: 16, color: "#10b981",
              animation: "float 2.5s ease-out forwards",
              pointerEvents: "none", zIndex: 10,
            }}
          >
            {n.note}
          </span>
        ))}
      </div>

      {/* Card info */}
      <div style={{ padding: "12px 14px" }}>
        <div style={{
          fontWeight: 600, fontSize: 14, color: "#171717",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {item.title}
        </div>
        <div style={{
          fontSize: 12, color: "#737373", marginTop: 3,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {item.artist || item.profile?.username || "Unknown Artist"}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: "#a3a3a3" }}>
          <span>{item.plays || 0} plays</span>
          <span style={{
            background: "#f0fdf4", color: "#059669",
            padding: "2px 8px", borderRadius: 20, fontWeight: 500,
          }}>
            {item.genre || "Electronic"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExploreCard;
