import React, { useState, useEffect } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FiUserPlus, FiMusic, FiDollarSign, FiTrendingUp, FiBell, FiRefreshCw } from "react-icons/fi";

const TYPE_ICONS = {
  like:      <AiFillHeart size={15} color="#ef4444" />,
  follow:    <FiUserPlus size={15} color="#8b5cf6" />,
  purchase:  <FiDollarSign size={15} color="#10b981" />,
  trending:  <FiTrendingUp size={15} color="#f59e0b" />,
  upload:    <FiMusic size={15} color="#3b82f6" />,
};

const TYPE_BG = {
  like:     "#fef2f2",
  follow:   "#f5f3ff",
  purchase: "#f0fdf4",
  trending: "#fefce8",
  upload:   "#eff6ff",
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const TABS = ["All", "Likes", "Follows", "Purchases"];

const Notifications = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [activeTab, setActiveTab]         = useState("All");
  const [refreshing, setRefreshing]       = useState(false);

  const fetchNotifications = async (quiet = false) => {
    if (!user?.id) { setLoading(false); return; }
    if (!quiet) setLoading(true); else setRefreshing(true);
    try {
      const res  = await fetch(`/api/notifications?userId=${user.id}`);
      const data = await res.json();
      setNotifications(data.notifications ?? []);
    } catch { /* non-fatal */ }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchNotifications(); }, [user?.id]);

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (user?.id) {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
    }
  };

  const markRead = (id) =>
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

  const filtered = notifications.filter((n) => {
    if (activeTab === "All")       return true;
    if (activeTab === "Likes")     return n.type === "like";
    if (activeTab === "Follows")   return n.type === "follow";
    if (activeTab === "Purchases") return n.type === "purchase";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: "#171717" }}>
            Notifications
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "#737373" }}>
            {loading ? "Loading…" : unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 8,
              border: "1px solid #e5e5e5", background: "#fff",
              color: "#525252", fontSize: 13, cursor: "pointer",
            }}
          >
            <FiRefreshCw size={13} style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }} />
            Refresh
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{
                padding: "8px 16px", borderRadius: 8,
                border: "1px solid #a7f3d0", background: "#f0fdf4",
                color: "#059669", fontSize: 13, fontWeight: 500, cursor: "pointer",
              }}
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid #f0f0f0" }}>
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
            {tab}
            {tab === "All" && unreadCount > 0 && (
              <span style={{
                marginLeft: 6, background: "#ef4444", color: "#fff",
                fontSize: 10, fontWeight: 700, padding: "1px 6px",
                borderRadius: 20, verticalAlign: "middle",
              }}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {!user?.id ? (
        <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, padding: "60px 0", textAlign: "center", color: "#a3a3a3" }}>
          <FiBell size={32} style={{ marginBottom: 10, opacity: 0.3, display: "block", margin: "0 auto 10px" }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: "#525252", marginBottom: 6 }}>Sign in to see notifications</div>
        </div>
      ) : loading ? (
        <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, padding: "60px 0", textAlign: "center", color: "#a3a3a3" }}>
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, padding: "60px 0", textAlign: "center" }}>
          <FiBell size={32} style={{ marginBottom: 10, opacity: 0.3, display: "block", margin: "0 auto 10px", color: "#a3a3a3" }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: "#525252", marginBottom: 6 }}>No notifications yet</div>
          <div style={{ fontSize: 13, color: "#a3a3a3" }}>Activity from followers and likes will appear here.</div>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, overflow: "hidden" }}>
          {filtered.map((n, i) => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              style={{
                display: "flex", alignItems: "flex-start", gap: 14,
                padding: "14px 18px",
                borderBottom: i < filtered.length - 1 ? "1px solid #f9f9f9" : "none",
                background: n.read ? "#fff" : "#f0fdf4",
                cursor: "pointer", transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
              onMouseLeave={(e) => (e.currentTarget.style.background = n.read ? "#fff" : "#f0fdf4")}
            >
              {/* Icon */}
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: TYPE_BG[n.type] || "#f5f5f5",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {TYPE_ICONS[n.type] || <FiBell size={15} color="#737373" />}
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "#171717", lineHeight: 1.5 }}>
                  {n.actor?.username && <strong>{n.actor.username} </strong>}
                  {n.message || "New notification"}
                </div>
                <div style={{ fontSize: 11, color: "#a3a3a3", marginTop: 3 }}>
                  {timeAgo(n.created_at)}
                </div>
              </div>

              {/* Unread dot */}
              {!n.read && (
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#10b981", flexShrink: 0, marginTop: 4,
                }} />
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Notifications;
