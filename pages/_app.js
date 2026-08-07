import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { AudioPlayerProvider } from "../context/AudioPlayerContext";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null);

  // ── Load full profile row from profiles table ─────────
  const loadProfile = async (userId) => {
    try {
      const res  = await fetch(`/api/users/${userId}`);
      const data = await res.json();
      if (data.user) setUser(data.user);
    } catch { /* non-fatal */ }
  };

  // ── Email login — uses Supabase client directly ───────
  // This stores the session in localStorage so refresh works
  const loginWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    // Also fetch/create the profile row
    const res  = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    setUser(json.user);
    return json.user;
  };

  // ── Email register ────────────────────────────────────
  const registerWithEmail = async (email, password, username) => {
    const res  = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, username }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    // Sign in immediately so session is stored
    await supabase.auth.signInWithPassword({ email, password });
    setUser(data.user);
    return data.user;
  };

  // ── Logout ────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success("Logged out");
  };

  // ── Restore session on every page load ───────────────
  useEffect(() => {
    // On refresh: read session from localStorage (Supabase handles this)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user.id);
      }
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
          loadProfile(session.user.id);
        }
        if (event === "SIGNED_OUT") {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AudioPlayerProvider>
      <div style={{ animation: "fadeIn 0.4s ease-out" }}>
        <Component
          {...pageProps}
          user={user}
          onLoginWithEmail={loginWithEmail}
          onRegisterWithEmail={registerWithEmail}
          onLogout={logout}
        />
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontSize: 13, borderRadius: 8,
            animation: "slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          },
          success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
        }}
      />
    </AudioPlayerProvider>
  );
}
