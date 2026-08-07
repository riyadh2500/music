import React from "react";
import { useRouter } from "next/router";

const RightSidebar = () => {
  const router = useRouter();

  return (
    <aside style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Top Artists */}
      <div
        className="animate-slideUp"
        style={{
          background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, padding: 16,
          animationDelay: "0.1s", animationFillMode: "backwards",
          transition: "box-shadow 0.2s, transform 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#171717" }}>Top Artists</h3>
          <span
            onClick={() => router.push("/creator")}
            style={{ fontSize: 12, color: "#10b981", cursor: "pointer", fontWeight: 500, transition: "opacity 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            See all →
          </span>
        </div>
        <div style={{ fontSize: 12, color: "#a3a3a3", textAlign: "center", padding: "16px 0" }}>
          <span style={{ display: "block", fontSize: 24, marginBottom: 6, animation: "bounce 2s ease-in-out infinite" }}>🎤</span>
          No artists yet
        </div>
      </div>

      {/* Trending */}
      <div
        className="animate-slideUp"
        style={{
          background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, padding: 16,
          animationDelay: "0.2s", animationFillMode: "backwards",
          transition: "box-shadow 0.2s, transform 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 600, color: "#171717" }}>
          🔥 Trending
        </h3>
        <div style={{ fontSize: 12, color: "#a3a3a3", textAlign: "center", padding: "16px 0" }}>
          No trending tracks yet
        </div>
      </div>

      {/* NFT Badge */}
      <div
        className="animate-slideUp"
        style={{
          background: "linear-gradient(135deg,#0d3b2e,#10b981)",
          borderRadius: 12, padding: 16, color: "#fff",
          animationDelay: "0.3s", animationFillMode: "backwards",
          position: "relative", overflow: "hidden",
          transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
          e.currentTarget.style.boxShadow = "0 16px 40px rgba(16,185,129,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {/* Animated bg circles */}
        <div style={{
          position: "absolute", top: -20, right: -20,
          width: 100, height: 100, borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          animation: "pulse 3s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: -30, left: -10,
          width: 80, height: 80, borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
          animation: "pulse 3s ease-in-out infinite 1s",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            <span style={{ animation: "bounce 1.5s ease-in-out infinite", display: "inline-block" }}>🎵</span>
            {" "}Music NFT Drop
          </div>
          <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 12, lineHeight: 1.5 }}>
            Mint your music as an NFT and earn royalties every time it plays.
          </div>
          <button
            onClick={() => router.push("/create")}
            style={{
              width: "100%", padding: "8px 0",
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.4)",
              borderRadius: 8, color: "#fff",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              transition: "background 0.2s, transform 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.35)";
              e.currentTarget.style.transform = "scale(1.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.2)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Mint Now →
          </button>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
