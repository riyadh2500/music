import React, { useState, useRef } from "react";
import MusicBackground from "../components/Global/MusicBackground";
import { Header, Sidebar, Player, Footer } from "../components";
import { FiCamera, FiUploadCloud } from "react-icons/fi";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

const ProfileEdit = ({ user, onLoginWithEmail, onRegisterWithEmail, onLogout }) => {
  const router = useRouter();

  const [form, setForm] = useState({
    username: user?.username || "",
    bio:      user?.bio      || "",
    twitter:  user?.twitter  || "",
    website:  user?.website  || "",
  });

  // Preview URLs (blob) — separate from the actual uploaded URLs
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null);
  const [coverPreview,  setCoverPreview]  = useState(user?.cover_url  || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile,  setCoverFile]  = useState(null);
  const [saving, setSaving] = useState(false);

  const avatarRef = useRef();
  const coverRef  = useRef();

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  // Upload a single image file to Supabase Storage
  const uploadImage = async (file, type) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("userId", user.id);
    formData.append("type", type); // "avatar" or "cover"

    const res  = await fetch("/api/upload/image", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `${type} upload failed`);
    return data.url;
  };

  const handleSave = async () => {
    if (!user?.id) { toast.error("You must be signed in to save."); return; }
    if (!form.username.trim()) { toast.error("Username cannot be empty."); return; }

    setSaving(true);
    try {
      let avatarUrl = user?.avatar_url || null;
      let coverUrl  = user?.cover_url  || null;

      // Upload new avatar if changed
      if (avatarFile) {
        toast("Uploading avatar…", { icon: "📸" });
        avatarUrl = await uploadImage(avatarFile, "avatar");
      }

      // Upload new cover if changed
      if (coverFile) {
        toast("Uploading cover…", { icon: "🖼️" });
        coverUrl = await uploadImage(coverFile, "cover");
      }

      // Save all profile fields
      const res  = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username:   form.username.trim(),
          bio:        form.bio.trim(),
          twitter:    form.twitter.trim(),
          website:    form.website.trim(),
          avatar_url: avatarUrl,
          cover_url:  coverUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");

      toast.success("Profile saved! ✅");
      // Reload the page so _app.js re-fetches the updated profile
      window.location.href = "/profile";
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <MusicBackground />
      <Sidebar />
      <Header
        user={user}
        onLoginWithEmail={onLoginWithEmail}
        onRegisterWithEmail={onRegisterWithEmail}
        onLogout={onLogout}
      />
      <main style={{
        marginLeft: 240, marginTop: 64, marginBottom: 72,
        padding: "28px 32px", minHeight: "calc(100vh - 64px - 72px)",
        background: "transparent",
      }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#171717", marginBottom: 28 }}>
            Edit Profile
          </h1>

          {/* Cover photo */}
          <div
            onClick={() => coverRef.current.click()}
            style={{
              height: 160,
              background: coverPreview
                ? `url(${coverPreview}) center/cover no-repeat`
                : "linear-gradient(135deg,#0d3b2e,#10b981)",
              borderRadius: 12, marginBottom: 16,
              position: "relative", overflow: "hidden", cursor: "pointer",
            }}
          >
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(0,0,0,0.35)", opacity: 0, transition: "opacity 0.2s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
            >
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(0,0,0,0.6)", color: "#fff",
                padding: "8px 16px", borderRadius: 8, fontSize: 13,
              }}>
                <FiCamera size={15} /> {coverPreview ? "Change Cover Photo" : "Upload Cover Photo"}
              </div>
            </div>
            <input ref={coverRef} type="file" accept="image/*"
              style={{ display: "none" }} onChange={handleCoverChange} />
          </div>

          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 28 }}>
            <div style={{ position: "relative" }}>
              <div
                onClick={() => avatarRef.current.click()}
                style={{
                  width: 80, height: 80, borderRadius: "50%",
                  background: avatarPreview
                    ? `url(${avatarPreview}) center/cover no-repeat`
                    : "linear-gradient(135deg,#10b981,#059669)",
                  border: "4px solid #fafafa",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: 28,
                  cursor: "pointer", overflow: "hidden",
                }}
              >
                {!avatarPreview && (form.username[0] || "U").toUpperCase()}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); avatarRef.current.click(); }}
                style={{
                  position: "absolute", bottom: 0, right: 0,
                  width: 26, height: 26, borderRadius: "50%",
                  background: "#10b981", border: "2px solid #fafafa",
                  color: "#fff", display: "flex", alignItems: "center",
                  justifyContent: "center", cursor: "pointer",
                }}
              >
                <FiCamera size={11} />
              </button>
              <input ref={avatarRef} type="file" accept="image/*"
                style={{ display: "none" }} onChange={handleAvatarChange} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16, color: "#171717" }}>
                {form.username || "Your Name"}
              </div>
              <div style={{ fontSize: 12, color: "#737373" }}>Click to change avatar or cover</div>
              {(avatarFile || coverFile) && (
                <div style={{ fontSize: 12, color: "#10b981", marginTop: 4 }}>
                  {[avatarFile && "New avatar", coverFile && "New cover"].filter(Boolean).join(" + ")} ready to save
                </div>
              )}
            </div>
          </div>

          {/* Form fields */}
          <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, padding: 24, marginBottom: 20 }}>
            {[
              { label: "Username *", name: "username", placeholder: "Your display name" },
              { label: "Twitter",    name: "twitter",  placeholder: "@yourhandle" },
              { label: "Website",    name: "website",  placeholder: "https://yoursite.com" },
            ].map((field) => (
              <div key={field.name} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#525252", display: "block", marginBottom: 6 }}>
                  {field.label}
                </label>
                <input
                  type="text" name={field.name} value={form[field.name]}
                  onChange={handleChange} placeholder={field.placeholder}
                  style={{
                    width: "100%", padding: "10px 14px",
                    border: "1px solid #e5e5e5", borderRadius: 8,
                    fontSize: 14, outline: "none", boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                  onBlur={(e)  => (e.target.style.borderColor = "#e5e5e5")}
                />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#525252", display: "block", marginBottom: 6 }}>Bio</label>
              <textarea
                name="bio" value={form.bio} onChange={handleChange}
                rows={4} placeholder="Tell people about yourself…"
                style={{
                  width: "100%", padding: "10px 14px",
                  border: "1px solid #e5e5e5", borderRadius: 8,
                  fontSize: 14, outline: "none", resize: "vertical",
                  boxSizing: "border-box", fontFamily: "inherit",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                onBlur={(e)  => (e.target.style.borderColor = "#e5e5e5")}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button onClick={() => router.push("/")}
              style={{ padding: "10px 24px", borderRadius: 8, border: "1px solid #e5e5e5", background: "#fff", fontSize: 14, cursor: "pointer", color: "#525252" }}>
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "10px 28px", borderRadius: 8, border: "none",
                background: saving ? "#a3a3a3" : "#10b981",
                color: "#fff", fontSize: 14, fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              {saving ? <><FiUploadCloud size={14} /> Saving…</> : "Save Changes"}
            </button>
          </div>
        </div>
        <Footer />
      </main>
      <Player />
    </>
  );
};

export default ProfileEdit;
