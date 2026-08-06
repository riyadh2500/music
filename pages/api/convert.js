import { ethers } from "ethers";
import { createClient } from "@supabase/supabase-js";

// ── Supabase admin client (service role — never exposed to browser) ──────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Conversion constants ─────────────────────────────────────────────────────
const ETH_PER_TOKEN   = 0.00007;   // 1 MUSIC = 0.00007 ETH
const USER_SHARE      = 0.90;      // 90 % goes to user
const ADMIN_SHARE     = 0.10;      // 10 % stays in admin wallet

// ── Sepolia RPC (public endpoint — no key required for reads/sends) ──────────
const SEPOLIA_RPC = "https://rpc.sepolia.org";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, walletAddress, tokensToConvert } = req.body;

  // ── 1. Basic input validation ────────────────────────────────────────────
  if (!userId || !walletAddress || !tokensToConvert) {
    return res.status(400).json({ error: "userId, walletAddress and tokensToConvert are required." });
  }

  const tokens = parseInt(tokensToConvert, 10);
  if (isNaN(tokens) || tokens < 1) {
    return res.status(400).json({ error: "tokensToConvert must be a positive integer." });
  }

  if (!ethers.utils.isAddress(walletAddress)) {
    return res.status(400).json({ error: "Invalid Ethereum wallet address." });
  }

  // ── 2. Verify private key is configured ─────────────────────────────────
  const adminPrivateKey = process.env.ADMIN_WALLET_PRIVATE_KEY;
  if (!adminPrivateKey) {
    console.error("ADMIN_WALLET_PRIVATE_KEY is not set");
    return res.status(500).json({ error: "Server configuration error. Contact support." });
  }

  // ── 3. Check user has enough MUSIC tokens ────────────────────────────────
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("music_tokens")
    .eq("id", userId)
    .single();

  if (profileErr || !profile) {
    return res.status(404).json({ error: "User profile not found." });
  }

  const currentBalance = profile.music_tokens ?? 0;
  if (currentBalance < tokens) {
    return res.status(400).json({
      error: `Insufficient tokens. You have ${currentBalance} MUSIC but tried to convert ${tokens}.`,
    });
  }

  // ── 4. Calculate ETH amounts ─────────────────────────────────────────────
  const totalEth    = tokens * ETH_PER_TOKEN;                     // full amount
  const userEth     = parseFloat((totalEth * USER_SHARE).toFixed(10));  // 90 %
  const userEthWei  = ethers.utils.parseEther(userEth.toFixed(10));

  // ── 5. Send ETH from admin wallet ────────────────────────────────────────
  let txHash;
  try {
    const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC);
    const adminWallet = new ethers.Wallet(adminPrivateKey, provider);

    // Sanity-check admin wallet has enough ETH
    const adminBalance = await adminWallet.getBalance();
    if (adminBalance.lt(userEthWei)) {
      return res.status(500).json({ error: "Admin wallet has insufficient ETH. Contact support." });
    }

    const tx = await adminWallet.sendTransaction({
      to:    walletAddress,
      value: userEthWei,
      gasLimit: 21000,
    });

    // Wait for 1 confirmation before crediting tokens
    await tx.wait(1);
    txHash = tx.hash;
  } catch (txErr) {
    console.error("Transaction error:", txErr);
    return res.status(500).json({ error: "Blockchain transaction failed. Please try again." });
  }

  // ── 6. Deduct tokens from user's profile (only after confirmed tx) ────────
  const newBalance = currentBalance - tokens;
  const { error: updateErr } = await supabase
    .from("profiles")
    .update({ music_tokens: newBalance })
    .eq("id", userId);

  if (updateErr) {
    // Tx already went through — log the discrepancy but don't fail silently
    console.error("CRITICAL: tx confirmed but token deduction failed", { userId, txHash, updateErr });
    // Still record the conversion so admin can reconcile
  }

  // ── 7. Log to conversion_history ─────────────────────────────────────────
  const { error: logErr } = await supabase.from("conversion_history").insert({
    user_id:          userId,
    tokens_converted: tokens,
    eth_sent:         userEth,
    tx_hash:          txHash,
    wallet_address:   walletAddress,
    status:           "completed",
  });

  if (logErr) {
    // Non-fatal — conversion happened, just log the error
    console.error("Failed to write conversion_history row:", logErr);
  }

  // ── 8. Return success ────────────────────────────────────────────────────
  return res.status(200).json({
    success:         true,
    txHash,
    tokensConverted: tokens,
    ethSent:         userEth,
    newBalance,
    rate:            ETH_PER_TOKEN,
    adminFee:        parseFloat((totalEth * ADMIN_SHARE).toFixed(10)),
  });
}
