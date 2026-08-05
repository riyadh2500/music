import React from "react";
import { BsMusicNote } from "react-icons/bs";

const Footer = () => {
  return (
    <footer
      style={{
        borderTop: "1px solid #e5e5e5",
        padding: "24px 0 100px",
        marginTop: 40,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              background: "linear-gradient(135deg,#10b981,#059669)",
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BsMusicNote size={13} color="#fff" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#171717" }}>MusicDapp</span>
        </div>
        <div style={{ fontSize: 12, color: "#a3a3a3" }}>
          © 2024 MusicDapp. Built on the blockchain.
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#737373" }}>
          <span style={{ cursor: "pointer" }}>Terms</span>
          <span style={{ cursor: "pointer" }}>Privacy</span>
          <span style={{ cursor: "pointer" }}>Docs</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
