import React, { useState } from "react";
import { FiX, FiEye, FiEyeOff, FiCopy, FiExternalLink, FiAlertTriangle } from "react-icons/fi";
import { BsWallet2 } from "react-icons/bs";
import toast from "react-hot-toast";

const ExportWallet = ({ onClose, user }) => {
  const [step, setStep]             = useState("confirm"); // confirm | revealed
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  const [address, setAddress]       = useState("");
  const [showKey, setShowKey]       = useState(false);

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!user?.id) { toast.error("Not logged in"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/wallet/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Export failed"); setLoading(false); return; }

      setPrivateKey(data.privateKey);
      setAddress(data.address);
      setStep("revealed");
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(privateKey);
    toast.success("Private key copied!");
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied!");
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.7)", zIndex: 10000,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#fff", borderRadius: 20, width: "100%", maxWidth: 460,
        boxShadow: "0 24px 60px rgba(0,0,0,0.3)", overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{
          background: "#111", padding: "20px 24px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BsWallet2 size={18} color="#10b981" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>Export Wallet</div>
              <div style={{ fontSize: 11, color: "#737373" }}>Your MusicDapp Ethereum wallet</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "#222", border: "none", borderRadius: "50%",
            width: 30, height: 30, display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer",
          }}>
            <FiX size={14} color="#fff" />
          </button>
        </div>

        <div style={{ padding: 24 }}>

          {step === "confirm" ? (
            <>
              {/* Warning */}
              <div style={{
                background: "#fff7ed", border: "1px solid #fed7aa",
                borderRadius: 10, padding: "12px 14px", marginBottom: 20,
                display: "flex", gap: 10, alignItems: "flex-start",
              }}>
                <FiAlertTriangle size={16} color="#f97316" style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 13, color: "#9a3412", lineHeight: 1.5 }}>
                  <strong>Never share your private key.</strong> Anyone with it has full control of your wallet and funds. Only import it into MetaMask on your own device.
                </div>
              </div>

              <form onSubmit={handleConfirm}>
                {/* Show password field only for email/password users */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "#525252", display: "block", marginBottom: 6 }}>
                    Confirm your identity
                  </label>
                  {/* Show identity confirmation — for email users ask for password, others just confirm */}
                  <div style={{
                    background: "#f0fdf4", border: "1px solid #a7f3d0",
                    borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#065f46",
                    marginBottom: 8,
                  }}>
                    ✓ Logged in as <strong>{user?.email}</strong>
                  </div>
                  {/* Optional password confirmation for extra security */}
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password (optional extra confirmation)"
                      style={{
                        width: "100%", padding: "10px 40px 10px 14px",
                        border: "1px solid #e5e5e5", borderRadius: 8,
                        fontSize: 14, outline: "none", boxSizing: "border-box",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                      onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      style={{ position: "absolute", right: 12, top: 11, background: "none", border: "none", cursor: "pointer" }}
                    >
                      {showPassword ? <FiEyeOff size={15} color="#a3a3a3" /> : <FiEye size={15} color="#a3a3a3" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%", padding: "12px 0",
                    background: loading ? "#a3a3a3" : "#ef4444",
                    color: "#fff", border: "none", borderRadius: 10,
                    fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Verifying…" : "Show Private Key"}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Revealed state */}
              <div style={{
                background: "#f0fdf4", border: "1px solid #a7f3d0",
                borderRadius: 10, padding: "12px 14px", marginBottom: 16,
                fontSize: 13, color: "#065f46",
              }}>
                ✓ Identity verified. Keep this information private.
              </div>

              {/* Wallet address */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#737373", marginBottom: 6 }}>WALLET ADDRESS</div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "#f5f5f5", padding: "10px 12px", borderRadius: 8,
                }}>
                  <code style={{ fontSize: 12, color: "#171717", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {address}
                  </code>
                  <button onClick={copyAddress} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                    <FiCopy size={13} color="#737373" />
                  </button>
                  <a href={`https://sepolia.etherscan.io/address/${address}`} target="_blank" rel="noreferrer">
                    <FiExternalLink size={13} color="#10b981" />
                  </a>
                </div>
              </div>

              {/* Private key */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "#ef4444", marginBottom: 6, fontWeight: 600 }}>
                  ⚠ PRIVATE KEY — DO NOT SHARE
                </div>
                <div style={{
                  background: "#1a1a1a", borderRadius: 8, padding: "12px 14px",
                  position: "relative",
                }}>
                  <code style={{
                    fontSize: 12, color: showKey ? "#10b981" : "transparent",
                    wordBreak: "break-all", lineHeight: 1.6,
                    textShadow: showKey ? "none" : "0 0 8px #10b981",
                    userSelect: showKey ? "text" : "none",
                    display: "block",
                  }}>
                    {privateKey}
                  </code>
                  {!showKey && (
                    <div style={{
                      position: "absolute", inset: 0, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      borderRadius: 8,
                    }}>
                      <button
                        onClick={() => setShowKey(true)}
                        style={{
                          background: "#10b981", color: "#fff", border: "none",
                          borderRadius: 8, padding: "8px 20px", fontSize: 13,
                          fontWeight: 600, cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 6,
                        }}
                      >
                        <FiEye size={14} /> Reveal Key
                      </button>
                    </div>
                  )}
                </div>

                {showKey && (
                  <button
                    onClick={copyKey}
                    style={{
                      width: "100%", marginTop: 8, padding: "9px 0",
                      background: "#171717", color: "#fff", border: "none",
                      borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}
                  >
                    <FiCopy size={13} /> Copy Private Key
                  </button>
                )}
              </div>

              {/* MetaMask import instructions */}
              <div style={{
                background: "#f5f5f5", borderRadius: 8, padding: "12px 14px",
                fontSize: 12, color: "#525252", lineHeight: 1.6,
              }}>
                <strong>Import into MetaMask:</strong><br />
                MetaMask → Account menu → Import Account → Paste private key → Import
              </div>

              <button
                onClick={() => { setShowKey(false); setPrivateKey(""); setStep("confirm"); }}
                style={{
                  width: "100%", marginTop: 14, padding: "10px 0",
                  background: "#f5f5f5", color: "#525252", border: "none",
                  borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer",
                }}
              >
                Done — Hide Key
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportWallet;
