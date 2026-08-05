import { ethers } from "ethers";
import crypto from "crypto";
import { supabase } from "../../../lib/supabase";

// AES-256-GCM encryption of private key
// WALLET_ENCRYPTION_SECRET must be 32 chars — set in .env.local
function encryptPrivateKey(privateKey) {
  const secret = process.env.WALLET_ENCRYPTION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("WALLET_ENCRYPTION_SECRET must be at least 32 characters in .env.local");
  }
  const key    = Buffer.from(secret.slice(0, 32), "utf8");
  const iv     = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(privateKey, "utf8"), cipher.final()]);
  // Store as iv:encrypted (hex)
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

// POST /api/auth/create-wallet
// Body: { userId }
// Generates a new ETH wallet, encrypts the private key, stores in profiles.
// Idempotent — if a wallet already exists for this user, returns it unchanged.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required" });

  // Check if wallet already exists for this user
  const { data: existing } = await supabase
    .from("profiles")
    .select("id, generated_wallet_address, wallet_encrypted_key")
    .eq("id", userId)
    .maybeSingle();

  if (existing?.generated_wallet_address) {
    // Wallet already generated — return address only (never return key)
    return res.status(200).json({
      walletAddress: existing.generated_wallet_address,
      isNew: false,
    });
  }

  // Generate a fresh Ethereum wallet
  const wallet = ethers.Wallet.createRandom();
  const address    = wallet.address;
  const privateKey = wallet.privateKey;

  let encryptedKey;
  try {
    encryptedKey = encryptPrivateKey(privateKey);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  // Store encrypted key + public address in profiles
  const { error: updateErr } = await supabase
    .from("profiles")
    .update({
      generated_wallet_address: address,
      wallet_encrypted_key: encryptedKey,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updateErr) {
    return res.status(400).json({ error: "Failed to save wallet: " + updateErr.message });
  }

  return res.status(201).json({
    walletAddress: address,
    isNew: true,
  });
}
