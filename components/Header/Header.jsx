import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FiSearch, FiBell, FiUpload, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import ProfileMenu from "../Global/ProfileMenu";
import TokenICO from "../Global/TokenICO";
import Contract from "../Global/Contract";
import ConvertModal from "../Global/ConvertModal";
import CreateAccount from "../CreateAccount/CreateAccount";

const SUGGESTIONS = [
  "Midnight Vibes", "Neon Dreamer", "Chain Reaction",
  "CryptoBeats", "SynthWave3", "Web3Artist", "BlockchainDJ",
];


const Header = ({ onLogout, onLoginWithEmail, onRegisterWithEmail, user }) => {
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Modals
  const [showTokenICO, setShowTokenICO]           = useState(false);
  const [showContract, setShowContract]           = useState(false);
  const [showConvert, setShowConvert]             = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);

  const notifRef  = useRef();
  const searchRef = useRef();
  const walletRef = useRef();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Fetch real notifications ───────────────────────────
  const fetchNotifications = async () => {
    if (!user?.id) return;
    setNotifLoading(true);
    try {
      const res  = await fetch(`/api/notifications?userId=${user.id}`);
      const data = await res.json();
      if (data.notifications) setNotifications(data.notifications);
    } catch { /* non-fatal */ }
    finally { setNotifLoading(false); }
  };

  useEffect(() => {
    if (user?.id) fetchNotifications();
  }, [user?.id]);

  // Re-fetch when dropdown opens
  const handleToggleNotif = () => {
    setShowNotifications((v) => {
      if (!v) fetchNotifications();
      return !v;
    });
  };

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

  const markOneRead = async (id) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const suggestions = search.length > 0
    ? SUGGESTIONS.filter((s) => s.toLowerCase().includes(search.toLowerCase()))
    : [];

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) { setShowSuggestions(false); toast(`Searching for "${search}"…`, { icon: "🔍" }); }
  };

  const handleWalletClick = () => {
    if (user) setShowProfileMenu((v) => !v);
    else setShowCreateAccount(true);
  };

  const handleDisconnect = () => {
    if (onLogout) onLogout();
    setShowProfileMenu(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setShowNotifications(false);
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <header
        style={{
          position: "fixed", top: 0, left: 240, right: 0, height: 64,
          backgroundColor: "#fff", borderBottom: "1px solid #e5e5e5",
          display: "flex", alignItems: "center", padding: "0 24px",
          gap: 14, zIndex: 1300,
        }}
      >
        {/* Search */}
        <div ref={searchRef} style={{ flex: 1, maxWidth: 460, position: "relative" }}>
          <form onSubmit={handleSearch}>
            <div
              style={{
                display: "flex", alignItems: "center", background: "#f5f5f5",
                borderRadius: 8, padding: "8px 12px", gap: 8,
              }}
            >
              <FiSearch size={15} color="#737373" />
              <input
                type="text"
                placeholder="Search artists, songs, playlists..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                style={{
                  border: "none", outline: "none", background: "transparent",
                  fontSize: 14, width: "100%", color: "#171717",
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(""); setShowSuggestions(false); }}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
                >
                  <FiX size={14} color="#a3a3a3" />
                </button>
              )}
            </div>
          </form>

          {showSuggestions && suggestions.length > 0 && (
            <div
              style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                background: "#fff", border: "1px solid #e5e5e5", borderRadius: 8,
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 9999, overflow: "hidden",
              }}
            >
              {suggestions.map((s) => (
                <div
                  key={s}
                  onClick={() => { setSearch(s); setShowSuggestions(false); toast(`Searching "${s}"…`, { icon: "🔍" }); }}
                  style={{
                    padding: "10px 14px", fontSize: 13, color: "#171717",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <FiSearch size={12} color="#a3a3a3" /> {s}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: 1 }} />

        {/* Token ICO button */}
        <button
          onClick={() => setShowTokenICO(true)}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            background: "linear-gradient(135deg,#0d3b2e,#10b981)",
            color: "#fff", border: "none", borderRadius: 8,
            padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
          title="Buy MUSIC Tokens"
        >
          🎵 Buy Tokens
        </button>

        {/* Send button — removed (MetaMask only feature) */}


        {/* Contract button */}
        <button
          onClick={() => setShowContract(true)}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            background: "#fff", color: "#404040",
            border: "1px solid #e5e5e5", borderRadius: 8,
            padding: "8px 14px", fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}
          title="Smart Contract"
        >
          📄 Contract
        </button>

        {/* Convert button */}
        <button
          onClick={() => setShowConvert(true)}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            background: "#fff", color: "#059669",
            border: "1px solid #a7f3d0", borderRadius: 8,
            padding: "8px 14px", fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}
          title="Convert MUSIC tokens to ETH"
        >
          🔄 Convert
        </button>

        {/* Upload */}
        <Link href="/create">
          <button
            style={{
              display: "flex", alignItems: "center", gap: 7,
              background: "#171717", color: "#fff", border: "none",
              borderRadius: 8, padding: "9px 16px", fontSize: 13,
              fontWeight: 500, cursor: "pointer",
            }}
          >
            <FiUpload size={13} /> Upload
          </button>
        </Link>

        {/* Notifications */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <button
            onClick={handleToggleNotif}
            style={{
              background: "none", border: "1px solid #e5e5e5", borderRadius: 8,
              width: 38, height: 38, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", position: "relative",
            }}
          >
            <FiBell size={17} color="#404040" />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: 5, right: 5,
                width: 8, height: 8, borderRadius: "50%",
                background: "#ef4444", border: "1.5px solid #fff",
              }} />
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0, width: 300,
              background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 9999, overflow: "hidden",
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 16px", borderBottom: "1px solid #f0f0f0",
              }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: "#171717" }}>
                  Notifications {unreadCount > 0 && `(${unreadCount})`}
                </span>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {unreadCount > 0 && (
                    <span onClick={markAllRead} style={{ fontSize: 12, color: "#10b981", cursor: "pointer" }}>
                      Mark all read
                    </span>
                  )}
                  <Link href="/notifications" onClick={() => setShowNotifications(false)}>
                    <span style={{ fontSize: 12, color: "#10b981", cursor: "pointer" }}>See all</span>
                  </Link>
                </div>
              </div>

              {notifLoading ? (
                <div style={{ padding: "20px 16px", textAlign: "center", fontSize: 13, color: "#a3a3a3" }}>
                  Loading…
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: "24px 16px", textAlign: "center", fontSize: 13, color: "#a3a3a3" }}>
                  <FiBell size={24} style={{ marginBottom: 8, opacity: 0.3, display: "block", margin: "0 auto 8px" }} />
                  No notifications yet
                </div>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markOneRead(n.id)}
                    style={{
                      padding: "10px 16px", borderBottom: "1px solid #f9f9f9",
                      background: n.read ? "#fff" : "#f0fdf4", cursor: "pointer",
                      display: "flex", gap: 10, alignItems: "flex-start",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = n.read ? "#fff" : "#f0fdf4")}
                  >
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: n.read ? "transparent" : "#10b981",
                      marginTop: 5, flexShrink: 0,
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: "#171717" }}>
                        {n.actor?.username && <strong>{n.actor.username} </strong>}
                        {n.message || n.text || "New notification"}
                      </div>
                      <div style={{ fontSize: 11, color: "#a3a3a3", marginTop: 2 }}>
                        {n.created_at ? new Date(n.created_at).toRelativeTimeString?.() || new Date(n.created_at).toLocaleDateString() : n.time}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Profile / Sign In */}
        <div ref={walletRef} style={{ position: "relative" }}>
          <button
            onClick={handleWalletClick}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: user ? "#f0fdf4" : "#fff",
              color: user ? "#059669" : "#404040",
              border: `1px solid ${user ? "#a7f3d0" : "#e5e5e5"}`,
              borderRadius: 8, padding: "7px 14px",
              fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            {/* Avatar circle */}
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <span style={{
                width: 22, height: 22, borderRadius: "50%",
                background: user ? "#10b981" : "#e5e5e5",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: user ? "#fff" : "#737373", flexShrink: 0,
              }}>
                {user ? (user.username || user.email || "U")[0].toUpperCase() : "?"}
              </span>
            )}
            {user ? (
              <span style={{ fontSize: 12, fontWeight: 600, lineHeight: "1.2" }}>
                {user.username || user.email?.split("@")[0]}
              </span>
            ) : (
              "Sign In"
            )}
          </button>

          {showProfileMenu && user && (
            <ProfileMenu
              onClose={() => setShowProfileMenu(false)}
              user={user}
              onDisconnect={handleDisconnect}
              onBuyTokens={() => { setShowProfileMenu(false); setShowTokenICO(true); }}
            />
          )}
        </div>
      </header>

      {/* Modals */}
      {showTokenICO && <TokenICO onClose={() => setShowTokenICO(false)} user={user} />}
      {showContract && <Contract onClose={() => setShowContract(false)} walletAddress={null} />}
      {showConvert  && <ConvertModal onClose={() => setShowConvert(false)} user={user} />}
      {showCreateAccount && (
        <CreateAccount
          onClose={() => setShowCreateAccount(false)}
          onLoginWithEmail={onLoginWithEmail}
          onRegisterWithEmail={onRegisterWithEmail}
        />
      )}
    </>
  );
};

export default Header;
