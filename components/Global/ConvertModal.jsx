import React, { useState } from "react";
import { BsMusicNote } from "react-icons/bs";
import { FiX, FiExternalLink, FiArrowRight } from "react-icons/fi";
import toast from "react-hot-toast";

const ETH_PER_TOKEN = 0.00007;
const USER_SHARE    = 0.90;

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #e5e5e5",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.15s",
};

const ConvertModal = ({ onClose, user }) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [tokensAmount, setTokensAmount]   = useState("");
  const [loading, setLoading]             = useState(false);
  const [result, setResult]               = useState(null); // { txHash, ethSent, newBalance }

  const tokens    = parseInt(tokensAmount, 10) || 0;
  const totalEth  = tokens * ETH_PER_TOKEN;
  const userEth   = parseFloat((totalEth * USER_SHARE).toFixed(10));
  const balance   = user?.music_token_balance ?? 0;
  const hasEnough = balance >= tokens && tokens > 0;

  const handleConvert = async (e) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error("Please sign in first.");
      return;
    }
    if (!walletAddress.trim()) {
      toast.error("Please enter your Ethereum wallet address.");
      return;
    }
    if (tokens < 1) {
      toast.error("Enter the number of tokens to convert.");
      return;
    }
    if (!hasEnough) {
      toast.error(`Insufficient balance. You have ${balance} MUSIC.`);
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch("/api/convert", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId:          user.id,
          walletAddress:   walletAddress.trim(),
          tokensToConvert: tokens,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Conversion failed. Please try again.");
        return;
      }

      setResult(data);
      toast.success(`Converted ${tokens.toLocaleString()} MUSIC → ${data.ethSent} ETH!`);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
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
      <div style={{
        background: "#fff", borderRadius: 20, width: "100%", maxWidth: 460,
        boxShadow: "0 24px 60px rgba(0,0,0,0.2)", overflow: "hidden",
      }}>

        {/* ── Header ── */}
        <div style={{
          background: "linear-gradient(135deg,#0d3b2e,#10b981)",
          padding: "24px 28px 20px", color: "#fff", position: "relative",
        }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 16, right: 16,
              background: "rgba(255,255,255,0.15)", border: "none",
              borderRadius: "50%", width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff",
            }}
          >
            <FiX size={16} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <BsMusicNote size={20} color="#fff" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 700 }}>Convert Tokens</span>
          </div>
          <p style={{ margin: 0, opacity: 0.85, fontSize: 13 }}>
            Exchange MUSIC tokens for Sepolia ETH — sent directly to your wallet
          </p>
        </div>

        <div style={{ padding: 28 }}>

          {/* ── Success state ── */}
          {result ? (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ fontSize: 52, marginBottom: 10 }}>🎉</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#171717", marginBottom: 6 }}>
                Conversion Complete!
              </div>

              {/* Summary pill row */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 10, margin: "16px 0",
              }}>
                <div style={{
                  background: "#f0fdf4", borderRadius: 10, padding: "10px 16px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 11, color: "#737373", marginBottom: 2 }}>Converted</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#059669" }}>
                    {result.tokensConverted.toLocaleString()} MUSIC
                  </div>
                </div>
                <FiArrowRight size={20} color="#a3a3a3" />
                <div style={{
                  background: "#eff6ff", borderRadius: 10, padding: "10px 16px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 11, color: "#737373", marginBottom: 2 }}>Received</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#1d4ed8" }}>
                    {result.ethSent} ETH
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 13, color: "#737373", marginBottom: 4 }}>
                New MUSIC balance:{" "}
                <strong style={{ color: "#171717" }}>{result.newBalance.toLocaleString()} MUSIC</strong>
              </div>

              {result.txHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${result.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    fontSize: 12, color: "#10b981", marginTop: 12, marginBottom: 20,
                  }}
                >
                  View on Sepolia Etherscan <FiExternalLink size={12} />
                </a>
              )}

              <br />
              <button
                onClick={onClose}
                style={{
                  padding: "10px 32px", background: "#10b981", color: "#fff",
                  border: "none", borderRadius: 10, fontWeight: 600,
                  fontSize: 14, cursor: "pointer",
                }}
              >
                Done
              </button>
            </div>

          ) : (
            /* ── Form state ── */
            <form onSubmit={handleConvert}>

              {/* Current balance */}
              <div style={{
                background: "#f0fdf4", border: "1px solid #a7f3d0",
                borderRadius: 10, padding: "10px 14px", marginBottom: 20,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: 12, color: "#065f46" }}>Your MUSIC Balance</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#059669" }}>
                  {balance.toLocaleString()} MUSIC
                </span>
              </div>

              {/* Wallet address */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                  Ethereum Wallet Address
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  style={inputStyle}
                  onFocus={(e)  => (e.target.style.borderColor = "#10b981")}
                  onBlur={(e)   => (e.target.style.borderColor = "#e5e5e5")}
                />
                <p style={{ fontSize: 11, color: "#a3a3a3", margin: "4px 0 0" }}>
                  ETH will be sent to this address on Sepolia testnet
                </p>
              </div>

              {/* Token amount */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                  MUSIC Tokens to Convert
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  min="1"
                  max={balance}
                  value={tokensAmount}
                  onChange={(e) => setTokensAmount(e.target.value)}
                  style={inputStyle}
                  onFocus={(e)  => (e.target.style.borderColor = "#10b981")}
                  onBlur={(e)   => (e.target.style.borderColor = "#e5e5e5")}
                />
              </div>

              {/* Live conversion preview */}
              {tokens > 0 && (
                <div style={{
                  background: "#fafafa", border: "1px solid #e5e5e5",
                  borderRadius: 10, padding: "12px 14px", marginBottom: 20,
                }}>
                  <div style={{ fontSize: 12, color: "#737373", marginBottom: 8 }}>
                    Conversion Preview
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: "#737373" }}>Rate</span>
                    <span style={{ fontWeight: 500 }}>1 MUSIC = {ETH_PER_TOKEN} ETH</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: "#737373" }}>Gross amount</span>
                    <span style={{ fontWeight: 500 }}>{totalEth.toFixed(6)} ETH</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: "#737373" }}>Platform fee (10 %)</span>
                    <span style={{ fontWeight: 500, color: "#ef4444" }}>
                      − {(totalEth * 0.10).toFixed(6)} ETH
                    </span>
                  </div>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    fontSize: 14, fontWeight: 700, paddingTop: 8,
                    borderTop: "1px solid #e5e5e5", marginTop: 4,
                  }}>
                    <span>You receive</span>
                    <span style={{ color: "#059669" }}>{userEth.toFixed(6)} ETH</span>
                  </div>

                  {!hasEnough && tokens > 0 && (
                    <div style={{
                      marginTop: 8, padding: "6px 10px",
                      background: "#fef2f2", borderRadius: 6,
                      fontSize: 12, color: "#ef4444",
                    }}>
                      ⚠️ Insufficient balance — you need {tokens - balance} more MUSIC
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !hasEnough || !walletAddress.trim()}
                style={{
                  width: "100%", padding: "12px 0",
                  background: loading || !hasEnough || !walletAddress.trim()
                    ? "#a3a3a3"
                    : "#10b981",
                  color: "#fff", border: "none", borderRadius: 10,
                  fontSize: 14, fontWeight: 600,
                  cursor: loading || !hasEnough || !walletAddress.trim()
                    ? "not-allowed"
                    : "pointer",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 8,
                }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "#fff", borderRadius: "50%",
                      display: "inline-block", animation: "spin 0.7s linear infinite",
                    }} />
                    Processing…
                  </>
                ) : (
                  <>Convert {tokens > 0 ? `${tokens.toLocaleString()} MUSIC` : "Tokens"} <FiArrowRight size={14} /></>
                )}
              </button>

              {!user?.id && (
                <p style={{ textAlign: "center", fontSize: 12, color: "#ef4444", marginTop: 10 }}>
                  ⚠️ Sign in first to convert tokens
                </p>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ConvertModal;
