import React, { useState, useEffect } from "react";
import Feed from "./Feed";
import Music from "./Music";
import RightSidebar from "../RightSidebar/RightSidebar";
import toast from "react-hot-toast";

// Floating particle notes for hero banner
const NOTES = ["♪", "♫", "♩", "♬", "🎵", "🎶"];
const FloatingNotes = () => (
  <>
    {NOTES.map((note, i) => (
      <span key={i} style={{
        position: "absolute",
        left:    `${10 + i * 15}%`,
        bottom:  `${10 + (i % 3) * 20}%`,
        fontSize: 14 + (i % 3) * 4,
        opacity: 0.15,
        color: "#fff",
        animationName: "float",
        animationDuration: `${3 + i * 0.5}s`,
        animationTimingFunction: "ease-out",
        animationIterationCount: "infinite",
        animationDelay: `${i * 0.6}s`,
        pointerEvents: "none",
      }}>
        {note}
      </span>
    ))}
  </>
);

const Home = ({ user }) => {
  const [following, setFollowing] = useState(false);
  const [mounted, setMounted]     = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handlePlay = () => {
    toast("Now playing: The Blockchain Coders ▶️", { icon: "🎵" });
  };

  const handleFollow = () => {
    const next = !following;
    setFollowing(next);
    toast.success(next ? "Following The Blockchain Coders!" : "Unfollowed.");
  };

  return (
    <div
      className="animate-fadeIn"
      style={{ display: "flex", gap: 24, alignItems: "flex-start", maxWidth: 1200, margin: "0 auto" }}
    >
      {/* Main feed */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Hero banner */}
        <div
          className="animate-slideUp"
          style={{
            background: "linear-gradient(135deg,#0d3b2e 0%,#065f46 50%,#10b981 100%)",
            borderRadius: 16, padding: "32px 28px", marginBottom: 24,
            color: "#fff", position: "relative", overflow: "hidden",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.01)";
            e.currentTarget.style.boxShadow = "0 20px 50px rgba(16,185,129,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {/* Static circles */}
          <div style={{
            position: "absolute", top: -40, right: -40,
            width: 200, height: 200, borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            animation: "pulse 4s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", bottom: -60, right: 60,
            width: 160, height: 160, borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            animation: "pulse 4s ease-in-out infinite 2s",
          }} />

          {/* Floating notes */}
          {mounted && <FloatingNotes />}

          <div style={{ position: "relative", zIndex: 1 }}>
            <span
              className="animate-slideUp"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: 20, padding: "4px 12px",
                fontSize: 12, fontWeight: 500,
                marginBottom: 12, display: "inline-block",
                animationDelay: "0.1s", animationFillMode: "backwards",
              }}
            >
              🔥 Featured Artist
            </span>
            <h1
              className="animate-slideUp"
              style={{
                margin: "8px 0 6px", fontSize: 28, fontWeight: 700,
                letterSpacing: "-0.5px",
                animationDelay: "0.2s", animationFillMode: "backwards",
              }}
            >
              The Blockchain Coders
            </h1>
            <p
              className="animate-slideUp"
              style={{
                margin: "0 0 20px", opacity: 0.8, fontSize: 14, maxWidth: 400,
                animationDelay: "0.3s", animationFillMode: "backwards",
              }}
            >
              Pioneering the future of decentralized music. Stream, collect, and own your favorite tracks as NFTs.
            </p>
            <div
              className="animate-slideUp"
              style={{
                display: "flex", gap: 12,
                animationDelay: "0.4s", animationFillMode: "backwards",
              }}
            >
              <button
                onClick={handlePlay}
                style={{
                  background: "#fff", color: "#065f46",
                  border: "none", borderRadius: 8,
                  padding: "10px 22px", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.08)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                ▶ Play Now
              </button>
              <button
                onClick={handleFollow}
                style={{
                  background: following ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)",
                  color: following ? "#065f46" : "#fff",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: 8, padding: "10px 22px",
                  fontSize: 14, fontWeight: 500, cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                  transform: following ? "scale(1.05)" : "scale(1)",
                }}
              >
                {following ? "✓ Following" : "Follow"}
              </button>
            </div>
          </div>
        </div>

        <div className="animate-slideUp" style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}>
          <Music />
        </div>
        <div className="animate-slideUp" style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}>
          <Feed user={user} />
        </div>
      </div>

      {/* Right sidebar */}
      <RightSidebar />
    </div>
  );
};

export default Home;
