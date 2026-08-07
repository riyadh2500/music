import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  AiOutlineHome, AiOutlineUser, AiOutlineBell, AiOutlineCompass,
} from "react-icons/ai";
import { BsMusicNote, BsPlusCircle } from "react-icons/bs";
import { RiUserStarLine } from "react-icons/ri";

const NAV = [
  { label: "Home",          href: "/",             icon: AiOutlineHome },
  { label: "Explore",       href: "/explore",      icon: AiOutlineCompass },
  { label: "Creators",      href: "/creator",      icon: RiUserStarLine },
  { label: "Upload",        href: "/create",       icon: BsPlusCircle },
  { label: "Notifications", href: "/notifications",icon: AiOutlineBell },
  { label: "Profile",       href: "/profile",      icon: AiOutlineUser },
];

const Sidebar = () => {
  const router = useRouter();
  const [hovered, setHovered] = useState(null);

  return (
    <aside
      style={{
        position: "fixed", top: 0, left: 0, width: 240, height: "100vh",
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(16,185,129,0.12)",
        boxShadow: "4px 0 24px rgba(0,0,0,0.06)",
        display: "flex", flexDirection: "column",
        zIndex: 1400, overflowY: "auto",
        animation: "slideInLeft 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ textDecoration: "none" }}>
        <div style={{
          padding: "20px 20px 16px", borderBottom: "1px solid #f0f0f0",
          display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
        }}>
          <div style={{
            width: 36, height: 36,
            background: "linear-gradient(135deg,#10b981,#059669)",
            borderRadius: 10, display: "flex", alignItems: "center",
            justifyContent: "center", flexShrink: 0,
            animation: "logoPulse 3s ease-in-out infinite",
            boxShadow: "0 0 0 0 rgba(16,185,129,0.4)",
          }}>
            <BsMusicNote size={18} color="#fff" style={{ animation: "bounce 2s ease-in-out infinite" }} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#171717", letterSpacing: "-0.3px" }}>
            MusicDapp
          </span>
        </div>
      </Link>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px" }}>
        {NAV.map((item, i) => {
          const active  = router.pathname === item.href;
          const Icon    = item.icon;
          const isHov   = hovered === item.href;
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <div
                className="animate-slideUp"
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px", borderRadius: 8, marginBottom: 2,
                  background: active ? "#f0fdf4" : isHov ? "#f9f9f9" : "transparent",
                  color: active ? "#059669" : "#404040",
                  fontWeight: active ? 600 : 400, fontSize: 14, cursor: "pointer",
                  transition: "all 0.2s ease",
                  transform: isHov && !active ? "translateX(4px)" : "translateX(0)",
                  animationDelay: `${i * 0.07}s`,
                  animationFillMode: "backwards",
                  borderLeft: active ? "3px solid #10b981" : "3px solid transparent",
                }}
                onMouseEnter={() => setHovered(item.href)}
                onMouseLeave={() => setHovered(null)}
              >
                <div style={{
                  transition: "transform 0.2s",
                  transform: isHov ? "scale(1.2) rotate(-5deg)" : "scale(1) rotate(0deg)",
                  color: active ? "#059669" : isHov ? "#10b981" : "#737373",
                }}>
                  <Icon size={20} />
                </div>
                {item.label}
                {/* Active indicator dot */}
                {active && (
                  <div style={{
                    marginLeft: "auto", width: 6, height: 6, borderRadius: "50%",
                    background: "#10b981",
                    animation: "pulse 2s ease-in-out infinite",
                  }} />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Animated music wave at bottom */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, marginBottom: 8, height: 20 }}>
          {[1,2,3,4,5,6,7].map((i) => (
            <div key={i} style={{
              width: 3, borderRadius: 2,
              background: "linear-gradient(to top, #10b981, #34d399)",
              animationName: "equalizer",
              animationDuration: `${0.6 + i * 0.1}s`,
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              animationDelay: `${i * 0.1}s`,
              height: "100%",
            }} />
          ))}
          <span style={{ fontSize: 11, color: "#a3a3a3", marginLeft: 6 }}>Music DApp © 2024</span>
        </div>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        @keyframes logoPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
          50%       { box-shadow: 0 0 0 8px rgba(16,185,129,0); }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
