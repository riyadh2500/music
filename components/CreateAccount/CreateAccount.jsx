import React, { useState } from "react";
import { BsMusicNote } from "react-icons/bs";
import { FiX, FiMail, FiLock, FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";

const inputStyle = {
  width: "100%", padding: "10px 12px 10px 36px",
  border: "1px solid #e5e5e5", borderRadius: 8,
  fontSize: 14, outline: "none", boxSizing: "border-box",
  fontFamily: "inherit", transition: "border-color 0.15s",
};

const CreateAccount = ({ onClose, onLoginWithEmail, onRegisterWithEmail }) => {
  const [tab, setTab]                   = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [form, setForm]                 = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error("Please fill in all fields."); return; }
    setLoading(true);
    try {
      if (tab === "login") {
        await onLoginWithEmail(form.email, form.password);
        toast.success("Welcome back! 🎵");
      } else {
        if (!form.name.trim()) { toast.error("Username is required"); setLoading(false); return; }
        await onRegisterWithEmail(form.email, form.password, form.name);
        toast.success("Account created! 🎉");
      }
      if (onClose) onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.6)", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose && onClose()}
    >
      <div style={{
        background: "#fff", borderRadius: 20, width: "100%", maxWidth: 420,
        boxShadow: "0 24px 60px rgba(0,0,0,0.2)", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg,#0d3b2e,#10b981)",
          padding: "28px 28px 24px", color: "#fff", position: "relative",
        }}>
          <button onClick={onClose} style={{
            position: "absolute", top: 16, right: 16,
            background: "rgba(255,255,255,0.15)", border: "none",
            borderRadius: "50%", width: 32, height: 32,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#fff",
          }}>
            <FiX size={16} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <BsMusicNote size={20} color="#fff" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 700 }}>MusicDapp</span>
          </div>
          <p style={{ margin: 0, opacity: 0.85, fontSize: 14 }}>
            {tab === "login" ? "Sign in to access your music & NFTs" : "Join the decentralized music revolution"}
          </p>
        </div>

        <div style={{ padding: 28 }}>
          {/* Tabs */}
          <div style={{ display: "flex", background: "#f5f5f5", borderRadius: 10, padding: 4, marginBottom: 20 }}>
            {["login", "register"].map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: "8px 0", borderRadius: 7, border: "none",
                background: tab === t ? "#fff" : "transparent",
                color: tab === t ? "#171717" : "#737373",
                fontWeight: tab === t ? 600 : 400, fontSize: 13, cursor: "pointer",
                boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                textTransform: "capitalize",
              }}>{t}</button>
            ))}
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit}>
            {tab === "register" && (
              <div style={{ marginBottom: 14, position: "relative" }}>
                <FiUser size={15} color="#a3a3a3" style={{ position: "absolute", left: 12, top: 13 }} />
                <input name="name" value={form.name} onChange={handleChange} placeholder="Username"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")} />
              </div>
            )}
            <div style={{ marginBottom: 14, position: "relative" }}>
              <FiMail size={15} color="#a3a3a3" style={{ position: "absolute", left: 12, top: 13 }} />
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="Email address" style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")} />
            </div>
            <div style={{ marginBottom: 20, position: "relative" }}>
              <FiLock size={15} color="#a3a3a3" style={{ position: "absolute", left: 12, top: 13 }} />
              <input name="password" type={showPassword ? "text" : "password"}
                value={form.password} onChange={handleChange} placeholder="Password"
                style={{ ...inputStyle, paddingRight: 40 }}
                onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")} />
              <button type="button" onClick={() => setShowPassword((v) => !v)}
                style={{ position: "absolute", right: 12, top: 11, background: "none", border: "none", cursor: "pointer" }}>
                {showPassword ? <FiEyeOff size={15} color="#a3a3a3" /> : <FiEye size={15} color="#a3a3a3" />}
              </button>
            </div>
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "12px 0",
              background: loading ? "#a3a3a3" : "#10b981",
              color: "#fff", border: "none", borderRadius: 10,
              fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
            }}>
              {loading ? "Please wait…" : tab === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: "#737373" }}>
            {tab === "login" ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => setTab(tab === "login" ? "register" : "login")}
              style={{ color: "#10b981", cursor: "pointer", fontWeight: 500 }}>
              {tab === "login" ? "Register" : "Sign In"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
