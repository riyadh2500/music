import { supabaseAdmin as supabase } from "../../../lib/supabaseAdmin";

const SEPOLIA_RPCS = [
  "https://ethereum-sepolia-rpc.publicnode.com",
  "https://sepolia.drpc.org",
  "https://rpc2.sepolia.org",
  "https://rpc.sepolia.org",
];

// GET /api/wallet/balance?userId=xxx
// Fetches the Sepolia ETH balance of the user's generated wallet
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId is required" });

  // Get wallet address from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("generated_wallet_address, music_tokens")
    .eq("id", userId)
    .single();

  if (!profile?.generated_wallet_address) {
    return res.status(200).json({ ethBalance: "0.0000", musicTokens: 0, address: null });
  }

  const address = profile.generated_wallet_address;

  // Fetch ETH balance from Sepolia RPC
  const body = JSON.stringify({
    jsonrpc: "2.0", method: "eth_getBalance",
    params: [address, "latest"], id: 1,
  });

  let ethBalance = "0.0000";
  for (const rpc of SEPOLIA_RPCS) {
    try {
      const r    = await fetch(rpc, { method: "POST", headers: { "Content-Type": "application/json" }, body });
      const data = await r.json();
      if (data.result) {
        ethBalance = (Number(BigInt(data.result)) / 1e18).toFixed(4);
        break;
      }
    } catch { /* try next */ }
  }

  return res.status(200).json({
    ethBalance,
    musicTokens: profile.music_tokens ?? 0,
    address,
  });
}
