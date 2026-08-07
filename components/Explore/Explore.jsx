import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import ExploreCard from "./ExploreCard";

const GENRES = ["All", "Electronic", "Hindi", "Artistic", "Pop", "Japanese", "Other"];

// ── Skeleton card shown while loading ───────────────────────
const SkeletonCard = ({ index }) => (
  <div
    className="animate-slideUp"
    style={{
      borderRadius: 12, overflow: "hidden",
      border: "1px solid #f0f0f0",
      animationDelay: `${index * 0.06}s`,
      animationFillMode: "backwards",
    }}
  >
    <div className="skeleton" style={{ height: 140 }} />
    <div style={{ padding: "12px 14px" }}>
      <div className="skeleton" style={{ height: 14, width: "70%", marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 12, width: "45%" }} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
        <div className="skeleton" style={{ height: 11, width: 50 }} />
        <div className="skeleton" style={{ height: 20, width: 60, borderRadius: 20 }} />
      </div>
    </div>
  </div>
);

const Explore = ({ user }) => {
  const router = useRouter();
  const [activeGenre, setActiveGenre] = useState("All");
  const [search, setSearch] = useState(() =>
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("q") || ""
      : ""
  );
  const [tracks, setTracks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const debounceRef           = useRef(null);

  useEffect(() => {
    if (router.isReady && router.query.q !== undefined) {
      setSearch(router.query.q || "");
    }
  }, [router.isReady, router.query.q]);

  useEffect(() => {
    if (!router.isReady) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const genreParam  = activeGenre !== "All" ? `&genre=${encodeURIComponent(activeGenre)}` : "";
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
    }, search.trim() ? 300 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [router.isReady, activeGenre, search]);

  return (
    <div className="animate-fadeIn">
      {/* Page header */}
      <div className="animate-slideUp" style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: "#171717" }}>
          Explore
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: "#737373" }}>
          Discover new music from artists on-chain
        </p>
      </div>

      {/* Search */}
      <div className="animate-slideUp-delay-1">
        <input
          type="text"
          placeholder="Search tracks or artists..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "10px 14px",
            border: "1px solid #e5e5e5", borderRadius: 8,
            fontSize: 14, outline: "none", marginBottom: 16,
            boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#10b981";
            e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#e5e5e5";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      {/* Genre pills */}
      <div
        className="animate-slideUp-delay-2"
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}
      >
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setActiveGenre(g)}
            style={{
              padding: "6px 16px", borderRadius: 20,
              border: "1px solid",
              borderColor: activeGenre === g ? "#10b981" : "#e5e5e5",
              background: activeGenre === g ? "#10b981" : "#fff",
              color: activeGenre === g ? "#fff" : "#525252",
              fontSize: 13, fontWeight: 500, cursor: "pointer",
              transition: "all 0.2s ease",
              transform: activeGenre === g ? "scale(1.05)" : "scale(1)",
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Skeleton loading grid */}
      {loading && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
        }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} index={i} />
          ))}
        </div>
      )}

      {/* Track grid */}
      {!loading && tracks.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
        }}>
          {tracks.map((track, i) => (
            <div
              key={track.id}
              className="animate-slideUp"
              style={{ animationDelay: `${i * 0.05}s`, animationFillMode: "backwards" }}
            >
              <ExploreCard item={track} user={user} />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && tracks.length === 0 && (
        <div
          className="animate-fadeIn"
          style={{ textAlign: "center", padding: "60px 0", color: "#a3a3a3" }}
        >
          <div style={{ fontSize: 40, marginBottom: 12, animation: "bounce 2s infinite" }}>🎵</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#525252", marginBottom: 6 }}>
            No tracks found
          </div>
          <div style={{ fontSize: 13 }}>Try a different search or genre.</div>
        </div>
      )}
    </div>
  );
};

export default Explore;
