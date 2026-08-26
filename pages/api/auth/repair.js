import { supabaseAdmin } from "../../../lib/supabaseAdmin";

// Repair endpoint - fixes users who have auth accounts but no profiles
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Get all auth users (admin access)
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      return res.status(500).json({ error: "Failed to fetch users: " + authError.message });
    }

    // Find user by email
    const authUser = users.find(u => u.email === email);
    
    if (!authUser) {
      return res.status(404).json({ error: "No auth user found with this email" });
    }

    // Check if profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (existingProfile) {
      return res.status(200).json({
        message: "Profile already exists",
        profile: existingProfile,
      });
    }

    // Create missing profile
    const { data: newProfile, error: insertError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: authUser.id,
        email: authUser.email,
        username: authUser.email.split("@")[0],
        music_token_balance: 1000,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      return res.status(500).json({ error: "Failed to create profile: " + insertError.message });
    }

    return res.status(200).json({
      message: "Profile created successfully",
      profile: newProfile,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
