import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabase";

// Supabase redirects here after Google OAuth.
// It sets the session in the URL hash — we exchange it,
// upsert the profile row, then redirect to home.
export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handle = async () => {
      // Exchange the code/token in the URL for a real session
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        // Try exchanging from the URL hash (PKCE flow)
        const { data: exchanged, error: exchErr } =
          await supabase.auth.exchangeCodeForSession(window.location.href);

        if (exchErr || !exchanged.session) {
          router.replace("/?auth=error");
          return;
        }
      }

      // At this point the session is established — re-read it
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/?auth=error"); return; }

      const { user } = session;

      // Upsert profile via our API so service role handles RLS
      try {
        await fetch("/api/auth/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.name || "",
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
          }),
        });
      } catch {
        // Non-fatal — profile may already exist
      }

      router.replace("/");
    };

    handle();
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
        background: "#fafafa",
        fontFamily: "inherit",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          border: "4px solid #e5e5e5",
          borderTop: "4px solid #10b981",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <p style={{ fontSize: 14, color: "#737373" }}>Signing you in…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
