import React, { useState } from "react";
import { useRouter } from "next/router";
import { Header, Sidebar, Player, Footer } from "../components";
import { FiMusic, FiImage, FiUploadCloud } from "react-icons/fi";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";

const STEPS = ["Upload Audio", "Add Details", "Set Price", "Publish"];

const GRADIENTS = [
  "linear-gradient(135deg,#1e3a5f,#0f2027)",
  "linear-gradient(135deg,#0d3b2e,#10b981)",
  "linear-gradient(135deg,#4a0e8f,#c0392b)",
  "linear-gradient(135deg,#312e81,#4338ca)",
  "linear-gradient(135deg,#1e3a8a,#2563eb)",
  "linear-gradient(135deg,#3b1f00,#b45309)",
  "linear-gradient(135deg,#134e4a,#0d9488)",
  "linear-gradient(135deg,#831843,#ec4899)",
];

const CreatePage = ({ user, onLoginWithEmail, onRegisterWithEmail, onLogout }) => {
  const router = useRouter();
  const [step, setStep]                   = useState(0);
  const [audioFile, setAudioFile]         = useState(null);
  const [coverFile, setCoverFile]         = useState(null);
  const [coverPreview, setCoverPreview]   = useState(null);
  const [selectedGradient, setSelectedGradient] = useState(GRADIENTS[0]);
  const [uploading, setUploading]         = useState(false);
  const [form, setForm] = useState({ title: "", artist: "", genre: "", description: "", price: "" });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) { setAudioFile(file); toast.success(`"${file.name}" selected!`); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
      toast.success(`"${file.name}" loaded!`);
    } else {
      toast.error("Please drop an audio file.");
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handlePublish = async () => {
    if (!user) { toast.error("Please sign in first!"); return; }
    if (!audioFile) { toast.error("No audio file selected."); return; }
    if (!form.title.trim()) { toast.error("Track title is required."); return; }

    setUploading(true);
    try {
      const userId = user.id;
      if (!userId) { toast.error("Could not resolve user. Please sign in again."); setUploading(false); return; }

      // 1. Upload audio directly to Supabase Storage (bypasses Vercel 4.5MB limit)
      toast("Uploading audio...", { icon: "🎵" });
      const audioFileName = `${userId}_${Date.now()}_${audioFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const { data: audioData, error: audioErr } = await supabase.storage
        .from("music")
        .upload(audioFileName, audioFile, { contentType: audioFile.type });

      if (audioErr) throw new Error(audioErr.message || "Audio upload failed");
      
      const audioUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/music/${audioData.path}`;
      toast.success("Audio uploaded!");

      // 2. Upload cover (optional)
      let coverUrl = null;
      if (coverFile) {
        const imgForm = new FormData();
        imgForm.append("image", coverFile);
        imgForm.append("userId", userId);
        imgForm.append("type", "track");
        const imgRes  = await fetch("/api/upload/image", { method: "POST", body: imgForm });
        const imgData = await imgRes.json();
        if (imgRes.ok) coverUrl = imgData.url;
      }

      // 3. Save post
      const postRes = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          title:         form.title.trim(),
          artist:        form.artist.trim() || user.username || "Unknown Artist",
          genre:         form.genre.trim() || "Electronic",
          description:   form.description.trim(),
          duration:      "0:00",
          coverGradient: coverUrl ? null : selectedGradient,
          coverUrl,
          audioUrl,
          nftPrice:      form.price ? parseFloat(form.price) : null,
        }),
      });
      
      let postData;
      const contentType = postRes.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        postData = await postRes.json();
      } else {
        const text = await postRes.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server error - please try again");
      }
      
      if (!postRes.ok) {
        if (postData.insufficientTokens) {
          throw new Error(`Not enough MUSIC tokens. You need 10 MUSIC to upload. You have ${postData.balance}. Buy more tokens to continue.`);
        }
        throw new Error(postData.error || "Failed to save track");
      }

      toast.success(`Track published! 🎉 (-10 MUSIC — balance: ${postData.newTokenBalance} MUSIC)`);
      window.location.href = "/";    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleNext = () => {
    if (step === 0 && !audioFile) { toast.error("Please select an audio file first."); return; }
    if (step === 1 && !form.title.trim()) { toast.error("Track title is required."); return; }
    if (step === STEPS.length - 1) { handlePublish(); return; }
    setStep((s) => s + 1);
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    border: "1px solid #e5e5e5", borderRadius: 8,
    fontSize: 14, outline: "none", boxSizing: "border-box",
    transition: "border-color 0.15s", fontFamily: "inherit",
  };

  return (
    <>
      <Sidebar />
      <Header
        user={user}
        onLoginWithEmail={onLoginWithEmail}
        onRegisterWithEmail={onRegisterWithEmail}
        onLogout={onLogout}
      />
      <main style={{
        marginLeft: 240, marginTop: 64, marginBottom: 72,
        padding: "28px 32px", minHeight: "calc(100vh - 64px - 72px)", background: "#fafafa",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#171717", marginBottom: 4 }}>Upload Music</h1>
          <p style={{ fontSize: 14, color: "#737373", marginBottom: 28 }}>
            Upload your track — it saves to your profile so you see it every time you log in
          </p>

          {/* Step indicator */}
          <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 32 }}>
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                  <div
                    onClick={() => i < step && setStep(i)}
                    style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: i <= step ? "#10b981" : "#e5e5e5",
                      color: i <= step ? "#fff" : "#a3a3a3",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 600,
                      cursor: i < step ? "pointer" : "default",
                    }}
                  >
                    {i < step ? "✓" : i + 1}
                  </div>
                  <div style={{ fontSize: 11, marginTop: 6, color: i <= step ? "#10b981" : "#a3a3a3", fontWeight: i === step ? 600 : 400, textAlign: "center", whiteSpace: "nowrap" }}>
                    {s}
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: i < step ? "#10b981" : "#e5e5e5", marginTop: 15 }} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step 0: Upload */}
          {step === 0 && (
            <div
              onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
              style={{
                border: `2px dashed ${audioFile ? "#10b981" : "#d4d4d4"}`,
                borderRadius: 16, padding: "60px 40px", textAlign: "center",
                background: audioFile ? "#f0fdf4" : "#fff", cursor: "pointer",
              }}
              onMouseEnter={(e) => !audioFile && (e.currentTarget.style.borderColor = "#10b981")}
              onMouseLeave={(e) => !audioFile && (e.currentTarget.style.borderColor = "#d4d4d4")}
            >
              <FiMusic size={40} color={audioFile ? "#10b981" : "#a3a3a3"} style={{ marginBottom: 16 }} />
              {audioFile ? (
                <>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#10b981", marginBottom: 8 }}>✓ {audioFile.name}</div>
                  <div style={{ fontSize: 13, color: "#737373", marginBottom: 20 }}>{(audioFile.size / 1024 / 1024).toFixed(2)} MB</div>
                  <label style={{ display: "inline-block", background: "#fff", color: "#10b981", padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1px solid #10b981" }}>
                    Change File <input type="file" accept="audio/*" style={{ display: "none" }} onChange={handleAudioChange} />
                  </label>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#171717", marginBottom: 8 }}>Drop your audio file here</div>
                  <div style={{ fontSize: 13, color: "#737373", marginBottom: 20 }}>MP3, WAV, FLAC up to 50MB — or click to browse</div>
                  <label style={{ display: "inline-block", background: "#10b981", color: "#fff", padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                    Choose File <input type="file" accept="audio/*" style={{ display: "none" }} onChange={handleAudioChange} />
                  </label>
                </>
              )}
            </div>
          )}

          {/* Step 1: Details */}
          {step === 1 && (
            <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 16, padding: 28 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#525252", display: "block", marginBottom: 6 }}>Track Title *</label>
                <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="My Amazing Track"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                  onBlur={(e)  => (e.target.style.borderColor = "#e5e5e5")} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#525252", display: "block", marginBottom: 6 }}>Artist Name</label>
                <input type="text" name="artist" value={form.artist} onChange={handleChange} placeholder="Your name or alias"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                  onBlur={(e)  => (e.target.style.borderColor = "#e5e5e5")} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#525252", display: "block", marginBottom: 6 }}>Genre</label>
                <select name="genre" value={form.genre} onChange={handleChange}
                  style={{ ...inputStyle, cursor: "pointer" }}
                  onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                  onBlur={(e)  => (e.target.style.borderColor = "#e5e5e5")}>
                  <option value="">Select genre...</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Artistic">Artistic</option>
                  <option value="Pop">Pop</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#525252", display: "block", marginBottom: 6 }}>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe your track…" rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                  onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                  onBlur={(e)  => (e.target.style.borderColor = "#e5e5e5")} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#525252", display: "block", marginBottom: 10 }}>Cover Art (optional)</label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, width: "fit-content", padding: "8px 16px", border: "1px solid #e5e5e5", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "#525252", marginBottom: 12 }}>
                  <FiImage size={15} /> Upload Image
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleCoverChange} />
                </label>
                {coverPreview ? (
                  <img src={coverPreview} alt="cover" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 10, border: "1px solid #e5e5e5" }} />
                ) : (
                  <>
                    <div style={{ fontSize: 12, color: "#a3a3a3", marginBottom: 8 }}>Or pick a gradient:</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {GRADIENTS.map((g) => (
                        <div key={g} onClick={() => setSelectedGradient(g)}
                          style={{ width: 44, height: 44, borderRadius: 8, background: g, cursor: "pointer", border: selectedGradient === g ? "3px solid #10b981" : "3px solid transparent" }} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Price */}
          {step === 2 && (
            <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 16, padding: 28 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#525252", display: "block", marginBottom: 6 }}>
                Mint Price (ETH — Sepolia) <span style={{ color: "#a3a3a3", fontWeight: 400 }}>optional</span>
              </label>
              <input type="number" name="price" value={form.price} onChange={handleChange}
                placeholder="0.05" min="0" step="0.001"
                style={{ ...inputStyle, fontSize: 16, marginBottom: 20 }}
                onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                onBlur={(e)  => (e.target.style.borderColor = "#e5e5e5")} />
              <div style={{ background: "#f0fdf4", border: "1px solid #a7f3d0", borderRadius: 8, padding: 14, fontSize: 13, color: "#065f46" }}>
                💡 Creators earn royalties on every secondary sale. Leave blank to upload for free.
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 16, padding: 28, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎵</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#171717", marginBottom: 8 }}>Ready to Publish</h2>
              <p style={{ fontSize: 14, color: "#737373", marginBottom: 20 }}>Your track will be saved to your profile.</p>

              {/* Upload cost notice */}
              <div style={{ background: "#f0fdf4", border: "1px solid #a7f3d0", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "#065f46" }}>
                🎵 Publishing costs <strong>10 MUSIC tokens</strong> — deducted automatically from your balance.
              </div>
              <div style={{ background: "#fafafa", border: "1px solid #e5e5e5", borderRadius: 8, padding: 16, textAlign: "left", marginBottom: 20 }}>
                {[
                  ["File",   audioFile?.name],
                  ["Title",  form.title],
                  ["Artist", form.artist || user?.username || "—"],
                  ["Genre",  form.genre || "Electronic"],
                  ["Price",  form.price ? `${form.price} ETH` : "Free"],
                ].map(([k, v]) => v ? (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                    <span style={{ color: "#737373" }}>{k}</span>
                    <span style={{ color: "#171717", fontWeight: 500 }}>{v}</span>
                  </div>
                ) : null)}
              </div>
              {!user && (
                <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 8, padding: 12, fontSize: 13, color: "#92400e", marginBottom: 16 }}>
                  ⚠️ Sign in to publish your track.
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
              style={{ padding: "10px 24px", borderRadius: 8, border: "1px solid #e5e5e5", background: "#fff", fontSize: 14, color: step === 0 ? "#a3a3a3" : "#171717", cursor: step === 0 ? "not-allowed" : "pointer", fontWeight: 500 }}>
              ← Back
            </button>
            <button onClick={handleNext} disabled={uploading}
              style={{ padding: "10px 28px", borderRadius: 8, border: "none", background: uploading ? "#a3a3a3" : "#10b981", color: "#fff", fontSize: 14, fontWeight: 600, cursor: uploading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              {uploading ? <><FiUploadCloud size={15} /> Uploading…</> : step === STEPS.length - 1 ? "🚀 Publish Track" : "Next →"}
            </button>
          </div>
        </div>
        <Footer />
      </main>
      <Player />
    </>
  );
};

export default CreatePage;
