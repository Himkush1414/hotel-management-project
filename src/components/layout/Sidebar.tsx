"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, CalendarCheck, BedDouble, Users,
  Receipt, TrendingDown, UserCog, ClipboardList,
  BarChart3, Bell, Settings, ChevronRight, Hotel,
  LogOut
} from "lucide-react"

const NAV = [
  {
    section: "MAIN",
    items: [
      { href: "/dashboard",    icon: LayoutDashboard, label: "Dashboard" },
      { href: "/bookings",     icon: CalendarCheck,   label: "Bookings" },
      { href: "/rooms",        icon: BedDouble,       label: "Rooms" },
      { href: "/guests",       icon: Users,           label: "Guests" },
    ],
  },
  {
    section: "FINANCE",
    items: [
      { href: "/billing",      icon: Receipt,         label: "Billing" },
      { href: "/expenses",     icon: TrendingDown,    label: "Expenses" },
    ],
  },
  {
    section: "PEOPLE",
    items: [
      { href: "/staff",        icon: UserCog,         label: "Staff" },
      { href: "/attendance",   icon: ClipboardList,   label: "Attendance" },
    ],
  },
  {
    section: "SYSTEM",
    items: [
      { href: "/analytics",    icon: BarChart3,       label: "Analytics" },
      { href: "/notifications",icon: Bell,            label: "Notifications" },
      { href: "/settings",     icon: Settings,        label: "Settings" },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [hovered, setHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const expanded = isMobile ? mobileOpen : hovered

  if (isMobile) {
    return (
      <>
        {/* Mobile bottom nav */}
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          height: "60px", background: "#0d0d14",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", justifyContent: "space-around",
          zIndex: 100, paddingBottom: "env(safe-area-inset-bottom)",
        }}>
          {[NAV[0].items[0], NAV[0].items[1], NAV[0].items[2], NAV[0].items[3], NAV[2].items[0]].map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: "3px", padding: "8px 12px", borderRadius: "10px",
                color: active ? "var(--accent-light)" : "var(--text-muted)",
                textDecoration: "none", transition: "color 150ms ease",
                minWidth: "44px", minHeight: "44px", justifyContent: "center",
              }}>
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.3px" }}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
        {/* Mobile content spacer */}
        <div style={{ height: "60px" }} />
      </>
    )
  }

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "fixed", top: 0, left: 0, height: "100vh",
        width: expanded ? "var(--sidebar-expanded)" : "var(--sidebar-collapsed)",
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
          flexShrink: 0,
        }}>
          <Hotel size={17} color="#fff" strokeWidth={2.5} />
        </div>
        <div style={{
          overflow: "hidden", opacity: expanded ? 1 : 0,
          transition: "opacity 150ms ease", whiteSpace: "nowrap",
        }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
            HotelOS
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 500, letterSpacing: "0.3px" }}>
            Management System
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "12px 8px" }}>
        {NAV.map((group) => (
          <div key={group.section} style={{ marginBottom: "4px" }}>
            {/* Section label */}
            <div style={{
              fontSize: "9px", fontWeight: 700, color: "var(--text-muted)",
              letterSpacing: "0.8px", textTransform: "uppercase",
              padding: "10px 10px 4px",
              opacity: expanded ? 1 : 0,
              transition: "opacity 120ms ease",
              whiteSpace: "nowrap", overflow: "hidden",
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
                    position: "relative",
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
                  <Icon
                    size={18}
                    strokeWidth={active ? 2.5 : 1.8}
                    style={{ flexShrink: 0, marginLeft: active ? "0px" : "0px" }}
                  />
                  <span style={{
                    fontSize: "13px", fontWeight: active ? 600 : 500,
                    opacity: expanded ? 1 : 0,
                    transition: "opacity 120ms ease",
                    overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom user area */}
      <div style={{
        padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "9px 10px", borderRadius: "10px",
          overflow: "hidden", cursor: "default",
        }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, fontSize: "12px", fontWeight: 700, color: "#fff",
          }}>
            A
          </div>
          <div style={{
            overflow: "hidden", opacity: expanded ? 1 : 0,
            transition: "opacity 120ms ease", whiteSpace: "nowrap", flex: 1,
          }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
              Admin
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              admin@hotel.com
            </div>
          </div>
          {expanded && (
            <LogOut
              size={15}
              style={{ flexShrink: 0, color: "var(--text-muted)", cursor: "pointer" }}
            />
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
