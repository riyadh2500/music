import React, { useState, useEffect } from "react";
import Post from "./Post";
import Loader from "../Global/Loader";

const Feed = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/posts?limit=20");
        const data = await res.json();
        setPosts(data.posts && data.posts.length > 0 ? data.posts : []);
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [user?.id]); // re-fetch whenever the logged-in user changes

  if (loading) return <Loader />;

  if (posts.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0", color: "#a3a3a3" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🎵</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#525252", marginBottom: 6 }}>No tracks yet</div>
        <div style={{ fontSize: 13 }}>Be the first to upload music!</div>
      </div>
    );
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "20px",
      marginTop: "20px",
    }}>
      {posts.map((post) => (
        <Post key={post.id} post={post} user={user} />
      ))}
    </div>
  );
};

export default Feed;
