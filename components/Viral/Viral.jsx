import React, { useState } from "react";
import ViralCard from "./ViralCard";

const PERIODS = ["Today", "This Week", "This Month", "All Time"];

const VIRAL_TRACKS = [];

const Viral = () => {
  const [period, setPeriod] = useState("This Week");

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: "#171717" }}>
          🔥 Viral Charts
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: "#737373" }}>
          The most-played tracks on the blockchain
        </p>
      </div>

      {/* Period tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 24,
          background: "#f5f5f5",
          padding: 4,
          borderRadius: 10,
          width: "fit-content",
        }}
      >
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              padding: "7px 16px",
              borderRadius: 7,
              border: "none",
              background: period === p ? "#fff" : "transparent",
              color: period === p ? "#171717" : "#737373",
              fontSize: 13,
              fontWeight: period === p ? 600 : 400,
              cursor: "pointer",
              boxShadow: period === p ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s",
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div>
        {VIRAL_TRACKS.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#a3a3a3" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔥</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#525252", marginBottom: 6 }}>No viral tracks yet</div>
            <div style={{ fontSize: 13 }}>Upload music to appear on the charts!</div>
          </div>
        ) : (
          VIRAL_TRACKS.map((track, i) => (
            <ViralCard key={track.id} track={track} rank={i + 1} />
          ))
        )}
      </div>
    </div>
  );
};

export default Viral;
