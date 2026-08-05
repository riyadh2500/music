import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Loader from "./Loader";

const FALLBACK = [];

const gradients = [
  "linear-gradient(135deg,#10b981,#059669)",
  "linear-gradient(135deg,#8b5cf6,#6d28d9)",
  "linear-gradient(135deg,#f59e0b,#d97706)",
  "linear-gradient(135deg,#3b82f6,#1d4ed8)",
  "linear-gradient(135deg,#ec4899,#be185d)",
  "linear-gradient(135deg,#14b8a6,#0f766e)",
];

const ArtistCard = ({ artist, index, user }) => {
  const router = useRouter();
  const [following, setFollowing] = useState(false);

  const handleFollow = async (e) => {
    e.stopPropagation();
    if (!user) { toast.error("Sign in to follow artists"); return; }
    try {
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: user.id, followingId: artist.id }),
      });
      const data = await res.json();
      setFollowing(data.following);
      toast.success(data.following ? `Following ${artist.username}!` : `Unfollowed ${artist.username}`);
    } catch {
      toast.error("Something went wrong");
    }
  };

  const gradient = artist.gradient || gradients[index % gradients.length];

  return (
    <div
      onClick={() => router.push(`/profile/${artist.id}`)}
      style={{
        background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12,
        overflow: "hidden", textAlign: "center",
        transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ height: 70, background: gradient }} />
      <div style={{ padding: "0 16px 16px", marginTop: -28 }}>
        {/* Avatar - show image if available, otherwise show initial */}
        {artist.avatar_url ? (
          <img
            src={artist.avatar_url}
            alt={artist.username}
            style={{
              width: 56, height: 56, borderRadius: "50%",
              border: "3px solid #fff",
              margin: "0 auto 10px",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: 56, height: 56, borderRadius: "50%",
              background: gradient, border: "3px solid #fff",
              margin: "0 auto 10px", display: "flex", alignItems: "center",
              justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 20,
            }}
          >
            {artist.username?.[0]?.toUpperCase()}
          </div>
        )}
        <div style={{ fontWeight: 600, fontSize: 15, color: "#171717", marginBottom: 4 }}>{artist.username}</div>
        <div style={{ fontSize: 12, color: "#737373", marginBottom: 14 }}>{artist.bio || "Music Creator"}</div>
        <button
          onClick={handleFollow}
          style={{
            width: "100%", padding: "8px 0", borderRadius: 8, border: following ? "1px solid #e5e5e5" : "none",
            background: following ? "#fff" : "#10b981", color: following ? "#525252" : "#fff",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >
          {following ? "Following ✓" : "+ Follow"}
        </button>
      </div>
    </div>
  );
};

const Artists = ({ user }) => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const res = await fetch(`/api/users?limit=20`);
        const data = await res.json();
        setArtists(data.users?.length > 0 ? data.users : []);
      } catch {
        setArtists([]);
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, []);

  const filtered = artists.filter((a) =>
    a.username?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: "#171717" }}>Top Creators</h1>
        <p style={{ margin: 0, fontSize: 14, color: "#737373" }}>Follow your favorite on-chain artists</p>
      </div>

      <input
        type="text"
        placeholder="Search creators..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%", padding: "10px 14px", border: "1px solid #e5e5e5",
          borderRadius: 8, fontSize: 14, outline: "none",
          marginBottom: 20, boxSizing: "border-box",
        }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 16 }}>
        {filtered.map((artist, i) => (
          <ArtistCard key={artist.id} artist={artist} index={i} user={user} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#a3a3a3" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎤</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#525252", marginBottom: 6 }}>No creators yet</div>
          <div style={{ fontSize: 13 }}>Be the first to join and upload music!</div>
        </div>
      )}
    </div>
  );
};

export default Artists;
