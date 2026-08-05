import React from "react";
import { useRouter } from "next/router";

const RightSidebar = () => {
  const router = useRouter();

  return (
    <aside style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Top Artists */}
      <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#171717" }}>Top Artists</h3>
          <span
            onClick={() => router.push("/creator")}
            style={{ fontSize: 12, color: "#10b981", cursor: "pointer", fontWeight: 500 }}
          >
            See all →
          </span>
        </div>
        <div style={{ fontSize: 12, color: "#a3a3a3", textAlign: "center", padding: "16px 0" }}>
          🎤 No artists yet
        </div>
      </div>

      {/* Trending */}
      <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, padding: 16 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 600, color: "#171717" }}>
          🔥 Trending
        </h3>
        <div style={{ fontSize: 12, color: "#a3a3a3", textAlign: "center", padding: "16px 0" }}>
          No trending tracks yet
        </div>
      </div>

      {/* NFT Badge */}
      <div style={{ background: "linear-gradient(135deg,#0d3b2e,#10b981)", borderRadius: 12, padding: 16, color: "#fff" }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>🎵 Music NFT Drop</div>
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
          }}
        >
          Mint Now →
        </button>
      </div>

    </aside>
  );
};

export default RightSidebar;
