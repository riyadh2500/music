import crypto from "crypto";
import { ethers } from "ethers";
import { supabaseAdmin as supabase } from "../../../lib/supabaseAdmin";

const RECEIVER    = "0x575D7EF206B5649b1185034C74f9fBE61b0B00B3";
const SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";

function decryptPrivateKey(encrypted) {
  const secret = process.env.WALLET_ENCRYPTION_SECRET;
  if (!secret || secret.length < 32) throw new Error("WALLET_ENCRYPTION_SECRET not configured");
  const [ivHex, encHex] = encrypted.split(":");
  const key      = Buffer.from(secret.slice(0, 32), "utf8");
  const iv       = Buffer.from(ivHex, "hex");
  const enc      = Buffer.from(encHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

// POST /api/wallet/pay
// Body: { userId, ethAmount, tokensToCredit }
// 1. Decrypts user's private key
// 2. Signs + broadcasts ETH tx to RECEIVER on Sepolia
// 3. Waits for 1 confirmation
// 4. Credits music_tokens in Supabase
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId, ethAmount, tokensToCredit } = req.body;
  if (!userId || !ethAmount || !tokensToCredit) {
    return res.status(400).json({ error: "userId, ethAmount and tokensToCredit are required" });
  }

  // ── 1. Get encrypted key from profile ────────────────
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("id, wallet_encrypted_key, generated_wallet_address, music_tokens")
    .eq("id", userId)
    .single();

  if (profileErr || !profile) {
    return res.status(404).json({ error: "Profile not found" });
  }
  if (!profile.wallet_encrypted_key) {
    return res.status(400).json({ error: "No wallet found. Please log out and log in again to generate one." });
  }

  // ── 2. Decrypt private key ────────────────────────────
  let privateKey;
  try {
    privateKey = decryptPrivateKey(profile.wallet_encrypted_key);
  } catch (err) {
    return res.status(500).json({ error: "Failed to decrypt wallet: " + err.message });
  }

  // ── 3. Check balance ──────────────────────────────────
  const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC);
  const wallet   = new ethers.Wallet(privateKey, provider);

  let balance;
  try {
    balance = await provider.getBalance(wallet.address);
  } catch {
    return res.status(502).json({ error: "Could not connect to Sepolia. Please try again." });
  }

  const valueWei    = ethers.utils.parseEther(String(ethAmount));
  const gasEstimate = ethers.utils.parseUnits("21000", "wei");
  const gasPrice    = await provider.getGasPrice();
  const gasCost     = gasPrice.mul(gasEstimate);
  const totalNeeded = valueWei.add(gasCost);

  if (balance.lt(totalNeeded)) {
    const ethBal = parseFloat(ethers.utils.formatEther(balance)).toFixed(4);
    return res.status(400).json({
      error: `Insufficient balance. You have ${ethBal} ETH but need ${ethAmount} ETH + gas.`,
      balance: ethBal,
    });
  }

  // ── 4. Sign + broadcast transaction ──────────────────
  let tx;
  try {
    tx = await wallet.sendTransaction({
      to: RECEIVER,
      value: valueWei,
      gasLimit: 21000,
    });
  } catch (err) {
    return res.status(500).json({ error: "Transaction failed: " + (err.reason || err.message) });
  }

  // ── 5. Wait for 1 confirmation ────────────────────────
  try {
    await tx.wait(1);
  } catch {
    // tx was sent but confirmation timed out — still credit
  }

  // ── 6. Record purchase (prevent double-credit) ────────
  const { data: existing } = await supabase
    .from("token_purchases")
    .select("id").eq("tx_hash", tx.hash).maybeSingle();

  if (existing) {
    return res.status(400).json({ error: "Transaction already credited." });
  }

  const newBalance = (profile.music_tokens ?? 0) + Number(tokensToCredit);

  await supabase.from("profiles").update({ music_tokens: newBalance }).eq("id", userId);
  await supabase.from("token_purchases").insert({
    tx_hash: tx.hash,
    wallet_address: profile.generated_wallet_address,
    tokens_credited: Number(tokensToCredit),
    eth_paid: parseFloat(ethAmount),
    profile_id: userId,
  });

  return res.status(200).json({
    success: true,
    txHash: tx.hash,
    tokensAdded: Number(tokensToCredit),
    newBalance,
    explorerUrl: `https://sepolia.etherscan.io/tx/${tx.hash}`,
  });
}
