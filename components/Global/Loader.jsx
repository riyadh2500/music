import React from "react";

const Loader = ({ fullScreen = false }) => {
  const bars = [0, 1, 2, 3, 4];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...(fullScreen
          ? { position: "fixed", inset: 0, background: "rgba(255,255,255,0.85)", zIndex: 9999 }
          : { padding: "40px 0" }),
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 32 }}>
        {bars.map((i) => (
          <div
            key={i}
            style={{
              width: 5,
              borderRadius: 3,
              background: "#10b981",
              animation: `musicBar 1s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
              height: "100%",
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes musicBar {
          0%, 100% { transform: scaleY(0.2); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
};

export default Loader;
