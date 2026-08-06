import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ExploreCard from "./ExploreCard";

const GENRES = ["All", "Electronic", "Hindi", "Artistic", "Pop", "Japanese", "Other"];

const Explore = ({ user }) => {
  const router = useRouter();
  const [activeGenre, setActiveGenre] = useState("All");
  const [search, setSearch] = useState("");
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pre-fill search from URL query param (?q=...)
  useEffect(() => {
    if (router.query.q) setSearch(router.query.q);
  }, [router.query.q]);

  // Fetch tracks from API (with optional search)
  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      try {
        const genreParam  = activeGenre !== "All" ? `&genre=${activeGenre}` : "";
        const searchParam = search.trim() ? `&search=${encodeURIComponent(search.trim())}` : "";
        const res  = await fetch(`/api/posts?limit=100${genreParam}${searchParam}`);
        const data = await res.json();
        setTracks(data.posts || []);
      } catch (err) {
        console.error("Failed to fetch tracks:", err);
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTracks();
  }, [activeGenre, search]);

  // DB handles both genre + search filtering; show all returned tracks
  const filtered = tracks;

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: "#171717" }}>
          Explore
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: "#737373" }}>
          Discover new music from artists on-chain
        </p>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search tracks or artists..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 14px",
          border: "1px solid #e5e5e5",
          borderRadius: 8,
          fontSize: 14,
          outline: "none",
          marginBottom: 16,
          boxSizing: "border-box",
        }}
      />

      {/* Genre pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setActiveGenre(g)}
            style={{
              padding: "6px 16px",
              borderRadius: 20,
              border: "1px solid",
              borderColor: activeGenre === g ? "#10b981" : "#e5e5e5",
              background: activeGenre === g ? "#10b981" : "#fff",
              color: activeGenre === g ? "#fff" : "#525252",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#a3a3a3" }}>
          Loading tracks...
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {filtered.map((track) => (
            <ExploreCard key={track.id} item={track} user={user} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#a3a3a3" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎵</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#525252", marginBottom: 6 }}>
            {tracks.length === 0 ? "No tracks yet" : "No tracks found"}
          </div>
          <div style={{ fontSize: 13 }}>
            {tracks.length === 0
              ? "Upload music to see it here!"
              : "Try a different search or genre."}
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
