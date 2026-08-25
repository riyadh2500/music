import { supabase } from "../../../lib/supabase";

// Temporary debug endpoint — DELETE after fixing
// GET /api/tokens/debug?wallet=0x...&tx=0x...
export default async function handler(req, res) {
  const { wallet, tx } = req.query;

  const results = {};

  // Test 1: Can we query profiles?
  const p = await supabase.from("profiles").select("id, username, music_token_balance, wallet_address").limit(3);
  results.profiles = { data: p.data, error: p.error?.message };

  // Test 2: Can we query token_purchases?
  const t = await supabase.from("token_purchases").select("*").limit(3);
  results.token_purchases = { data: t.data, error: t.error?.message };

  // Test 3: Look up specific wallet
  if (wallet) {
    const w = await supabase.from("profiles").select("*").eq("wallet_address", wallet).maybeSingle();
    results.walletLookup = { data: w.data, error: w.error?.message };
  }

  // Test 4: Look up specific tx
  if (tx) {
    const txq = await supabase.from("token_purchases").select("*").eq("tx_hash", tx).maybeSingle();
    results.txLookup = { data: txq.data, error: txq.error?.message };
  }

  return res.status(200).json(results);
}
