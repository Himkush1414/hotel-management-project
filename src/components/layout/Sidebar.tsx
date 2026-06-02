"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV = [
  {
    section: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: "grid" }],
  },
  {
    section: "Operations",
    items: [
      { href: "/rooms",     label: "Rooms",     icon: "rooms" },
      { href: "/bookings",  label: "Bookings",  icon: "calendar" },
      { href: "/guests",    label: "Guests",    icon: "user" },
      { href: "/billing",   label: "Billing",   icon: "receipt" },
    ],
  },
  {
    section: "Staff",
    items: [
      { href: "/staff",      label: "Staff",      icon: "team" },
      { href: "/attendance", label: "Attendance", icon: "clock" },
      { href: "/expenses",   label: "Expenses",   icon: "dollar" },
    ],
  },
  {
    section: "System",
    items: [
      { href: "/notifications", label: "Notifications", icon: "bell", badge: true },
      { href: "/settings",      label: "Settings",      icon: "settings" },
    ],
  },
]

const Icon = ({ name }: { name: string }) => {
  const icons: Record<string, React.ReactNode> = {
    grid: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px] shrink-0"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
    rooms: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px] shrink-0"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    calendar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px] shrink-0"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px] shrink-0"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    receipt: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px] shrink-0"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    team: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px] shrink-0"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px] shrink-0"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    dollar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px] shrink-0"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
    bell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px] shrink-0"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px] shrink-0"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
    logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px] shrink-0"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  }
  return <>{icons[name] ?? null}</>
}

export function Sidebar() {
  const pathname = usePathname()
  const [hovered, setHovered] = useState(false)
  const notifCount = 4

  return (
    <nav
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "fixed",
        left: 16,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        borderRadius: 20,
        padding: "12px 8px",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(14,14,22,0.92)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 24px 48px rgba(0,0,0,0.5)",
        width: hovered ? 200 : 56,
        overflow: "hidden",
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: 4 }}>
        <div style={{ width: 32, height: 32, minWidth: 32, borderRadius: 10, background: "linear-gradient(135deg,#6c5ce7,#a29bfe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>H</div>
        <div style={{ overflow: "hidden", opacity: hovered ? 1 : 0, transition: "opacity 0.2s", width: hovered ? "auto" : 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#e8e8f0", whiteSpace: "nowrap" }}>HotelOS</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>Management System</div>
        </div>
      </div>

      {/* Nav */}
      {NAV.map((section) => (
        <div key={section.section}>
          <div style={{
            fontSize: 9, fontWeight: 600, letterSpacing: "1.2px", textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)", padding: "8px 10px 4px",
            whiteSpace: "nowrap", overflow: "hidden",
            opacity: hovered ? 1 : 0, height: hovered ? "auto" : 0,
            transition: "opacity 0.15s",
          }}>
            {section.section}
          </div>
          {section.items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link key={item.href} href={item.href} style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 10px",
                borderRadius: 12,
                textDecoration: "none",
                color: isActive ? "#a29bfe" : "rgba(255,255,255,0.5)",
                background: isActive ? "rgba(108,92,231,0.22)" : "transparent",
                transition: "all 0.15s",
                justifyContent: hovered ? "flex-start" : "center",
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(108,92,231,0.12)" }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent" }}
              >
                <Icon name={item.icon} />
                <span style={{
                  fontSize: 13, fontWeight: 500, whiteSpace: "nowrap",
                  overflow: "hidden", opacity: hovered ? 1 : 0,
                  maxWidth: hovered ? 120 : 0, transition: "all 0.15s",
                }}>
                  {item.label}
                </span>
                {item.badge && notifCount > 0 && (
                  <span style={{
                    position: hovered ? "relative" : "absolute",
                    top: hovered ? undefined : 4,
                    right: hovered ? undefined : 4,
                    marginLeft: hovered ? "auto" : undefined,
                    width: hovered ? 18 : 14,
                    height: hovered ? 18 : 14,
                    minWidth: hovered ? 18 : 14,
                    borderRadius: "50%",
                    background: "#e17055",
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {notifCount}
                  </span>
                )}
              </Link>
            )
          })}
          <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "6px 0" }} />
        </div>
      ))}

      {/* User */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 10px", overflow: "hidden" }}>
        <div style={{ width: 28, height: 28, minWidth: 28, borderRadius: 8, background: "linear-gradient(135deg,#6c5ce7,#a29bfe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>AU</div>
        <div style={{ overflow: "hidden", opacity: hovered ? 1 : 0, transition: "opacity 0.2s", flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#e8e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Admin User</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>admin@hotel.com</div>
        </div>
      </div>
    </nav>
  )
}
