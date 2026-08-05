import { supabaseAdmin as supabase } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { walletAddress, userId } = req.body;
  if (!walletAddress) return res.status(400).json({ error: "walletAddress is required" });

  // ── Case 1: Logged-in user — attach wallet to existing profile ──
  if (userId) {
    const { data, error } = await supabase
      .from("profiles")
      .update({ wallet_address: walletAddress, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ user: data });
  }

  // ── Case 2: Look up existing profile by wallet address ──
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("wallet_address", walletAddress)
    .maybeSingle();

  if (existing) return res.status(200).json({ user: existing });

  // ── Case 3: New wallet — upsert a minimal profile ──
  // Uses a generated UUID as the id so it doesn't conflict with
  // Supabase auth users. wallet-only users don't go through auth.signUp.
  const shortName = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

  const { data: newProfile, error: createError } = await supabase
    .from("profiles")
    .insert({
      username: shortName,
      wallet_address: walletAddress,
      email: null,
    })
    .select()
    .single();

  if (createError) {
    console.error("wallet.js insert error:", createError);
    return res.status(400).json({ error: createError.message });
  }

  return res.status(201).json({ user: newProfile });
}
