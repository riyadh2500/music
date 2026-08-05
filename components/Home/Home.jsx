import React, { useState } from "react";
import Feed from "./Feed";
import Music from "./Music";
import RightSidebar from "../RightSidebar/RightSidebar";
import toast from "react-hot-toast";

const Home = ({ user }) => {
  const [following, setFollowing] = useState(false);

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
      style={{
        display: "flex",
        gap: 24,
        alignItems: "flex-start",
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      {/* Main feed */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Hero banner */}
        <div
          style={{
            background: "linear-gradient(135deg,#0d3b2e 0%,#065f46 50%,#10b981 100%)",
            borderRadius: 16,
            padding: "32px 28px",
            marginBottom: 24,
            color: "#fff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute", top: -40, right: -40,
              width: 200, height: 200, borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
            }}
          />
          <div
            style={{
              position: "absolute", bottom: -60, right: 60,
              width: 160, height: 160, borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <span
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: 20,
                padding: "4px 12px",
                fontSize: 12,
                fontWeight: 500,
                marginBottom: 12,
                display: "inline-block",
              }}
            >
              🔥 Featured Artist
            </span>
            <h1 style={{ margin: "8px 0 6px", fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px" }}>
              The Blockchain Coders
            </h1>
            <p style={{ margin: "0 0 20px", opacity: 0.8, fontSize: 14, maxWidth: 400 }}>
              Pioneering the future of decentralized music. Stream, collect, and own your favorite tracks as NFTs.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={handlePlay}
                style={{
                  background: "#fff",
                  color: "#065f46",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 22px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "transform 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                ▶ Play Now
              </button>
              <button
                onClick={handleFollow}
                style={{
                  background: following ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)",
                  color: following ? "#065f46" : "#fff",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: 8,
                  padding: "10px 22px",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {following ? "✓ Following" : "Follow"}
              </button>
            </div>
          </div>
        </div>

        <Music />
        <Feed user={user} />
      </div>

      {/* Right sidebar */}
      <RightSidebar />
    </div>
  );
};

export default Home;
