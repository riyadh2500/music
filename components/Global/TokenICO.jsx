import React, { useState, useEffect } from "react";
import { BsMusicNote } from "react-icons/bs";
import { FiX, FiExternalLink, FiRefreshCw, FiCopy } from "react-icons/fi";
import toast from "react-hot-toast";
import { ethers } from "ethers";

// YOUR receiver wallet — all payments go here
const RECEIVER = "0x575D7EF206B5649b1185034C74f9fBE61b0B00B3";
const SEPOLIA   = "0xaa36a7";

const PACKAGES = [
  { id: 1, tokens: 100,  price: "0.01", label: "Starter" },
  { id: 2, tokens: 500,  price: "0.04", label: "Creator", popular: true },
  { id: 3, tokens: 1000, price: "0.07", label: "Pro" },
  { id: 4, tokens: 5000, price: "0.30", label: "Studio" },
];

const TokenICO = ({ onClose, user }) => {
  const [selected, setSelected]         = useState(2);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading]           = useState(false);
  const [step, setStep]                 = useState("buy"); // buy | sent | done
  const [txHash, setTxHash]             = useState("");
  const [manualTxHash, setManualTxHash] = useState("");
  const [musicBalance, setMusicBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const pkg      = PACKAGES.find((p) => p.id === selected);
  const tokens   = customAmount ? parseInt(customAmount) : pkg.tokens;
  const ethPrice = customAmount
    ? (parseInt(customAmount) * 0.0001).toFixed(4)
    : pkg.price;

  // ── Fetch MUSIC token balance ──────────────────────────
  const fetchBalance = async () => {
    if (!user?.id) return;
    setBalanceLoading(true);
    try {
      const res = await fetch(`/api/wallet/balance?userId=${user.id}`);
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        setMusicBalance(data.musicTokens ?? 0);
      } else {
        console.error("Non-JSON response from balance API");
        setMusicBalance(0);
      }
    } catch (err) {
      console.error("Balance fetch error:", err);
      setMusicBalance(0);
    } finally {
      setBalanceLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [user?.id]);

  // ── Option A: Pay via MetaMask (if installed) ──────────
  const payWithMetaMask = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask not found — use manual payment below.");
      return;
    }
    setLoading(true);
    try {
      // Switch to Sepolia
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA }],
      });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer   = provider.getSigner();
      const tx = await signer.sendTransaction({
        to: RECEIVER,
        value: ethers.utils.parseEther(ethPrice),
      });
      setTxHash(tx.hash);
      setManualTxHash(tx.hash);
      toast.success("Transaction sent! Waiting for confirmation…");
      await tx.wait(1);
      await creditTokens(tx.hash);
    } catch (err) {
      if (err.code === 4001) toast.error("Transaction rejected.");
      else toast.error(err.message?.slice(0, 80) || "Transaction failed");
      setLoading(false);
    }
  };

  // ── Credit tokens after payment verified ──────────────
  const creditTokens = async (hash) => {
    const h = hash || manualTxHash;
    if (!h?.trim()) { toast.error("Please paste your transaction hash."); return; }
    if (!user?.id)  { toast.error("Please sign in first."); return; }

    setLoading(true);
    try {
      const res  = await fetch("/api/tokens/credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash: h.trim(),
          userId: user?.id || null,
          walletAddress: user?.generated_wallet_address || null,
          expectedTokens: tokens,
          expectedEth: ethPrice,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error?.includes("pending")) {
          toast("Still confirming — wait a moment and retry.", { icon: "⏳" });
        } else {
          toast.error(data.error || "Verification failed");
        }
        setLoading(false);
        return;
      }

      setMusicBalance(data.newBalance);
      setTxHash(h.trim());
      setStep("done");
      toast.success(`🎵 ${data.tokensAdded.toLocaleString()} MUSIC tokens credited!`);
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyReceiver = () => {
    navigator.clipboard.writeText(RECEIVER);
    toast.success("Address copied!");
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
        background: "#fff", borderRadius: 20, width: "100%", maxWidth: 500,
        boxShadow: "0 24px 60px rgba(0,0,0,0.2)", overflow: "hidden",
        maxHeight: "90vh", display: "flex", flexDirection: "column",
      }}>

        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg,#0d3b2e,#10b981)",
          padding: "20px 24px", color: "#fff", position: "relative", flexShrink: 0,
        }}>
          <button onClick={onClose} style={{
            position: "absolute", top: 14, right: 14,
            background: "rgba(255,255,255,0.15)", border: "none",
            borderRadius: "50%", width: 28, height: 28,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#fff",
          }}>
            <FiX size={14} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <BsMusicNote size={20} />
            <span style={{ fontSize: 18, fontWeight: 700 }}>Buy MUSIC Tokens</span>
          </div>
          <p style={{ margin: 0, opacity: 0.8, fontSize: 12 }}>
            Send Sepolia ETH → tokens credited instantly after verification
          </p>
        </div>

        <div style={{ padding: 20, overflowY: "auto" }}>

          {/* ── DONE ── */}
          {step === "done" ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: 52, marginBottom: 10 }}>🎉</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#171717", marginBottom: 6 }}>Tokens Credited!</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#10b981", margin: "14px 0 4px" }}>
                {musicBalance?.toLocaleString()} MUSIC
              </div>
              <div style={{ fontSize: 12, color: "#a3a3a3", marginBottom: 16 }}>Your new balance</div>
              {txHash && (
                <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "#10b981", marginBottom: 20 }}>
                  View on Sepolia Etherscan <FiExternalLink size={12} />
                </a>
              )}
              <br />
              <button onClick={onClose} style={{
                padding: "10px 32px", background: "#10b981", color: "#fff",
                border: "none", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer",
              }}>Done</button>
            </div>

          ) : (
            <>
              {/* Balance */}
              <div style={{
                background: "#f0fdf4", border: "1px solid #a7f3d0",
                borderRadius: 10, padding: "10px 14px", marginBottom: 16,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div style={{ fontSize: 12, color: "#065f46" }}>Your MUSIC Balance</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#059669" }}>
                    {balanceLoading ? "…" : `${(musicBalance ?? 0).toLocaleString()} MUSIC`}
                  </div>
                  <button
                    onClick={fetchBalance}
                    disabled={balanceLoading}
                    style={{
                      background: "none", border: "none", cursor: balanceLoading ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", padding: 2,
                    }}
                    title="Refresh balance"
                  >
                    <FiRefreshCw size={13} color="#059669" style={{ animation: balanceLoading ? "spin 1s linear infinite" : "none" }} />
                  </button>
                </div>
              </div>

              {/* Packages */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                {PACKAGES.map((p) => (
                  <div key={p.id}
                    onClick={() => { setSelected(p.id); setCustomAmount(""); }}
                    style={{
                      border: `2px solid ${selected === p.id && !customAmount ? "#10b981" : "#e5e5e5"}`,
                      borderRadius: 10, padding: "10px", cursor: "pointer",
                      background: selected === p.id && !customAmount ? "#f0fdf4" : "#fff",
                      position: "relative",
                    }}
                  >
                    {p.popular && (
                      <span style={{
                        position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)",
                        background: "#10b981", color: "#fff",
                        fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                      }}>POPULAR</span>
                    )}
                    <div style={{ fontSize: 11, color: "#737373" }}>{p.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#171717" }}>{p.tokens.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: "#a3a3a3" }}>MUSIC tokens</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#10b981", marginTop: 3 }}>{p.price} ETH</div>
                  </div>
                ))}
              </div>

              {/* Custom amount */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: "#737373", display: "block", marginBottom: 4 }}>
                  Or enter custom amount
                </label>
                <input type="number" placeholder="e.g. 250" value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>

              {/* Summary */}
              <div style={{
                background: "#f9f9f9", borderRadius: 8, padding: "10px 14px",
                marginBottom: 16, display: "flex", justifyContent: "space-between", fontSize: 13,
              }}>
                <span style={{ color: "#737373" }}>{tokens.toLocaleString()} MUSIC</span>
                <span style={{ fontWeight: 700, color: "#059669" }}>{ethPrice} ETH (Sepolia)</span>
              </div>

              {/* Payment address */}
              <div style={{
                background: "#fafafa", border: "1px solid #e5e5e5",
                borderRadius: 8, padding: "10px 14px", marginBottom: 14,
              }}>
                <div style={{ fontSize: 11, color: "#737373", marginBottom: 4 }}>Send exactly {ethPrice} ETH to:</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <code style={{ fontSize: 11, color: "#171717", flex: 1, wordBreak: "break-all" }}>
                    {RECEIVER}
                  </code>
                  <button onClick={copyReceiver} style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
                    <FiCopy size={13} color="#10b981" />
                  </button>
                </div>
                <a href={`https://sepolia.etherscan.io/address/${RECEIVER}`} target="_blank" rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#10b981", marginTop: 6, fontSize: 11 }}>
                  Verify on Etherscan <FiExternalLink size={11} />
                </a>
              </div>

              {/* MetaMask pay button */}
              {typeof window !== "undefined" && window.ethereum && (
                <button
                  onClick={payWithMetaMask}
                  disabled={loading}
                  style={{
                    width: "100%", padding: "11px 0", marginBottom: 12,
                    background: loading ? "#a3a3a3" : "#171717",
                    color: "#fff", border: "none", borderRadius: 10,
                    fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Processing…" : `🦊 Pay ${ethPrice} ETH via MetaMask`}
                </button>
              )}

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 1, height: 1, background: "#e5e5e5" }} />
                <span style={{ fontSize: 11, color: "#a3a3a3" }}>or paste tx hash after manual send</span>
                <div style={{ flex: 1, height: 1, background: "#e5e5e5" }} />
              </div>

              {/* Manual tx hash */}
              <div style={{ marginBottom: 12 }}>
                <input
                  value={manualTxHash}
                  onChange={(e) => setManualTxHash(e.target.value)}
                  placeholder="Paste transaction hash: 0x..."
                  style={{
                    width: "100%", padding: "9px 12px",
                    border: "1px solid #e5e5e5", borderRadius: 8,
                    fontSize: 12, fontFamily: "monospace",
                    outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>

              <button
                onClick={() => creditTokens()}
                disabled={loading || !manualTxHash.trim()}
                style={{
                  width: "100%", padding: "11px 0",
                  background: loading || !manualTxHash.trim() ? "#a3a3a3" : "#10b981",
                  color: "#fff", border: "none", borderRadius: 10,
                  fontSize: 13, fontWeight: 600,
                  cursor: loading || !manualTxHash.trim() ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <FiRefreshCw size={13} />
                {loading ? "Verifying…" : "Verify Payment & Credit Tokens"}
              </button>

              {!user?.id && (
                <p style={{ textAlign: "center", fontSize: 12, color: "#ef4444", marginTop: 10 }}>
                  ⚠️ Sign in first to receive tokens
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenICO;
