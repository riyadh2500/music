import React, { useState } from "react";
import { FiSend, FiX, FiArrowRight, FiExternalLink } from "react-icons/fi";
import { BsWallet2 } from "react-icons/bs";
import { ethers } from "ethers";
import toast from "react-hot-toast";

const SEPOLIA_CHAIN_ID = "0xaa36a7";

const Send = ({ onClose, walletAddress, walletBalance }) => {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("ETH");
  const [step, setStep] = useState("form"); // form | confirm | done
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");

  const shortAddr = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "";

  const handleReview = (e) => {
    e.preventDefault();
    if (!to.trim()) { toast.error("Enter recipient address"); return; }
    if (!amount || parseFloat(amount) <= 0) { toast.error("Enter a valid amount"); return; }
    if (!ethers.utils.isAddress(to)) { toast.error("Invalid wallet address"); return; }
    setStep("confirm");
  };

  const handleSend = async () => {
    if (!window.ethereum) { toast.error("MetaMask not found"); return; }
    setLoading(true);
    try {
      // Ensure Sepolia
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const valueWei = ethers.utils.parseEther(amount);

      const tx = await signer.sendTransaction({
        to,
        value: valueWei,
      });

      setTxHash(tx.hash);
      toast.success("Transaction submitted! Waiting for confirmation…");
      await tx.wait();
      setStep("done");
      toast.success(`${amount} ${token} sent on Sepolia! ✅`);
    } catch (err) {
      if (err.code === 4001) {
        toast.error("Transaction rejected by user.");
      } else {
        toast.error(err.message?.slice(0, 80) || "Transaction failed");
      }
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
      <div
        style={{
          background: "#fff", borderRadius: 20, width: "100%", maxWidth: 420,
          boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "20px 24px", borderBottom: "1px solid #f0f0f0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg,#10b981,#059669)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <FiSend size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#171717" }}>Send Tokens</div>
              <div style={{ fontSize: 11, color: "#737373" }}>From: {shortAddr || "No wallet"}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f5f5f5", border: "none", borderRadius: "50%",
              width: 30, height: 30, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer",
            }}
          >
            <FiX size={14} color="#737373" />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          {step === "done" ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#171717", marginBottom: 6 }}>
                Transaction Confirmed!
              </div>
              <div style={{ fontSize: 13, color: "#737373", marginBottom: 12 }}>
                {amount} {token} sent to {to.slice(0, 10)}…
              </div>
              {txHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    fontSize: 12, color: "#10b981", marginBottom: 20,
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
          ) : step === "confirm" ? (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#737373", marginBottom: 14 }}>
                REVIEW TRANSACTION
              </div>
              {[
                { label: "From", value: shortAddr },
                { label: "To", value: `${to.slice(0, 12)}...${to.slice(-6)}` },
                { label: "Amount", value: `${amount} ${token}` },
                { label: "Network Fee", value: "~0.0005 ETH" },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "10px 0", borderBottom: "1px solid #f5f5f5",
                    fontSize: 14,
                  }}
                >
                  <span style={{ color: "#737373" }}>{row.label}</span>
                  <span style={{ fontWeight: 600, color: "#171717" }}>{row.value}</span>
                </div>
              ))}
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button
                  onClick={() => setStep("form")}
                  style={{
                    flex: 1, padding: "11px 0", borderRadius: 10,
                    border: "1px solid #e5e5e5", background: "#fff",
                    fontSize: 14, cursor: "pointer", color: "#525252",
                  }}
                >
                  Back
                </button>
                <button
                  onClick={handleSend}
                  disabled={loading}
                  style={{
                    flex: 2, padding: "11px 0", borderRadius: 10,
                    border: "none",
                    background: loading ? "#a3a3a3" : "#10b981",
                    color: "#fff", fontSize: 14, fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}
                >
                  {loading ? "Sending…" : <><FiSend size={14} /> Confirm Send</>}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReview}>
              {/* From balance */}
              <div
                style={{
                  background: "#f0fdf4", border: "1px solid #a7f3d0",
                  borderRadius: 10, padding: "10px 14px", marginBottom: 18,
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                <BsWallet2 size={14} color="#059669" />
                <span style={{ fontSize: 13, color: "#059669", fontWeight: 500 }}>
                  Balance: {walletBalance ? `${walletBalance} ETH` : "Connect wallet"}
                </span>
              </div>

              {/* Token selector */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: "#737373", display: "block", marginBottom: 6 }}>
                  Token
                </label>
                <select
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  style={{
                    width: "100%", padding: "10px 14px",
                    border: "1px solid #e5e5e5", borderRadius: 8,
                    fontSize: 14, outline: "none", background: "#fff",
                  }}
                >
                  <option>ETH</option>
                  <option>MUSIC</option>
                </select>
              </div>

              {/* Recipient */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: "#737373", display: "block", marginBottom: 6 }}>
                  Recipient Address
                </label>
                <input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="0x..."
                  style={{
                    width: "100%", padding: "10px 14px",
                    border: "1px solid #e5e5e5", borderRadius: 8,
                    fontSize: 13, outline: "none", boxSizing: "border-box",
                    fontFamily: "monospace",
                  }}
                />
              </div>

              {/* Amount */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: "#737373", display: "block", marginBottom: 6 }}>
                  Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.0001"
                  style={{
                    width: "100%", padding: "10px 14px",
                    border: "1px solid #e5e5e5", borderRadius: 8,
                    fontSize: 16, outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: "100%", padding: "12px 0",
                  background: "#171717", color: "#fff",
                  border: "none", borderRadius: 10,
                  fontSize: 14, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                Review Transaction <FiArrowRight size={14} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Send;
