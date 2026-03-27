"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { icon: "leaderboard",       label: "World Standings",    href: "/standings" },
  { icon: "online_prediction", label: "Scenario Predictor", href: "/simulate" },
  { icon: "map",               label: "Maps Overview",      href: "/maps" },
  { icon: "emoji_events",      label: "Title Watch",        href: "/title" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Hamburger — fixed, mobile only */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>menu</span>
      </button>

      {/* Backdrop — mobile only */}
      <div
        className={`sidebar-backdrop${mobileOpen ? " sidebar-backdrop--open" : ""}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />

      {/* Sidebar panel */}
      <aside className={`sidebar-panel${mobileOpen ? " sidebar-panel--open" : ""}`}>

        {/* Brand + close */}
        <div style={{
          padding: "20px 20px 18px",
          borderBottom: "1px solid rgba(224,7,0,0.07)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "24px", color: "var(--accent-red)" }}>
              sports_score
            </span>
            <span style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.015em", color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
              F1 Predictor
            </span>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
          </button>
        </div>

        {/* Nav */}
        <nav style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`sidebar-link${isActive ? " sidebar-link-active" : ""}`}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "9px 14px", borderRadius: "8px",
                  textDecoration: "none",
                  color: isActive ? "white" : "var(--text-muted)",
                  fontSize: "13px", fontWeight: isActive ? 600 : 400,
                  fontFamily: "var(--font-sans)",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
