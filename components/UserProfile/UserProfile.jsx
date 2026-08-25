import React, { useState, useEffect, useRef } from "react";
import { BsPlayFill, BsPauseFill, BsMusicNote } from "react-icons/bs";
import { AiOutlineHeart } from "react-icons/ai";
import { FiEdit2, FiShare2, FiTrash2 } from "react-icons/fi";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

const TABS = ["Uploads", "About"];

const GENRE_COLORS = {
  Electronic: "#8b5cf6", "Hip-Hop": "#f59e0b",
  Pop: "#ec4899", Jazz: "#3b82f6", Rock: "#ef4444",
};

const UserProfile = ({ user }) => {
  const router = useRouter();

  const [profile, setProfile]   = useState(null);
  const [posts, setPosts]       = useState([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [activeTab, setActiveTab] = useState("Uploads");
  const [playingId, setPlayingId] = useState(null);
  const [loading, setLoading]   = useState(true);
  const audioRefs = useRef({});

  // ── Fetch profile + stats + posts ─────────────────────
  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      setLoading(true);
      try {
        // Profile
        const pRes  = await fetch(`/api/users/${user.id}`);
        const pData = await pRes.json();
        if (pData.user) {
          setProfile(pData.user);
          setFollowers(pData.user.followers_count ?? 0);
          setFollowing(pData.user.following_count ?? 0);
        }

        // Posts/uploads by this user
        const qRes  = await fetch(`/api/posts?userId=${user.id}&limit=50`);
        const qData = await qRes.json();
        setPosts(qData.posts ?? []);
      } catch { /* non-fatal */ }
      finally { setLoading(false); }
    };

    load();
  }, [user?.id]);

  const displayName = profile?.username || user?.username || user?.email?.split("@")[0] || "You";
  const avatarLetter = displayName[0]?.toUpperCase() || "?";

  // ── Delete a track ─────────────────────────────────────
  const deletePost = async (postId) => {
    if (!confirm("Delete this track? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Track deleted");
    } catch (err) { toast.error(err.message); }
  };

  // ── Play / pause ───────────────────────────────────────
  const togglePlay = (post) => {
    if (!post.audio_url) { toast.error("No audio for this track"); return; }

    if (playingId === post.id) {
      audioRefs.current[post.id]?.pause();
      setPlayingId(null);
    } else {
      // Pause any currently playing
      if (playingId && audioRefs.current[playingId]) {
        audioRefs.current[playingId].pause();
      }
      const audio = audioRefs.current[post.id];
      if (audio) {
        audio.play().catch(() => toast.error("Could not play audio."));
        setPlayingId(post.id);
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success("Profile link copied!");
  };

  return (
    <div>
      {/* Cover */}
      <div style={{
        height: 200, borderRadius: 16, marginBottom: 0,
        background: "linear-gradient(135deg,#0d3b2e 0%,#065f46 50%,#10b981 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", bottom: -50, left: 80, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
      </div>

      {/* Profile info bar */}
      <div style={{
        background: "#fff", border: "1px solid #e5e5e5",
        borderRadius: "0 0 16px 16px", padding: "0 24px 20px",
        marginBottom: 20, position: "relative",
      }}>
        {/* Avatar */}
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="avatar" style={{
            width: 80, height: 80, borderRadius: "50%",
            border: "4px solid #fff", marginTop: -40,
            objectFit: "cover", boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            display: "block",
          }} />
        ) : (
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "linear-gradient(135deg,#10b981,#059669)",
            border: "4px solid #fff", marginTop: -40,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: 28,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}>
            {avatarLetter}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 10 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#171717" }}>{displayName}</div>
            {profile?.bio && (
              <div style={{ fontSize: 13, color: "#737373", marginTop: 2, maxWidth: 400 }}>{profile.bio}</div>
            )}
            <div style={{ fontSize: 12, color: "#a3a3a3", marginTop: 4 }}>{user?.email}</div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button
              onClick={() => router.push("/profileEdit")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 8,
                border: "1px solid #e5e5e5", background: "#fff",
                color: "#404040", fontSize: 13, cursor: "pointer",
              }}
            >
              <FiEdit2 size={13} /> Edit Profile
            </button>
            <button
              onClick={handleShare}
              style={{
                width: 36, height: 36, borderRadius: 8,
                border: "1px solid #e5e5e5", background: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}
            >
              <FiShare2 size={14} color="#737373" />
            </button>
          </div>
        </div>

        {/* Stats — real-time */}
        <div style={{ display: "flex", gap: 28, marginTop: 16 }}>
          {[
            { label: "Uploads",   value: loading ? "…" : posts.length },
            { label: "Followers", value: loading ? "…" : followers.toLocaleString() },
            { label: "Following", value: loading ? "…" : following.toLocaleString() },
            { label: "MUSIC",     value: loading ? "…" : (profile?.music_token_balance ?? 0).toLocaleString() },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#171717" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#737373" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #f0f0f0", marginBottom: 20 }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 18px", border: "none", background: "transparent",
              fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? "#171717" : "#737373",
              cursor: "pointer",
              borderBottom: activeTab === tab ? "2px solid #10b981" : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {tab} {tab === "Uploads" && !loading && posts.length > 0 && (
              <span style={{ fontSize: 11, background: "#f0fdf4", color: "#059669", padding: "1px 6px", borderRadius: 10, marginLeft: 4 }}>
                {posts.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Uploads tab ── */}
      {activeTab === "Uploads" && (
        loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#a3a3a3" }}>Loading…</div>
        ) : posts.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, padding: "48px 0", textAlign: "center", color: "#a3a3a3" }}>
            <BsMusicNote size={32} style={{ marginBottom: 10, opacity: 0.4 }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: "#525252", marginBottom: 6 }}>No uploads yet</div>
            <div style={{ fontSize: 13 }}>Upload your first track to see it here.</div>
            <button
              onClick={() => router.push("/create")}
              style={{ marginTop: 16, padding: "8px 20px", background: "#10b981", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              Upload Music
            </button>
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, overflow: "hidden" }}>
            {posts.map((post, i) => {
              const isPlaying = playingId === post.id;
              const genre     = post.genre || "Electronic";
              const color     = GENRE_COLORS[genre] || "#10b981";
              return (
                <div key={post.id}>
                  {/* Hidden audio */}
                  {post.audio_url && (
                    <audio
                      ref={(el) => { if (el) audioRefs.current[post.id] = el; }}
                      src={post.audio_url}
                      onEnded={() => setPlayingId(null)}
                      preload="none"
                    />
                  )}
                  <div
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "12px 16px",
                      borderBottom: i < posts.length - 1 ? "1px solid #f9f9f9" : "none",
                      cursor: "pointer",
                      background: isPlaying ? "#f0fdf4" : "#fff",
                    }}
                    onClick={() => togglePlay(post)}
                    onMouseEnter={(e) => { if (!isPlaying) e.currentTarget.style.background = "#fafafa"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = isPlaying ? "#f0fdf4" : "#fff"; }}
                  >
                    {/* Cover thumbnail */}
                    <div style={{
                      width: 48, height: 48, borderRadius: 8, flexShrink: 0,
                      background: post.cover_gradient || "linear-gradient(135deg,#0d3b2e,#10b981)",
                      backgroundImage: post.cover_url ? `url(${post.cover_url})` : undefined,
                      backgroundSize: "cover", backgroundPosition: "center",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {isPlaying
                        ? <BsPauseFill size={18} color="#fff" />
                        : <BsPlayFill size={18} color="#fff" />}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: isPlaying ? "#10b981" : "#171717", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {post.title}
                      </div>
                      <div style={{ fontSize: 12, color: "#737373", marginTop: 2 }}>
                        {post.plays ?? 0} plays
                      </div>
                    </div>

                    <span style={{ background: color, color: "#fff", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, flexShrink: 0 }}>
                      {genre}
                    </span>
                    <div style={{ fontSize: 12, color: "#a3a3a3", flexShrink: 0, marginLeft: 8 }}>
                      {post.duration || "—"}
                    </div>
                    {/* Delete button — only show for own profile */}
                    <button
                      onClick={(e) => { e.stopPropagation(); deletePost(post.id); }}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        padding: "4px", marginLeft: 4, flexShrink: 0,
                        color: "#ef4444", opacity: 0.6,
                        display: "flex", alignItems: "center",
                      }}
                      title="Delete track"
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.6)}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── About tab ── */}
      {activeTab === "About" && (
        <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, padding: 24 }}>
          {profile?.bio ? (
            <p style={{ fontSize: 14, color: "#525252", lineHeight: 1.7, marginBottom: 16 }}>{profile.bio}</p>
          ) : (
            <p style={{ fontSize: 14, color: "#a3a3a3", marginBottom: 16 }}>No bio yet. <span onClick={() => router.push("/profileEdit")} style={{ color: "#10b981", cursor: "pointer" }}>Add one →</span></p>
          )}
          {[
            profile?.twitter  && { label: "Twitter",  value: profile.twitter },
            profile?.website  && { label: "Website",  value: profile.website },
            user?.email       && { label: "Email",     value: user.email },
          ].filter(Boolean).map((row) => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f5f5f5", fontSize: 13 }}>
              <span style={{ color: "#737373" }}>{row.label}</span>
              <span style={{ fontWeight: 500, color: "#171717" }}>{row.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
