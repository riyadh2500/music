import { supabaseAdmin } from "../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    // Test database connection
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .limit(1);

    if (error) {
      return res.status(500).json({
        status: "error",
        message: "Database connection failed",
        error: error.message,
        env: {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30),
        }
      });
    }

    return res.status(200).json({
      status: "ok",
      message: "Database connection successful",
      env: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30),
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
      env: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      }
    });
  }
}
