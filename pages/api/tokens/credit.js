import { supabaseAdmin as supabase } from "../../../lib/supabaseAdmin";

const RECEIVER = "0x575D7EF206B5649b1185034C74f9fBE61b0B00B3";

async function fetchTxFromEtherscan(txHash) {
  try {
    const url = `https://api-sepolia.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}`;
    const r = await fetch(url, { headers: { "User-Agent": "MusicDapp/1.0" } });
    const d = await r.json();
    if (d?.result && d.result !== null && typeof d.result === "object") {
      return { tx: d.result, source: "proxy" };
    }
  } catch { /* fall through */ }

  try {
    const url = `https://api-sepolia.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}`;
    const r = await fetch(url, { headers: { "User-Agent": "MusicDapp/1.0" } });
    const d = await r.json();
    if (d?.result?.status) return { status: d.result.status, source: "receipt" };
  } catch { /* fall through */ }

  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // userId is the Supabase profile id — most reliable way to find the user
  const { txHash, walletAddress, expectedTokens, expectedEth, userId } = req.body;

  if (!txHash || !expectedTokens) {
    return res.status(400).json({ error: "txHash and expectedTokens are required" });
  }

  // ── 1. Check tx hasn't been credited already ──────────
  const { data: existing } = await supabase
    .from("token_purchases")
    .select("id")
    .eq("tx_hash", txHash)
    .maybeSingle();

  if (existing) {
    return res.status(400).json({ error: "This transaction has already been credited." });
  }

  // ── 2. Verify on Sepolia Etherscan ────────────────────
  const ethResult = await fetchTxFromEtherscan(txHash);

  if (!ethResult) {
    console.warn("Etherscan unreachable, proceeding for tx:", txHash);
  } else if (ethResult.source === "proxy") {
    const tx = ethResult.tx;

    if (tx.to?.toLowerCase() !== RECEIVER.toLowerCase()) {
      return res.status(400).json({
        error: `Transaction not sent to correct address. Expected ${RECEIVER}, got ${tx.to}`,
      });
    }

    if (!tx.blockNumber) {
      return res.status(400).json({
        error: "Transaction still pending. Wait for confirmation and retry.",
      });
    }

    const sentWei     = BigInt(tx.value);
    const expectedWei = BigInt(Math.round(parseFloat(expectedEth) * 1e18).toString());
    const tolerance   = expectedWei / BigInt(50);
    const diff        = sentWei > expectedWei ? sentWei - expectedWei : expectedWei - sentWei;

    if (diff > tolerance) {
      return res.status(400).json({
        error: `Payment mismatch. Expected ~${expectedEth} ETH, got ${(Number(sentWei) / 1e18).toFixed(6)} ETH.`,
      });
    }
  } else if (ethResult.source === "receipt") {
    if (ethResult.status !== "1") {
      return res.status(400).json({ error: "Transaction failed on-chain." });
    }
  }

  // ── 3. Find profile ───────────────────────────────────
  // Priority: userId → generated_wallet_address → wallet_address
  let profile = null;

  if (userId) {
    const { data } = await supabase
      .from("profiles")
      .select("id, music_token_balance")
      .eq("id", userId)
      .maybeSingle();
    profile = data;
  }

  if (!profile && walletAddress && walletAddress.startsWith("0x")) {
    const { data } = await supabase
      .from("profiles")
      .select("id, music_token_balance")
      .eq("generated_wallet_address", walletAddress)
      .maybeSingle();
    profile = data;
  }

  if (!profile && walletAddress && walletAddress.startsWith("0x")) {
    const { data } = await supabase
      .from("profiles")
      .select("id, music_token_balance")
      .eq("wallet_address", walletAddress)
      .maybeSingle();
    profile = data;
  }

  if (!profile) {
    return res.status(400).json({
      error: "Could not find your profile. Please sign in and try again.",
    });
  }

  const newBalance = (profile.music_token_balance ?? 0) + Number(expectedTokens);

  // ── 4. Credit tokens ──────────────────────────────────
  const { error: updateErr } = await supabase
    .from("profiles")
    .update({ music_token_balance: newBalance })
    .eq("id", profile.id);

  if (updateErr) return res.status(400).json({ error: "Token credit failed: " + updateErr.message });

  // ── 5. Record purchase ────────────────────────────────
  await supabase.from("token_purchases").insert({
    tx_hash:         txHash,
    wallet_address:  walletAddress?.startsWith("0x") ? walletAddress : "email-user",
    tokens_credited: Number(expectedTokens),
    eth_paid:        parseFloat(expectedEth) || 0,
    profile_id:      profile.id,
  });

  return res.status(200).json({ success: true, tokensAdded: Number(expectedTokens), newBalance });
}
