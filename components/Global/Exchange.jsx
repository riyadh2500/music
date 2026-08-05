import React, { useState } from "react";
import { FiExternalLink } from "react-icons/fi";
import { ethers } from "ethers";
import toast from "react-hot-toast";

const SEPOLIA_CHAIN_ID = "0xaa36a7";
// Replace with your deployed Sepolia contract address
const MUSIC_TOKEN_CONTRACT = "0x1234567890abcdef1234567890abcdef12345678";
const RATE = 0.00015; // ETH per MUSIC token (Sepolia)

const Exchange = ({ walletAddress }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");

  const ethCost = amount ? (parseFloat(amount) * RATE).toFixed(6) : "0.00";
  const musicOut = amount ? parseFloat(amount).toFixed(2) : "0.00";

  const handleSwap = async () => {
    if (!walletAddress) { toast.error("Connect your wallet first!"); return; }
    if (!amount || parseFloat(amount) <= 0) { toast.error("Enter a valid amount"); return; }
    if (!window.ethereum) { toast.error("MetaMask not found"); return; }

    setLoading(true);
    setTxHash("");
    try {
      // Ensure Sepolia
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const tx = await signer.sendTransaction({
        to: MUSIC_TOKEN_CONTRACT,
        value: ethers.utils.parseEther(ethCost),
      });

      setTxHash(tx.hash);
      toast.success("Swap submitted! Waiting for confirmation…");
      await tx.wait();
      toast.success(`🎵 Received ${musicOut} MUSIC tokens on Sepolia!`);
      setAmount("");
    } catch (err) {
      if (err.code === 4001) {
        toast.error("Transaction rejected.");
      } else {
        toast.error(err.message?.slice(0, 80) || "Swap failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        padding: 20,
        maxWidth: 400,
      }}
    >
      <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 600, color: "#171717" }}>
        Token Exchange
      </h3>
      <p style={{ margin: "0 0 16px", fontSize: 11, color: "#10b981" }}>
        Ethereum Sepolia Testnet
      </p>

      {/* You pay */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: "#737373", display: "block", marginBottom: 6 }}>
          You Receive (MUSIC)
        </label>
        <input
          type="number"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            width: "100%", padding: "10px 14px",
            border: "1px solid #e5e5e5", borderRadius: 8,
            fontSize: 16, outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ textAlign: "center", fontSize: 18, color: "#a3a3a3", margin: "8px 0" }}>⇅</div>

      {/* You pay */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, color: "#737373", display: "block", marginBottom: 6 }}>
          You Pay (SepoliaETH)
        </label>
        <div
          style={{
            padding: "10px 14px", border: "1px solid #e5e5e5",
            borderRadius: 8, fontSize: 16, background: "#f9f9f9", color: "#171717",
          }}
        >
          {ethCost}
        </div>
      </div>

      {/* Rate */}
      <div
        style={{
          display: "flex", justifyContent: "space-between",
          fontSize: 12, color: "#737373",
          marginBottom: 16, padding: "10px 0",
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <span>Rate</span>
        <span>1 MUSIC = {RATE} SepoliaETH</span>
      </div>

      {txHash && (
        <a
          href={`https://sepolia.etherscan.io/tx/${txHash}`}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 5, fontSize: 12, color: "#10b981", marginBottom: 12,
          }}
        >
          View on Sepolia Etherscan <FiExternalLink size={12} />
        </a>
      )}

      <button
        onClick={handleSwap}
        disabled={loading}
        style={{
          width: "100%", padding: "12px 0",
          background: loading ? "#a3a3a3" : "#10b981",
          color: "#fff", border: "none", borderRadius: 8,
          fontSize: 14, fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Swapping on Sepolia…" : "Swap Tokens"}
      </button>

      {!walletAddress && (
        <p style={{ textAlign: "center", fontSize: 12, color: "#ef4444", marginTop: 10, margin: "10px 0 0" }}>
          ⚠️ Connect your wallet to swap
        </p>
      )}
    </div>
  );
};

export default Exchange;
