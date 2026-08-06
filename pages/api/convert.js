import { ethers } from "ethers";
import { createClient } from "@supabase/supabase-js";

// ── Supabase admin client ────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Conversion constants ─────────────────────────────────────────────────────
const ETH_PER_TOKEN = 0.00007; // 1 MUSIC = 0.00007 ETH
const USER_SHARE    = 0.90;    // 90 % to user
const ADMIN_SHARE   = 0.10;    // 10 % stays in admin wallet

// ── Sepolia RPC fallback list ────────────────────────────────────────────────
const SEPOLIA_RPCS = [
  "https://ethereum-sepolia-rpc.publicnode.com",
  "https://sepolia.drpc.org",
  "https://rpc2.sepolia.org",
  "https://rpc.sepolia.org",
];

async function getProvider() {
  for (const rpc of SEPOLIA_RPCS) {
    try {
      const p = new ethers.providers.JsonRpcProvider(rpc);
      await p.getBlockNumber(); // quick liveness check
      return p;
    } catch {
      // try next
    }
  }
  throw new Error("All Sepolia RPC endpoints are currently unavailable.");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, walletAddress, tokensToConvert } = req.body;

  // ── 1. Input validation ──────────────────────────────────────────────────
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

  // ── 2. Check private key is configured ──────────────────────────────────
  const adminPrivateKey = process.env.ADMIN_WALLET_PRIVATE_KEY;
  if (!adminPrivateKey) {
    console.error("ADMIN_WALLET_PRIVATE_KEY is not set in environment variables");
    return res.status(500).json({
      error: "Admin wallet not configured. Please contact support.",
      debug: "ADMIN_WALLET_PRIVATE_KEY env var is missing",
    });
  }

  // Validate private key format
  let adminWalletAddress;
  try {
    const testWallet = new ethers.Wallet(adminPrivateKey);
    adminWalletAddress = testWallet.address;
  } catch {
    return res.status(500).json({ error: "Admin wallet private key is invalid. Contact support." });
  }

  // ── 3. Check user balance in Supabase ───────────────────────────────────
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
  const totalEth   = tokens * ETH_PER_TOKEN;
  const userEth    = parseFloat((totalEth * USER_SHARE).toFixed(10));
  const userEthWei = ethers.utils.parseEther(userEth.toFixed(10));

  // ── 5. Connect to Sepolia and validate admin balance ─────────────────────
  let provider;
  try {
    provider = await getProvider();
  } catch (rpcErr) {
    return res.status(503).json({
      error: "Sepolia network is currently unreachable. Please try again in a moment.",
    });
  }

  const adminWallet = new ethers.Wallet(adminPrivateKey, provider);

  let adminBalance;
  try {
    adminBalance = await adminWallet.getBalance();
  } catch {
    return res.status(503).json({ error: "Could not check admin wallet balance. Try again." });
  }

  // Add gas buffer (21000 * 20 gwei)
  const gasBuffer = ethers.utils.parseUnits("0.001", "ether");
  if (adminBalance.lt(userEthWei.add(gasBuffer))) {
    const adminEth = parseFloat(ethers.utils.formatEther(adminBalance)).toFixed(6);
    console.error(`Admin wallet ${adminWalletAddress} has only ${adminEth} ETH, needs ${userEth} + gas`);
    return res.status(500).json({
      error: `Admin wallet has insufficient Sepolia ETH (balance: ${adminEth} ETH, needed: ${userEth} ETH + gas). Please contact support.`,
    });
  }

  // ── 6. Send ETH transaction ──────────────────────────────────────────────
  let txHash;
  try {
    // Get current gas price with a small bump for reliability
    const feeData   = await provider.getFeeData();
    const gasPrice  = feeData.gasPrice
      ? feeData.gasPrice.mul(110).div(100) // +10 %
      : ethers.utils.parseUnits("10", "gwei");

    const tx = await adminWallet.sendTransaction({
      to:       walletAddress,
      value:    userEthWei,
      gasLimit: 21000,
      gasPrice,
    });

    // Wait 1 confirmation
    const receipt = await tx.wait(1);
    txHash = receipt.transactionHash;
  } catch (txErr) {
    console.error("Transaction error:", txErr?.message || txErr);

    // Surface a helpful message
    const msg = txErr?.message || "";
    if (msg.includes("insufficient funds")) {
      return res.status(500).json({ error: "Admin wallet has insufficient Sepolia ETH for this transaction." });
    }
    if (msg.includes("nonce")) {
      return res.status(500).json({ error: "Transaction nonce conflict. Please try again in a few seconds." });
    }
    return res.status(500).json({
      error: "Blockchain transaction failed. Please try again.",
      detail: msg.slice(0, 200),
    });
  }

  // ── 7. Deduct tokens only after confirmed tx ─────────────────────────────
  const newBalance = currentBalance - tokens;
  const { error: updateErr } = await supabase
    .from("profiles")
    .update({ music_tokens: newBalance })
    .eq("id", userId);

  if (updateErr) {
    console.error("CRITICAL: tx confirmed but token deduction failed", { userId, txHash, updateErr });
  }

  // ── 8. Log conversion history ────────────────────────────────────────────
  const { error: logErr } = await supabase.from("conversion_history").insert({
    user_id:          userId,
    tokens_converted: tokens,
    eth_sent:         userEth,
    tx_hash:          txHash,
    wallet_address:   walletAddress,
    status:           "completed",
  });

  if (logErr) {
    console.error("Failed to write conversion_history:", logErr);
  }

  // ── 9. Return success ────────────────────────────────────────────────────
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
