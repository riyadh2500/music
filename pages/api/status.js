// Simple status check endpoint
export default async function handler(req, res) {
  const env = {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nodeEnv: process.env.NODE_ENV,
  };

  // If any are missing, return error
  if (!env.hasSupabaseUrl || !env.hasAnonKey || !env.hasServiceKey) {
    return res.status(500).json({
      status: "error",
      message: "Missing environment variables",
      env,
    });
  }

  // Try to connect to Supabase
  try {
    const { supabaseAdmin } = require("../../lib/supabaseAdmin");
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .limit(1);

    if (error) {
      return res.status(500).json({
        status: "error",
        message: "Database connection failed",
        error: error.message,
        env,
      });
    }

    return res.status(200).json({
      status: "ok",
      message: "All systems operational",
      env,
      dbConnected: true,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
      env,
    });
  }
}
