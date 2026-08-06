import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  AiOutlineHome,
  AiOutlineUser, AiOutlineBell,
  AiOutlineCompass,
} from "react-icons/ai";
import { BsMusicNote, BsPlusCircle } from "react-icons/bs";
import { RiUserStarLine } from "react-icons/ri";

const NAV = [
  { label: "Home",          href: "/",             icon: <AiOutlineHome size={20} /> },
  { label: "Explore",       href: "/explore",      icon: <AiOutlineCompass size={20} /> },
  { label: "Creators",      href: "/creator",      icon: <RiUserStarLine size={20} /> },
  { label: "Upload",        href: "/create",       icon: <BsPlusCircle size={20} /> },
  { label: "Notifications", href: "/notifications",icon: <AiOutlineBell size={20} /> },
  { label: "Profile",       href: "/profile",      icon: <AiOutlineUser size={20} /> },
];

const Sidebar = () => {
  const router = useRouter();

  return (
    <aside
      style={{
        position: "fixed", top: 0, left: 0, width: 240, height: "100vh",
        background: "#fff", borderRight: "1px solid #e5e5e5",
        display: "flex", flexDirection: "column",
        zIndex: 1400, overflowY: "auto",
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ textDecoration: "none" }}>
        <div
          style={{
            padding: "20px 20px 16px", borderBottom: "1px solid #f0f0f0",
            display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 36, height: 36,
              background: "linear-gradient(135deg,#10b981,#059669)",
              borderRadius: 10, display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0,
            }}
          >
            <BsMusicNote size={18} color="#fff" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#171717", letterSpacing: "-0.3px" }}>
            MusicDapp
          </span>
        </div>
      </Link>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px" }}>
        {NAV.map((item) => {
          const active = router.pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px", borderRadius: 8, marginBottom: 2,
                  background: active ? "#f0fdf4" : "transparent",
                  color: active ? "#059669" : "#404040",
                  fontWeight: active ? 600 : 400, fontSize: 14, cursor: "pointer",
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#f9f9f9"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                {item.icon}
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid #f0f0f0", fontSize: 11, color: "#a3a3a3" }}>
        Music DApp © 2024
      </div>
    </aside>
  );
};

export default Sidebar;
