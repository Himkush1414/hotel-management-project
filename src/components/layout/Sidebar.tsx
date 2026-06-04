"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, CalendarCheck, BedDouble, Users,
  Receipt, TrendingDown, UserCog, ClipboardList,
  BarChart3, Bell, Settings, Hotel, LogOut, Menu, X
} from "lucide-react"

const NAV = [
  {
    section: "MAIN",
    items: [
      { href: "/dashboard",     icon: LayoutDashboard, label: "Dashboard"     },
      { href: "/bookings",      icon: CalendarCheck,   label: "Bookings"      },
      { href: "/rooms",         icon: BedDouble,       label: "Rooms"         },
      { href: "/guests",        icon: Users,           label: "Guests"        },
    ],
  },
  {
    section: "FINANCE",
    items: [
      { href: "/billing",       icon: Receipt,         label: "Billing"       },
      { href: "/expenses",      icon: TrendingDown,    label: "Expenses"      },
    ],
  },
  {
    section: "PEOPLE",
    items: [
      { href: "/staff",         icon: UserCog,         label: "Staff"         },
      { href: "/attendance",    icon: ClipboardList,   label: "Attendance"    },
    ],
  },
  {
    section: "SYSTEM",
    items: [
      { href: "/analytics",     icon: BarChart3,       label: "Analytics"     },
      { href: "/notifications", icon: Bell,            label: "Notifications" },
      { href: "/settings",      icon: Settings,        label: "Settings"      },
    ],
  },
]

const ALL_NAV_ITEMS = NAV.flatMap(g => g.items)

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

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  if (!mounted) return null

  // ── MOBILE ──────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        {/* Full screen menu overlay */}
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

        {/* Slide-up menu panel */}
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
            {/* Handle */}
            <div style={{
              width: "36px", height: "4px", borderRadius: "99px",
              background: "rgba(255,255,255,0.2)",
              margin: "0 auto 16px",
            }} />

            {/* Hotel branding */}
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 12px", marginBottom: "8px",
              background: "rgba(108,92,231,0.1)", borderRadius: "12px",
              border: "1px solid rgba(108,92,231,0.2)",
            }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "9px",
                background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Hotel size={16} color="#fff" strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>HotelOS</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Management System</div>
              </div>
            </div>

            {/* All nav sections */}
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
                    const Icon = item.icon
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
                        <Icon size={17} strokeWidth={active ? 2.5 : 1.8} style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: "13px", fontWeight: active ? 600 : 500 }}>
                          {item.label}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Admin row */}
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
              <LogOut size={16} style={{ color: "var(--text-muted)" }} />
            </div>

            <div style={{ height: "8px" }} />
          </div>
        )}

        {/* Bottom navigation bar */}
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          height: "60px",
          background: "#0d0d14",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center",
          zIndex: 200,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}>
          {/* Show first 4 most used + More button */}
          {ALL_NAV_ITEMS.slice(0, 4).map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon
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
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span style={{ fontSize: "9px", fontWeight: active ? 700 : 500, letterSpacing: "0.2px" }}>
                  {item.label}
                </span>
              </Link>
            )
          })}

          {/* More button */}
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
            {menuOpen ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={1.8} />}
            <span style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.2px" }}>
              {menuOpen ? "Close" : "More"}
            </span>
          </button>
        </nav>

        <style>{`
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </>
    )
  }

  // ── DESKTOP sidebar ─────────────────────────────────────────────
  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "fixed", top: 0, left: 0, height: "100vh",
        width: hovered ? "var(--sidebar-expanded)" : "var(--sidebar-collapsed)",
        background: "#0d0d14",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        zIndex: 100, display: "flex", flexDirection: "column",
        transition: "width var(--transition-slow)",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div style={{
        height: "56px", display: "flex", alignItems: "center",
        padding: "0 16px", borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0, gap: "10px", overflow: "hidden",
      }}>
        <div style={{
          width: "32px", height: "32px", borderRadius: "9px",
          background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, boxShadow: "0 2px 8px rgba(108,92,231,0.4)",
        }}>
          <Hotel size={17} color="#fff" strokeWidth={2.5} />
        </div>
        <div style={{
          overflow: "hidden", opacity: hovered ? 1 : 0,
          transition: "opacity 150ms ease", whiteSpace: "nowrap",
        }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>HotelOS</div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 500 }}>Management System</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "12px 8px" }}>
        {NAV.map((group) => (
          <div key={group.section} style={{ marginBottom: "4px" }}>
            <div style={{
              fontSize: "9px", fontWeight: 700, color: "var(--text-muted)",
              letterSpacing: "0.8px", textTransform: "uppercase",
              padding: "10px 10px 4px",
              opacity: hovered ? 1 : 0, transition: "opacity 120ms ease",
              whiteSpace: "nowrap",
            }}>
              {group.section}
            </div>
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/")
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "9px 10px", borderRadius: "10px",
                    marginBottom: "2px", textDecoration: "none",
                    color: active ? "var(--accent-light)" : "var(--text-secondary)",
                    background: active ? "rgba(108,92,231,0.12)" : "transparent",
                    borderLeft: active ? "3px solid var(--accent)" : "3px solid transparent",
                    transition: "all 150ms ease",
                    whiteSpace: "nowrap", overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)"
                      e.currentTarget.style.color = "var(--text-primary)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent"
                      e.currentTarget.style.color = "var(--text-secondary)"
                    }
                  }}
                >
                  <Icon size={18} strokeWidth={active ? 2.5 : 1.8} style={{ flexShrink: 0 }} />
                  <span style={{
                    fontSize: "13px", fontWeight: active ? 600 : 500,
                    opacity: hovered ? 1 : 0, transition: "opacity 120ms ease",
                  }}>
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 10px", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, fontSize: "12px", fontWeight: 700, color: "#fff",
          }}>A</div>
          <div style={{ overflow: "hidden", opacity: hovered ? 1 : 0, transition: "opacity 120ms ease", whiteSpace: "nowrap", flex: 1 }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>Admin</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>admin@hotel.com</div>
          </div>
          {hovered && <LogOut size={15} style={{ flexShrink: 0, color: "var(--text-muted)", cursor: "pointer" }} />}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
