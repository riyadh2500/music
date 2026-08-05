import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { FiUser, FiSettings, FiLogOut, FiUpload, FiHeart } from "react-icons/fi";
import { BsMusicNote } from "react-icons/bs";

const MENU_ITEMS = [
  { icon: <FiUser size={15} />,     label: "My Profile",   href: "/profileEdit" },
  { icon: <FiUpload size={15} />,   label: "Upload Music", href: "/create" },
  { icon: <FiHeart size={15} />,    label: "Liked Songs",  href: "/" },
  { icon: <FiSettings size={15} />, label: "Settings",     href: "/profileEdit" },
];

const ProfileMenu = ({ onClose, onDisconnect, onBuyTokens, user }) => {
  const ref = useRef();
  const [musicTokens, setMusicTokens] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Fetch MUSIC token balance
  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/tokens/balance?userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => setMusicTokens(d.balance ?? 0))
      .catch(() => setMusicTokens(0));
  }, [user?.id]);

  const handleDisconnect = () => {
    if (onDisconnect) onDisconnect();
    onClose();
  };

  return (
    <div
      ref={ref}
      style={{
        position: "absolute", top: "calc(100% + 8px)", right: 0,
        width: 240, background: "#fff",
        border: "1px solid #e5e5e5", borderRadius: 14,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        zIndex: 9999, overflow: "hidden",
      }}
    >
      {/* User info */}
      {user && (
        <div style={{ padding: "14px 16px", background: "#f0fdf4", borderBottom: "1px solid #d1fae5" }}>
          {/* Name */}
          <div style={{ fontSize: 13, fontWeight: 700, color: "#065f46", marginBottom: 2 }}>
            {user.username || user.email?.split("@")[0]}
          </div>
          <div style={{ fontSize: 11, color: "#737373", marginBottom: 10 }}>
            {user.email}
          </div>

          {/* MUSIC balance + Buy */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <BsMusicNote size={12} color="#059669" />
              <span style={{ fontSize: 12, color: "#065f46", fontWeight: 600 }}>
                {musicTokens === null ? "…" : `${musicTokens.toLocaleString()} MUSIC`}
              </span>
            </div>
            <button
              onClick={() => { onClose(); if (onBuyTokens) onBuyTokens(); }}
              style={{
                fontSize: 11, fontWeight: 600, color: "#059669",
                background: "rgba(16,185,129,0.12)", border: "1px solid #6ee7b7",
                borderRadius: 6, padding: "3px 10px", cursor: "pointer",
              }}
            >
              + Buy
            </button>
          </div>
        </div>
      )}

      {/* Nav items */}
      <div style={{ padding: "8px 0" }}>
        {MENU_ITEMS.map((item) => (
          <Link key={item.label} href={item.href} style={{ textDecoration: "none" }} onClick={onClose}>
            <div
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 16px", cursor: "pointer",
                color: "#404040", fontSize: 13,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f9f9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {item.icon}
              {item.label}
            </div>
          </Link>
        ))}
      </div>

      {/* Sign Out */}
      <div style={{ borderTop: "1px solid #f0f0f0", padding: "8px 0" }}>
        <div
          onClick={handleDisconnect}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 16px", cursor: "pointer",
            color: "#ef4444", fontSize: 13, fontWeight: 500,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <FiLogOut size={15} />
          Sign Out
        </div>
      </div>
    </div>
  );
};

export default ProfileMenu;
