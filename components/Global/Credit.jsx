import React from "react";

const Credit = ({ balance = "0.00", symbol = "MUSIC" }) => {
  return (
    <div
      style={{
        background: "linear-gradient(135deg,#0d3b2e,#10b981)",
        borderRadius: 12,
        padding: 20,
        color: "#fff",
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Your Balance</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
        {balance} <span style={{ fontSize: 16, opacity: 0.8 }}>{symbol}</span>
      </div>
      <div style={{ fontSize: 12, opacity: 0.7 }}>≈ $0.00 USD</div>
    </div>
  );
};

export default Credit;
