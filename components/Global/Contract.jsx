import React, { useState } from "react";
import { FiX, FiExternalLink, FiCopy } from "react-icons/fi";
import { BsMusicNote } from "react-icons/bs";
import toast from "react-hot-toast";

const CONTRACT_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678";
const SEPOLIA_EXPLORER = "https://sepolia.etherscan.io/address/";

const CONTRACT_FUNCTIONS = [
  { name: "mintMusic()", desc: "Mint a music track as an NFT", type: "write" },
  { name: "buyTokens()", desc: "Purchase MUSIC tokens with ETH", type: "write" },
  { name: "transferToken()", desc: "Transfer tokens to another address", type: "write" },
  { name: "balanceOf()", desc: "Check token balance of an address", type: "read" },
  { name: "totalSupply()", desc: "Get total supply of MUSIC tokens", type: "read" },
  { name: "tokenURI()", desc: "Get metadata URI for an NFT", type: "read" },
];

const Contract = ({ onClose, walletAddress }) => {
  const [activeFunc, setActiveFunc] = useState(null);
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    toast.success("Contract address copied!");
  };

  const handleCall = async () => {
    if (!walletAddress) {
      toast.error("Connect your wallet first!");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    if (activeFunc.type === "read") {
      setResult(activeFunc.name === "balanceOf()" ? "1,250 MUSIC" : "10,000,000 MUSIC");
      toast.success("Query successful!");
    } else {
      setResult(null);
      toast.success(`${activeFunc.name} executed! Tx: 0xabc...def`);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.6)", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose && onClose()}
    >
      <div
        style={{
          background: "#fff", borderRadius: 20, width: "100%", maxWidth: 540,
          boxShadow: "0 24px 60px rgba(0,0,0,0.2)", maxHeight: "90vh",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#111", padding: "20px 24px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BsMusicNote size={18} color="#10b981" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>
                Smart Contract
              </div>
              <div style={{ fontSize: 11, color: "#737373" }}>Ethereum Sepolia Testnet</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#222", border: "none", borderRadius: "50%",
              width: 30, height: 30, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer",
            }}
          >
            <FiX size={14} color="#fff" />
          </button>
        </div>

        <div style={{ overflowY: "auto", flex: 1 }}>
          {/* Contract address */}
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ fontSize: 11, color: "#737373", marginBottom: 6 }}>
              CONTRACT ADDRESS
            </div>
            <div
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "#f5f5f5", padding: "8px 12px", borderRadius: 8,
              }}
            >
              <code style={{ fontSize: 12, color: "#171717", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {CONTRACT_ADDRESS}
              </code>
              <button
                onClick={copyAddress}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
              >
                <FiCopy size={13} color="#737373" />
              </button>
              <a
                href={`${SEPOLIA_EXPLORER}${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
              >
                <FiExternalLink size={13} color="#10b981" />
              </a>
            </div>
          </div>

          {/* Functions */}
          <div style={{ padding: "16px 24px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#737373", marginBottom: 12 }}>
              CONTRACT FUNCTIONS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CONTRACT_FUNCTIONS.map((fn) => (
                <div
                  key={fn.name}
                  onClick={() => { setActiveFunc(fn); setResult(null); setInput(""); }}
                  style={{
                    padding: "12px 14px",
                    border: `1px solid ${activeFunc?.name === fn.name ? "#10b981" : "#e5e5e5"}`,
                    borderRadius: 10, cursor: "pointer",
                    background: activeFunc?.name === fn.name ? "#f0fdf4" : "#fff",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <code style={{ fontSize: 13, fontWeight: 600, color: activeFunc?.name === fn.name ? "#059669" : "#171717" }}>
                      {fn.name}
                    </code>
                    <span
                      style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                        background: fn.type === "read" ? "#dbeafe" : "#fef3c7",
                        color: fn.type === "read" ? "#1e40af" : "#92400e",
                      }}
                    >
                      {fn.type.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#737373", marginTop: 3 }}>{fn.desc}</div>
                </div>
              ))}
            </div>

            {/* Interaction panel */}
            {activeFunc && (
              <div
                style={{
                  marginTop: 16, background: "#fafafa",
                  border: "1px solid #e5e5e5", borderRadius: 10, padding: 16,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: "#171717", marginBottom: 10 }}>
                  Call: <code>{activeFunc.name}</code>
                </div>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Parameters (optional)"
                  style={{
                    width: "100%", padding: "9px 12px",
                    border: "1px solid #e5e5e5", borderRadius: 8,
                    fontSize: 13, outline: "none",
                    boxSizing: "border-box", marginBottom: 10,
                    fontFamily: "monospace",
                  }}
                />
                <button
                  onClick={handleCall}
                  disabled={loading}
                  style={{
                    width: "100%", padding: "10px 0",
                    background: loading ? "#a3a3a3" : activeFunc.type === "read" ? "#1e40af" : "#10b981",
                    color: "#fff", border: "none", borderRadius: 8,
                    fontSize: 13, fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Processing…" : activeFunc.type === "read" ? "Query" : "Execute"}
                </button>
                {result && (
                  <div
                    style={{
                      marginTop: 10, padding: "10px 12px",
                      background: "#f0fdf4", borderRadius: 8,
                      fontSize: 13, color: "#065f46", fontWeight: 500,
                    }}
                  >
                    Result: {result}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contract;
