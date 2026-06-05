"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

// ─── Custom SVG Icons ──────────────────────────────────────────────────────────
// Every icon is a hand-crafted SVG path. No icon library needed.

const IconDashboard = ({ active }: { active: boolean }) => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="1.5" width="6" height="6" rx="1.8"
      stroke="currentColor" strokeWidth={active ? 1.9 : 1.6} strokeLinecap="round" />
    <rect x="9.5" y="1.5" width="6" height="6" rx="1.8"
      stroke="currentColor" strokeWidth={active ? 1.9 : 1.6} strokeLinecap="round" />
    <rect x="1.5" y="9.5" width="6" height="6" rx="1.8"
      stroke="currentColor" strokeWidth={active ? 1.9 : 1.6} strokeLinecap="round" />
    <rect x="9.5" y="9.5" width="6" height="6" rx="1.8"
      stroke="currentColor" strokeWidth={active ? 1.9 : 1.6} strokeLinecap="round"
      fill={active ? "rgba(162,155,254,0.18)" : "none"} />
  </svg>
)

const IconBookings = ({ active }: { active: boolean }) => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="3.5" width="14" height="12" rx="2"
      stroke="currentColor" strokeWidth={active ? 1.9 : 1.6} />
    <path d="M5 2v3M12 2v3" stroke="currentColor" strokeWidth={active ? 1.9 : 1.6}
      strokeLinecap="round" />
    <path d="M1.5 7.5h14" stroke="currentColor" strokeWidth={active ? 1.9 : 1.6}
      strokeLinecap="round" />
    <path d="M5 11h2M10 11h2M5 13.5h2" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" />
  </svg>
)

const IconRooms = ({ active }: { active: boolean }) => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="1.5" width="14" height="14" rx="2"
      stroke="currentColor" strokeWidth={active ? 1.9 : 1.6} />
    <path d="M1.5 9.5h14" stroke="currentColor" strokeWidth={active ? 1.9 : 1.6}
      strokeLinecap="round" />
    <path d="M6.5 9.5v6" stroke="currentColor" strokeWidth={active ? 1.9 : 1.6}
      strokeLinecap="round" />
    <circle cx="10.5" cy="5.8" r="1.2" fill="currentColor" />
  </svg>
)

const IconGuests = ({ active }: { active: boolean }) => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8.5" cy="5.5" r="3" stroke="currentColor" strokeWidth={active ? 1.9 : 1.6} />
    <path d="M2 15.5c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5"
      stroke="currentColor" strokeWidth={active ? 1.9 : 1.6} strokeLinecap="round" />
  </svg>
)

const IconBilling = ({ active }: { active: boolean }) => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="3.5" width="14" height="10" rx="2"
      stroke="currentColor" strokeWidth={active ? 1.9 : 1.6} />
    <path d="M1.5 7.5h14" stroke="currentColor" strokeWidth={active ? 1.9 : 1.6}
      strokeLinecap="round" />
    <path d="M4.5 11.5h3M9.5 11.5h3" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" />
  </svg>
)

const IconExpenses = ({ active }: { active: boolean }) => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.5 1.5v14" stroke="currentColor" strokeWidth={active ? 1.9 : 1.6}
      strokeLinecap="round" />
    <path d="M5 5h4.8a2.7 2.7 0 010 5.4H5"
      stroke="currentColor" strokeWidth={active ? 1.9 : 1.6} strokeLinecap="round" />
    <path d="M4 5h1M4 10.4h1"
      stroke="currentColor" strokeWidth={active ? 1.9 : 1.6} strokeLinecap="round" />
  </svg>
)

const IconStaff = ({ active }: { active: boolean }) => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="5.5" r="2.5" stroke="currentColor" strokeWidth={active ? 1.9 : 1.6} />
    <circle cx="11.5" cy="5.5" r="2" stroke="currentColor" strokeWidth={active ? 1.7 : 1.4} />
    <path d="M1 15c0-2.76 2.24-5 5-5s5 2.24 5 5"
      stroke="currentColor" strokeWidth={active ? 1.9 : 1.6} strokeLinecap="round" />
    <path d="M13 11.5c1.66.7 2.8 2.33 2.8 4.2"
      stroke="currentColor" strokeWidth={active ? 1.7 : 1.4} strokeLinecap="round" />
  </svg>
)

const IconAttendance = ({ active }: { active: boolean }) => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="3.5" width="14" height="12" rx="2"
      stroke="currentColor" strokeWidth={active ? 1.9 : 1.6} />
    <path d="M5 2v3M12 2v3" stroke="currentColor" strokeWidth={active ? 1.9 : 1.6}
      strokeLinecap="round" />
    <path d="M1.5 7.5h14" stroke="currentColor" strokeWidth={active ? 1.9 : 1.6}
      strokeLinecap="round" />
    <path d="M5 11.5l2 2 5-3.5" stroke="currentColor" strokeWidth={active ? 1.9 : 1.6}
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconAnalytics = ({ active }: { active: boolean }) => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 14.5l4-5 3 2.5 4-6 3 2"
      stroke="currentColor" strokeWidth={active ? 1.9 : 1.6}
      strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="2" cy="14.5" r="1.2" fill="currentColor" />
    <circle cx="6" cy="9.5" r="1.2" fill="currentColor" />
    <circle cx="9" cy="12" r="1.2" fill="currentColor" />
    <circle cx="13" cy="6" r="1.2" fill="currentColor" />
  </svg>
)

const IconBell = ({ active }: { active: boolean }) => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.5 1.5a5 5 0 015 5v3.5l1.5 2H2l1.5-2V6.5a5 5 0 015-5z"
      stroke="currentColor" strokeWidth={active ? 1.9 : 1.6}
      strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.5 14.5a2 2 0 004 0"
      stroke="currentColor" strokeWidth={active ? 1.9 : 1.6} strokeLinecap="round" />
  </svg>
)

const IconSettings = ({ active }: { active: boolean }) => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8.5" cy="8.5" r="2.5" stroke="currentColor" strokeWidth={active ? 1.9 : 1.6} />
    <path d="M8.5 1.5v1.5M8.5 14v1.5M1.5 8.5H3M14 8.5h1.5M3.4 3.4l1.1 1.1M12.5 12.5l1.1 1.1M3.4 13.6l1.1-1.1M12.5 4.5l1.1-1.1"
      stroke="currentColor" strokeWidth={active ? 1.9 : 1.6} strokeLinecap="round" />
  </svg>
)

const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 4.5L13.5 7.5L10 10.5" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.5 7.5H5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M5.5 2H3a1 1 0 00-1 1v9a1 1 0 001 1h2.5"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const IconLogo = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 1.5L16.5 5.5v7L9 16.5 1.5 12.5v-7L9 1.5z"
      stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M9 1.5v15" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
    <path d="M1.5 5.5l7.5 5 7.5-5" stroke="white" strokeWidth="1.4"
      strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
  </svg>
)

const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const IconClose = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

// ─── Nav Structure ─────────────────────────────────────────────────────────────

const NAV = [
  {
    section: "CORE",
    items: [
      { href: "/dashboard",     Icon: IconDashboard,  label: "Dashboard"     },
      { href: "/bookings",      Icon: IconBookings,   label: "Bookings",  badge: 12 },
      { href: "/rooms",         Icon: IconRooms,      label: "Rooms"         },
      { href: "/guests",        Icon: IconGuests,     label: "Guests"        },
    ],
  },
  {
    section: "FINANCE",
    items: [
      { href: "/billing",       Icon: IconBilling,    label: "Billing"       },
      { href: "/expenses",      Icon: IconExpenses,   label: "Expenses"      },
    ],
  },
  {
    section: "PEOPLE",
    items: [
      { href: "/staff",         Icon: IconStaff,      label: "Staff"         },
      { href: "/attendance",    Icon: IconAttendance, label: "Attendance"    },
    ],
  },
  {
    section: "INSIGHTS",
    items: [
      { href: "/analytics",     Icon: IconAnalytics,  label: "Analytics"     },
      { href: "/notifications", Icon: IconBell,       label: "Notifications", badge: 3 },
      { href: "/settings",      Icon: IconSettings,   label: "Settings"      },
    ],
  },
]

const ALL_NAV_ITEMS = NAV.flatMap(g => g.items)

// ─── Component ─────────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname()
  const [hovered, setHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  if (!mounted) return null

  // ── MOBILE (completely unchanged from original) ──────────────────────────────
  if (isMobile) {
    return (
      <>
        {menuOpen && (
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.7)",
              zIndex: 300,
              backdropFilter: "blur(4px)",
            }}
          />
        )}

        {menuOpen && (
          <div style={{
            position: "fixed", bottom: "60px", left: 0, right: 0,
            background: "#0d0d14",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px 20px 0 0",
            zIndex: 400,
            padding: "16px 16px 8px",
            maxHeight: "75vh",
            overflowY: "auto",
            animation: "slideUp 200ms ease",
          }}>
            <div style={{
              width: "36px", height: "4px", borderRadius: "99px",
              background: "rgba(255,255,255,0.2)",
              margin: "0 auto 16px",
            }} />

            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 12px", marginBottom: "8px",
              background: "rgba(108,92,231,0.1)", borderRadius: "12px",
              border: "1px solid rgba(108,92,231,0.2)",
            }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "9px",
                background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <IconLogo />
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>HotelOS</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Management System</div>
              </div>
            </div>

            {NAV.map((group) => (
              <div key={group.section} style={{ marginBottom: "8px" }}>
                <div style={{
                  fontSize: "9px", fontWeight: 700, color: "var(--text-muted)",
                  letterSpacing: "0.8px", textTransform: "uppercase",
                  padding: "8px 12px 4px",
                }}>
                  {group.section}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  {group.items.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(item.href + "/")
                    const { Icon } = item
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        style={{
                          display: "flex", alignItems: "center", gap: "10px",
                          padding: "11px 12px", borderRadius: "10px",
                          textDecoration: "none",
                          background: active ? "rgba(108,92,231,0.15)" : "rgba(255,255,255,0.04)",
                          border: "1px solid " + (active ? "rgba(108,92,231,0.3)" : "rgba(255,255,255,0.06)"),
                          color: active ? "var(--accent-light)" : "var(--text-secondary)",
                          transition: "all 150ms ease",
                          minHeight: "44px",
                        }}
                      >
                        <span style={{ flexShrink: 0 }}><Icon active={active} /></span>
                        <span style={{ fontSize: "13px", fontWeight: active ? 600 : 500 }}>
                          {item.label}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}

            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "12px", marginTop: "8px",
              background: "rgba(255,255,255,0.03)", borderRadius: "10px",
              border: "1px solid var(--border)",
            }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, fontSize: "13px", fontWeight: 700, color: "#fff",
              }}>A</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>Admin</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>admin@hotel.com</div>
              </div>
              <span style={{ color: "var(--text-muted)" }}><IconLogout /></span>
            </div>

            <div style={{ height: "8px" }} />
          </div>
        )}

        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          height: "60px",
          background: "#0d0d14",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center",
          zIndex: 200,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}>
          {ALL_NAV_ITEMS.slice(0, 4).map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/")
            const { Icon } = item
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: "3px", padding: "6px 4px",
                  color: active ? "var(--accent-light)" : "rgba(240,240,248,0.4)",
                  textDecoration: "none", transition: "color 150ms ease",
                  minHeight: "44px", position: "relative",
                }}
              >
                {active && (
                  <div style={{
                    position: "absolute", top: "4px", left: "50%",
                    transform: "translateX(-50%)",
                    width: "18px", height: "2px",
                    background: "var(--accent)", borderRadius: "99px",
                  }} />
                )}
                <Icon active={active} />
                <span style={{ fontSize: "9px", fontWeight: active ? 700 : 500, letterSpacing: "0.2px" }}>
                  {item.label}
                </span>
              </Link>
            )
          })}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: "3px", padding: "6px 4px",
              background: "none", border: "none",
              color: menuOpen ? "var(--accent-light)" : "rgba(240,240,248,0.4)",
              cursor: "pointer", minHeight: "44px",
              transition: "color 150ms ease",
            }}
          >
            {menuOpen ? <IconClose /> : <IconMenu />}
            <span style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.2px" }}>
              {menuOpen ? "Close" : "More"}
            </span>
          </button>
        </nav>

        <style>{`
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
        `}</style>
      </>
    )
  }

  // ── DESKTOP — Premium redesign ───────────────────────────────────────────────
  return (
    <>
      <style>{`
        .sidebar-nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 36px;
          padding: 0 10px;
          border-radius: 8px;
          margin-bottom: 1px;
          text-decoration: none;
          color: rgba(240,240,248,0.5);
          background: transparent;
          transition: color 150ms ease, background 150ms ease;
          position: relative;
          white-space: nowrap;
          overflow: hidden;
        }
        .sidebar-nav-link:hover {
          color: rgba(240,240,248,0.9);
          background: rgba(255,255,255,0.05);
        }
        .sidebar-nav-link.active {
          color: #a29bfe;
          background: rgba(108,92,231,0.12);
        }
        .sidebar-nav-link.active::before {
          content: "";
          position: absolute;
          left: 0;
          top: 7px;
          bottom: 7px;
          width: 2.5px;
          border-radius: 0 2px 2px 0;
          background: #a29bfe;
        }
        .sidebar-nav-link .icon-wrap {
          width: 30px;
          height: 30px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 150ms ease;
        }
        .sidebar-nav-link.active .icon-wrap {
          background: rgba(108,92,231,0.22);
        }
        .sidebar-nav-link .nav-label-text {
          font-size: 13px;
          font-weight: 500;
          transition: opacity 140ms ease, transform 140ms ease;
          letter-spacing: -0.1px;
        }
        .sidebar-nav-link.active .nav-label-text {
          font-weight: 600;
        }
        .sidebar-nav-link .nav-badge-pill {
          margin-left: auto;
          background: rgba(108,92,231,0.9);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          min-width: 18px;
          height: 17px;
          border-radius: 99px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 5px;
          flex-shrink: 0;
          letter-spacing: 0;
          box-shadow: 0 0 8px rgba(108,92,231,0.45);
          transition: opacity 140ms ease;
        }
        .sidebar-glow-ring {
          position: absolute;
          inset: 0;
          border-radius: 8px;
          background: radial-gradient(ellipse at 50% 0%, rgba(108,92,231,0.13) 0%, transparent 70%);
          pointer-events: none;
          opacity: 0;
          transition: opacity 200ms ease;
        }
        .sidebar-nav-link.active .sidebar-glow-ring {
          opacity: 1;
        }
        .group-divider {
          height: 1px;
          background: rgba(255,255,255,0.055);
          margin: 6px 10px;
        }
        .group-label {
          font-size: 9.5px;
          font-weight: 700;
          color: rgba(240,240,248,0.28);
          letter-spacing: 0.75px;
          text-transform: uppercase;
          padding: 10px 14px 3px;
          white-space: nowrap;
          overflow: hidden;
          transition: opacity 140ms ease;
        }
      `}</style>

      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: hovered ? "212px" : "58px",
          background: "rgba(11,11,18,0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(255,255,255,0.065)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          transition: "width 220ms cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
        }}
      >
        {/* ── Subtle top accent line ── */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "1px",
          background: "linear-gradient(90deg, transparent 0%, rgba(108,92,231,0.6) 50%, transparent 100%)",
        }} />

        {/* ── Logo ── */}
        <div style={{
          height: "56px",
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          borderBottom: "1px solid rgba(255,255,255,0.055)",
          flexShrink: 0,
          gap: "10px",
          overflow: "hidden",
        }}>
          <div style={{
            width: "30px",
            height: "30px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 0 16px rgba(108,92,231,0.45), 0 2px 6px rgba(0,0,0,0.4)",
          }}>
            <IconLogo />
          </div>
          <div style={{
            overflow: "hidden",
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateX(0)" : "translateX(-4px)",
            transition: "opacity 150ms ease, transform 150ms ease",
            whiteSpace: "nowrap",
          }}>
            <div style={{
              fontSize: "14.5px",
              fontWeight: 700,
              color: "#f0f0f8",
              letterSpacing: "-0.35px",
              lineHeight: 1.2,
            }}>
              HotelOS
            </div>
            <div style={{ fontSize: "10px", color: "rgba(240,240,248,0.35)", fontWeight: 500 }}>
              Management System
            </div>
          </div>
        </div>

        {/* ── Nav ── */}
        <nav style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "8px 8px",
          scrollbarWidth: "none",
        }}>
          {NAV.map((group, gi) => (
            <div key={group.section}>
              {gi > 0 && <div className="group-divider" />}

              <div
                className="group-label"
                style={{ opacity: hovered ? 1 : 0 }}
              >
                {group.section}
              </div>

              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/")
                const { Icon } = item
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={"sidebar-nav-link" + (active ? " active" : "")}
                  >
                    <div className="sidebar-glow-ring" />
                    <div className="icon-wrap">
                      <Icon active={active} />
                    </div>
                    <span
                      className="nav-label-text"
                      style={{
                        opacity: hovered ? 1 : 0,
                        transform: hovered ? "translateX(0)" : "translateX(-3px)",
                      }}
                    >
                      {item.label}
                    </span>
                    {item.badge !== undefined && (
                      <span
                        className="nav-badge-pill"
                        style={{ opacity: hovered ? 1 : 0 }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* ── User footer ── */}
        <div style={{
          padding: "10px 8px",
          borderTop: "1px solid rgba(255,255,255,0.055)",
          flexShrink: 0,
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "7px 10px",
            borderRadius: "8px",
            cursor: "pointer",
            overflow: "hidden",
            transition: "background 150ms ease",
          }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6c5ce7 0%, #e17055 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: "11px",
              fontWeight: 700,
              color: "#fff",
              boxShadow: "0 0 10px rgba(108,92,231,0.3)",
            }}>
              A
            </div>
            <div style={{
              overflow: "hidden",
              opacity: hovered ? 1 : 0,
              transform: hovered ? "translateX(0)" : "translateX(-4px)",
              transition: "opacity 150ms ease, transform 150ms ease",
              whiteSpace: "nowrap",
              flex: 1,
            }}>
              <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#f0f0f8" }}>Admin</div>
              <div style={{ fontSize: "10.5px", color: "rgba(240,240,248,0.35)" }}>admin@hotel.com</div>
            </div>
            <span style={{
              color: "rgba(240,240,248,0.3)",
              opacity: hovered ? 1 : 0,
              transition: "opacity 150ms ease",
              flexShrink: 0,
            }}>
              <IconLogout />
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
