import { supabase } from "../../lib/supabase";

export default async function handler(req, res) {
  try {
    const { error } = await supabase.from("profiles").select("id").limit(1);
    return res.status(200).json({
      status: "ok",
      db: error ? "error: " + error.message : "connected",
      provider: "supabase",
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return res.status(500).json({ status: "error", message: e.message });
  }
}
