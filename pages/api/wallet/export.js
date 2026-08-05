import crypto from "crypto";
import { supabaseAdmin as supabase } from "../../../lib/supabaseAdmin";

function decryptPrivateKey(encrypted) {
  const secret = process.env.WALLET_ENCRYPTION_SECRET;
  if (!secret || secret.length < 32) throw new Error("WALLET_ENCRYPTION_SECRET not configured");
  const [ivHex, encryptedHex] = encrypted.split(":");
  if (!ivHex || !encryptedHex) throw new Error("Invalid encrypted key format");
  const key      = Buffer.from(secret.slice(0, 32), "utf8");
  const iv       = Buffer.from(ivHex, "hex");
  const encBuf   = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  return Buffer.concat([decipher.update(encBuf), decipher.final()]).toString("utf8");
}

// POST /api/wallet/export
// Body: { userId }
// Fetches the encrypted private key from profiles and decrypts it.
// Security: only works if the userId matches a real profile with a wallet.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required" });

  // Fetch the encrypted wallet key from profiles
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("id, wallet_encrypted_key, generated_wallet_address, email")
    .eq("id", userId)
    .single();

  if (profileErr || !profile) {
    return res.status(404).json({ error: "Profile not found" });
  }

  if (!profile.wallet_encrypted_key) {
    return res.status(404).json({
      error: "No wallet found for this account. Your wallet will be generated on next login.",
    });
  }

  // Decrypt the private key
  let privateKey;
  try {
    privateKey = decryptPrivateKey(profile.wallet_encrypted_key);
  } catch (err) {
    return res.status(500).json({ error: "Failed to decrypt wallet: " + err.message });
  }

  return res.status(200).json({
    privateKey,
    address: profile.generated_wallet_address,
  });
}
