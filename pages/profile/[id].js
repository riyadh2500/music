import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { Header, Sidebar, Player, Footer } from "../../components";
import { BsPlayFill, BsPauseFill, BsMusicNote } from "react-icons/bs";
import { FiShare2 } from "react-icons/fi";
import toast from "react-hot-toast";

const GENRE_COLORS = {
  Electronic: "#8b5cf6", "Hip-Hop": "#f59e0b",
  Pop: "#ec4899", Jazz: "#3b82f6", Rock: "#ef4444",
};

const CreatorProfilePage = ({ user, onLoginWithEmail, onRegisterWithEmail, onLogout }) => {
  const router = useRouter();
  const { id }  = router.query;

  const [profile, setProfile]     = useState(null);
  const [posts, setPosts]         = useState([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState("Uploads");
  const [playingId, setPlayingId] = useState(null);
  const audioRefs = useRef({});

  const isOwnProfile = user?.id === id;

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const [pRes, qRes] = await Promise.all([
          fetch(`/api/users/${id}`),
          fetch(`/api/posts?userId=${id}&limit=50`),
        ]);
        const pData = await pRes.json();
        const qData = await qRes.json();
        if (pData.user) {
          setProfile(pData.user);
          setFollowers(pData.user.followers_count ?? 0);
          setFollowing(pData.user.following_count ?? 0);
        }
        setPosts(qData.posts ?? []);

        // Check if current user follows this creator
        if (user?.id && user.id !== id) {
          const fRes  = await fetch(`/api/follows?followerId=${user.id}&followingId=${id}`);
          const fData = await fRes.json();
          setIsFollowing(fData.following ?? false);
        }
      } catch { /* non-fatal */ }
      finally { setLoading(false); }
    };
    load();
  }, [id, user?.id]);

  const handleFollow = async () => {
    if (!user) { toast.error("Sign in to follow creators"); return; }
    try {
      const res  = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: user.id, followingId: id }),
      });
      const data = await res.json();
      setIsFollowing(data.following);
      setFollowers((f) => data.following ? f + 1 : Math.max(0, f - 1));
      toast.success(data.following ? `Following ${profile?.username}!` : "Unfollowed");
    } catch { toast.error("Something went wrong"); }
  };

  const togglePlay = (post) => {
    if (!post.audio_url) { toast.error("No audio for this track"); return; }
    if (playingId === post.id) {
      audioRefs.current[post.id]?.pause();
      setPlayingId(null);
    } else {
      if (playingId && audioRefs.current[playingId]) audioRefs.current[playingId].pause();
      audioRefs.current[post.id]?.play().catch(() => toast.error("Could not play audio."));
      setPlayingId(post.id);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success("Profile link copied!");
  };

  const displayName  = profile?.username || "Creator";
  const avatarLetter = displayName[0]?.toUpperCase() || "?";

  return (
    <>
      <Sidebar />
      <Header user={user} onLoginWithEmail={onLoginWithEmail} onRegisterWithEmail={onRegisterWithEmail} onLogout={onLogout} />
      <main style={{
        marginLeft: 240, marginTop: 64, marginBottom: 72,
        padding: "28px 32px", minHeight: "calc(100vh - 64px - 72px)", background: "#fafafa",
      }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#a3a3a3" }}>Loading…</div>
        ) : !profile ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#a3a3a3" }}>Creator not found.</div>
        ) : (
          <div>
            {/* Cover */}
            <div style={{
              height: 200, borderRadius: 16, marginBottom: 0,
              background: "linear-gradient(135deg,#0d3b2e 0%,#065f46 50%,#10b981 100%)",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
            </div>

            {/* Profile bar */}
            <div style={{
              background: "#fff", border: "1px solid #e5e5e5",
              borderRadius: "0 0 16px 16px", padding: "0 24px 20px", marginBottom: 20,
            }}>
              {/* Avatar */}
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" style={{
                  width: 80, height: 80, borderRadius: "50%",
                  border: "4px solid #fff", marginTop: -40,
                  objectFit: "cover", display: "block",
                }} />
              ) : (
                <div style={{
                  width: 80, height: 80, borderRadius: "50%",
                  background: "linear-gradient(135deg,#10b981,#059669)",
                  border: "4px solid #fff", marginTop: -40,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 800, fontSize: 28,
                }}>
                  {avatarLetter}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 10 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#171717" }}>{displayName}</div>
                  {profile.bio && <div style={{ fontSize: 13, color: "#737373", marginTop: 2 }}>{profile.bio}</div>}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  {!isOwnProfile && (
                    <button
                      onClick={handleFollow}
                      style={{
                        padding: "8px 20px", borderRadius: 8, border: "none",
                        background: isFollowing ? "#f5f5f5" : "#10b981",
                        color: isFollowing ? "#525252" : "#fff",
                        fontSize: 13, fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      {isFollowing ? "Following ✓" : "+ Follow"}
                    </button>
                  )}
                  <button onClick={handleShare} style={{
                    width: 36, height: 36, borderRadius: 8,
                    border: "1px solid #e5e5e5", background: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                  }}>
                    <FiShare2 size={14} color="#737373" />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: 28, marginTop: 16 }}>
                {[
                  { label: "Uploads",   value: posts.length },
                  { label: "Followers", value: followers.toLocaleString() },
                  { label: "Following", value: following.toLocaleString() },
                  { label: "MUSIC",     value: (profile.music_tokens ?? 0).toLocaleString() },
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
              {["Uploads", "About"].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: "10px 18px", border: "none", background: "transparent",
                  fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
                  color: activeTab === tab ? "#171717" : "#737373", cursor: "pointer",
                  borderBottom: activeTab === tab ? "2px solid #10b981" : "2px solid transparent",
                  marginBottom: -1,
                }}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Uploads tab */}
            {activeTab === "Uploads" && (
              posts.length === 0 ? (
                <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, padding: "48px 0", textAlign: "center", color: "#a3a3a3" }}>
                  <BsMusicNote size={32} style={{ marginBottom: 10, opacity: 0.4, display: "block", margin: "0 auto 10px" }} />
                  <div>No uploads yet</div>
                </div>
              ) : (
                <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, overflow: "hidden" }}>
                  {posts.map((post, i) => {
                    const isPlaying = playingId === post.id;
                    const genre     = post.genre || "Electronic";
                    const color     = GENRE_COLORS[genre] || "#10b981";
                    return (
                      <div key={post.id}>
                        {post.audio_url && (
                          <audio
                            ref={(el) => { if (el) audioRefs.current[post.id] = el; }}
                            src={post.audio_url}
                            onEnded={() => setPlayingId(null)}
                            preload="none"
                          />
                        )}
                        <div
                          onClick={() => togglePlay(post)}
                          style={{
                            display: "flex", alignItems: "center", gap: 14,
                            padding: "12px 16px",
                            borderBottom: i < posts.length - 1 ? "1px solid #f9f9f9" : "none",
                            cursor: "pointer", background: isPlaying ? "#f0fdf4" : "#fff",
                          }}
                          onMouseEnter={(e) => { if (!isPlaying) e.currentTarget.style.background = "#fafafa"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = isPlaying ? "#f0fdf4" : "#fff"; }}
                        >
                          <div style={{
                            width: 48, height: 48, borderRadius: 8, flexShrink: 0,
                            background: post.cover_gradient || "linear-gradient(135deg,#0d3b2e,#10b981)",
                            backgroundImage: post.cover_url ? `url(${post.cover_url})` : undefined,
                            backgroundSize: "cover", backgroundPosition: "center",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {isPlaying ? <BsPauseFill size={18} color="#fff" /> : <BsPlayFill size={18} color="#fff" />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: isPlaying ? "#10b981" : "#171717", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {post.title}
                            </div>
                            <div style={{ fontSize: 12, color: "#737373", marginTop: 2 }}>{post.plays ?? 0} plays</div>
                          </div>
                          <span style={{ background: color, color: "#fff", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, flexShrink: 0 }}>
                            {genre}
                          </span>
                          <div style={{ fontSize: 12, color: "#a3a3a3", flexShrink: 0, marginLeft: 8 }}>
                            {post.duration || "—"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* About tab */}
            {activeTab === "About" && (
              <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, padding: 24 }}>
                {profile.bio
                  ? <p style={{ fontSize: 14, color: "#525252", lineHeight: 1.7, marginBottom: 16 }}>{profile.bio}</p>
                  : <p style={{ fontSize: 14, color: "#a3a3a3", marginBottom: 16 }}>No bio added yet.</p>
                }
                {[
                  profile.twitter && { label: "Twitter", value: profile.twitter },
                  profile.website && { label: "Website", value: profile.website },
                ].filter(Boolean).map((row) => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f5f5f5", fontSize: 13 }}>
                    <span style={{ color: "#737373" }}>{row.label}</span>
                    <span style={{ fontWeight: 500, color: "#171717" }}>{row.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <Footer />
      </main>
      <Player />
    </>
  );
};

export default CreatorProfilePage;
