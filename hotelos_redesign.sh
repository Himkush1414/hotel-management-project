#!/bin/bash
# HotelOS Complete Redesign — Single Script
# Copy this ENTIRE file, save as hotelos_redesign.sh in your project, then: bash hotelos_redesign.sh

set -e
cd ~/Downloads/hotel-management-project
echo "🚀 Starting HotelOS redesign..."

# ════════════════════════════════════════════
# 1. FLOATING SIDEBAR
# ════════════════════════════════════════════
mkdir -p src/components/layout

cat > src/components/layout/Sidebar.tsx << 'TSEOF'
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
TSEOF

echo "✅ Sidebar.tsx written"

# ════════════════════════════════════════════
# 2. FIND AND UPDATE ADMIN LAYOUT
# ════════════════════════════════════════════
python3 << 'PYEOF'
import os, glob

# Find the layout with Sidebar usage
candidates = []
for root, dirs, files in os.walk('src'):
    for f in files:
        if f == 'layout.tsx':
            p = os.path.join(root, f)
            try:
                txt = open(p).read()
                if 'sidebar' in txt.lower() or 'Sidebar' in txt:
                    candidates.append(p)
            except:
                pass

if not candidates:
    # Check all layouts and pick the admin one
    for root, dirs, files in os.walk('src'):
        for f in files:
            if f == 'layout.tsx':
                candidates.append(os.path.join(root, f))

target = None
for c in candidates:
    if '(admin)' in c or 'admin' in c.lower():
        target = c
        break
if not target and candidates:
    # pick deepest (most specific) layout
    target = max(candidates, key=lambda x: x.count('/'))

if not target:
    os.makedirs('src/app/(admin)', exist_ok=True)
    target = 'src/app/(admin)/layout.tsx'

print(f"Updating layout: {target}")

new_layout = '''import { Sidebar } from "@/components/layout/Sidebar"
import { Toaster } from "sonner"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#0a0a0f" }}>
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0, paddingLeft: 88 }}>
        <div style={{ minHeight: "100vh", padding: "28px 32px" }}>
          {children}
        </div>
      </main>
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "rgba(20,20,30,0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#e8e8f0",
            borderRadius: 12,
          },
        }}
      />
    </div>
  )
}
'''

with open(target, 'w') as f:
    f.write(new_layout)
print(f"✅ Layout updated: {target}")
PYEOF

# ════════════════════════════════════════════
# 3. GLOBAL CSS
# ════════════════════════════════════════════
python3 << 'PYEOF'
import os

target = None
for p in ['src/app/globals.css', 'src/styles/globals.css', 'src/app/global.css']:
    if os.path.exists(p):
        target = p
        break
if not target:
    target = 'src/app/globals.css'

new_css = '''@import url("https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Mono:wght@400;500&display=swap");

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-base:        #0a0a0f;
  --bg-surface:     rgba(255,255,255,0.04);
  --bg-elevated:    rgba(255,255,255,0.07);
  --border:         rgba(255,255,255,0.08);
  --border-hover:   rgba(255,255,255,0.14);
  --accent:         #6c5ce7;
  --accent-light:   #a29bfe;
  --text-primary:   #e8e8f0;
  --text-secondary: rgba(232,232,240,0.55);
  --text-muted:     rgba(232,232,240,0.3);
  --green:          #00b894;
  --blue:           #74b9ff;
  --amber:          #fdcb6e;
  --red:            #e17055;
  --purple:         #a29bfe;
  --radius-sm:      8px;
  --radius-md:      12px;
  --radius-lg:      18px;
}

*, *::before, *::after { box-sizing: border-box; }

html, body {
  height: 100%;
  font-family: "DM Sans", system-ui, -apple-system, sans-serif;
  font-size: 15px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: var(--bg-base);
  color: var(--text-primary);
}

::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
::selection { background: rgba(108,92,231,0.35); }

*:focus-visible {
  outline: 2px solid var(--accent-light);
  outline-offset: 2px;
  border-radius: 4px;
}

h1,h2,h3,h4,h5,h6 {
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  line-height: 1.25;
}

code, pre, kbd {
  font-family: "DM Mono", "Fira Code", monospace;
}

/* ── Cards ─────────────────────────────── */
.card-surface {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  transition: border-color 0.2s;
}
.card-surface:hover { border-color: var(--border-hover); }

/* ── Status pills ──────────────────────── */
.pill { display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;letter-spacing:0.3px;padding:3px 9px;border-radius:99px;white-space:nowrap; }
.pill-green  { background:rgba(0,184,148,0.15);   color:#00b894; }
.pill-blue   { background:rgba(116,185,255,0.15); color:#74b9ff; }
.pill-amber  { background:rgba(253,203,110,0.15); color:#fdcb6e; }
.pill-red    { background:rgba(225,112,85,0.15);  color:#e17055; }
.pill-purple { background:rgba(162,155,254,0.15); color:#a29bfe; }
.pill-gray   { background:rgba(255,255,255,0.07); color:rgba(255,255,255,0.45); }

/* ── Data table ────────────────────────── */
.data-table { width:100%; border-collapse:collapse; }
.data-table th {
  text-align:left;font-size:10px;font-weight:600;
  letter-spacing:0.8px;text-transform:uppercase;
  color:var(--text-muted);padding:0 14px 10px;white-space:nowrap;
}
.data-table td {
  padding:12px 14px;font-size:13px;
  color:var(--text-secondary);
  border-top:1px solid rgba(255,255,255,0.05);
}
.data-table tbody tr { transition:background 0.1s; }
.data-table tbody tr:hover td { background:rgba(255,255,255,0.02); }

/* ── Inputs ────────────────────────────── */
input:not([type=checkbox]):not([type=radio]),
select, textarea {
  background: rgba(255,255,255,0.05) !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
  border-radius: 10px !important;
  color: var(--text-primary) !important;
  font-family: inherit !important;
  transition: border-color 0.15s !important;
}
input:not([type=checkbox]):not([type=radio]):focus,
select:focus, textarea:focus {
  border-color: var(--accent-light) !important;
  outline: none !important;
  box-shadow: 0 0 0 3px rgba(108,92,231,0.12) !important;
}
input::placeholder, textarea::placeholder {
  color: var(--text-muted) !important;
}

/* ── Empty state ───────────────────────── */
.empty-state {
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:48px 24px;color:var(--text-muted);font-size:13px;text-align:center;gap:8px;
}

/* ── Skeleton ──────────────────────────── */
@keyframes shimmer {
  0%   { background-position:-400px 0; }
  100% { background-position:400px 0; }
}
.skeleton {
  border-radius:8px;
  background:linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.07) 50%,rgba(255,255,255,0.04) 75%);
  background-size:400px 100%;
  animation:shimmer 1.5s infinite;
}

/* ── Page ──────────────────────────────── */
.page-header { margin-bottom:28px; }
.page-title  { font-size:22px;font-weight:600;letter-spacing:-0.5px; }
.page-sub    { font-size:13px;color:var(--text-muted);margin-top:3px; }

a { text-decoration:none; }
button { cursor:pointer; }
'''

with open(target, 'w') as f:
    f.write(new_css)
print(f"✅ globals.css written: {target}")
PYEOF

# ════════════════════════════════════════════
# 4. DASHBOARD PAGE (server) + CLIENT
# ════════════════════════════════════════════
python3 << 'PYEOF'
import os

# Find dashboard dir
dash_dirs = [
    'src/app/(admin)/dashboard',
    'src/app/dashboard',
]
dash_dir = None
for d in dash_dirs:
    if os.path.exists(d):
        dash_dir = d
        break
if not dash_dir:
    dash_dir = 'src/app/(admin)/dashboard'
    os.makedirs(dash_dir, exist_ok=True)

page_path   = os.path.join(dash_dir, 'page.tsx')
client_path = os.path.join(dash_dir, 'DashboardClient.tsx')

server_page = '''\
import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "./DashboardClient"

export default async function DashboardPage() {
  const supabase = await createClient()
  const hotelId = process.env.NEXT_PUBLIC_HOTEL_ID!
  const today = new Date().toISOString().split("T")[0]

  const [
    { data: todayBookings },
    { data: rooms },
    { data: recentCheckins },
    { data: invoicesToday },
    { data: notifications },
  ] = await Promise.all([
    supabase.from("bookings").select("id,status,check_in_date,check_out_date")
      .eq("hotel_id", hotelId)
      .or(`check_in_date.eq.${today},check_out_date.eq.${today}`),
    supabase.from("rooms").select("id,room_number,status,room_type_id:room_type_ids(name,base_price)")
      .eq("hotel_id", hotelId),
    supabase.from("bookings").select(`
        id,booking_number,status,check_in_date,check_out_date,
        guest:guests(full_name,phone),
        room:rooms(room_number)
      `).eq("hotel_id", hotelId)
      .in("status", ["checked_in","confirmed"])
      .order("created_at", { ascending: false }).limit(8),
    supabase.from("invoices").select("id,total_amount,payment_status")
      .eq("hotel_id", hotelId)
      .gte("created_at", today + "T00:00:00")
      .lte("created_at", today + "T23:59:59"),
    supabase.from("notifications").select("id,is_read")
      .eq("hotel_id", hotelId).eq("is_read", false),
  ])

  const todayRevenue = (invoicesToday || [])
    .filter((i: any) => i.payment_status === "paid")
    .reduce((s: number, i: any) => s + (i.total_amount || 0), 0)

  const occupiedCount  = (rooms || []).filter((r: any) => r.status === "occupied").length
  const totalRooms     = (rooms || []).length
  const checkinsToday  = (todayBookings || []).filter((b: any) => b.check_in_date === today).length
  const checkoutsToday = (todayBookings || []).filter((b: any) => b.check_out_date === today).length
  const unreadNotifs   = (notifications || []).length
  const occupancyRate  = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0

  return (
    <DashboardClient
      stats={{ todayRevenue, occupiedCount, totalRooms, checkinsToday, checkoutsToday, occupancyRate, unreadNotifs }}
      rooms={rooms || []}
      recentCheckins={recentCheckins || []}
    />
  )
}
'''

client_code = '''\
"use client"

import { useState } from "react"
import Link from "next/link"

interface Stats {
  todayRevenue: number
  occupiedCount: number
  totalRooms: number
  checkinsToday: number
  checkoutsToday: number
  occupancyRate: number
  unreadNotifs: number
}
interface Props {
  stats: Stats
  rooms: any[]
  recentCheckins: any[]
}

const ROOM_COLORS: Record<string, [string, string]> = {
  available:   ["rgba(0,184,148,0.18)",   "#00b894"],
  occupied:    ["rgba(108,92,231,0.28)",   "#a29bfe"],
  cleaning:    ["rgba(253,203,110,0.18)",  "#fdcb6e"],
  maintenance: ["rgba(225,112,85,0.18)",   "#e17055"],
  blocked:     ["rgba(255,255,255,0.07)",  "rgba(255,255,255,0.3)"],
}
const BOOKING_PILL: Record<string, string> = {
  checked_in:  "pill-green",
  confirmed:   "pill-blue",
  pending:     "pill-amber",
  checked_out: "pill-gray",
  cancelled:   "pill-red",
  no_show:     "pill-red",
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)
}

function OccupancyRing({ pct }: { pct: number }) {
  const r = 36, circ = 2 * Math.PI * r
  return (
    <svg width="90" height="90" viewBox="0 0 90 90" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7"/>
      <circle cx="45" cy="45" r={r} fill="none" stroke="#a29bfe" strokeWidth="7"
        strokeDasharray={`${circ * pct / 100} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }}/>
    </svg>
  )
}

export function DashboardClient({ stats, rooms, recentCheckins }: Props) {
  const [period, setPeriod] = useState<"daily"|"weekly"|"monthly">("daily")

  const xLabels: string[] = []
  const t = new Date()
  for (let i = 24; i >= 0; i -= 6) {
    const d = new Date(t); d.setDate(d.getDate() - i)
    xLabels.push(d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }))
  }

  const S: React.CSSProperties = { color: "var(--text-muted)" }

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:600, letterSpacing:-0.5, margin:0 }}>Dashboard</h1>
          <p style={{ fontSize:13, marginTop:3, ...S }}>
            {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
          </p>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          {stats.unreadNotifs > 0 && (
            <Link href="/notifications" style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, padding:"6px 12px", borderRadius:10, border:"1px solid rgba(225,112,85,0.3)", background:"rgba(225,112,85,0.08)", color:"#e17055" }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"#e17055", display:"inline-block" }}/>
              {stats.unreadNotifs} issues
            </Link>
          )}
          <Link href="/bookings" style={{ fontSize:12, padding:"7px 16px", borderRadius:10, background:"#6c5ce7", color:"#fff", fontWeight:500 }}>
            + New Booking
          </Link>
        </div>
      </div>

      {/* Bento grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(12,1fr)", gap:14 }}>

        {/* 4 stat cards */}
        {[
          { label:"Today's Revenue",  val: fmt(stats.todayRevenue), color:"#00b894", bg:"rgba(0,184,148,0.15)",   icon:"💰", sub: "No transactions yet" },
          { label:"Occupied Rooms",   val: `${stats.occupiedCount}`, color:"#74b9ff", bg:"rgba(116,185,255,0.15)", icon:"🛏", sub: `${stats.occupancyRate}% occupancy · ${stats.totalRooms} total` },
          { label:"Check-ins Today",  val: `${stats.checkinsToday}`, color:"#fdcb6e", bg:"rgba(253,203,110,0.15)", icon:"↘",  sub: stats.checkinsToday === 0 ? "No arrivals scheduled" : "Guests arriving" },
          { label:"Check-outs Today", val: `${stats.checkoutsToday}`, color:"#a29bfe", bg:"rgba(162,155,254,0.15)", icon:"↗", sub: stats.checkoutsToday === 0 ? "No departures scheduled" : "Guests departing" },
        ].map((s, i) => (
          <div key={i} className="card-surface" style={{ gridColumn:"span 3", padding:20, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", right:18, top:18, width:36, height:36, borderRadius:10, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>{s.icon}</div>
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.8px", textTransform:"uppercase", ...S, marginBottom:14 }}>{s.label}</div>
            <div style={{ fontSize:28, fontWeight:600, letterSpacing:-1, lineHeight:1, color:s.color }}>{s.val}</div>
            <div style={{ fontSize:11, marginTop:8, ...S }}>{s.sub}</div>
          </div>
        ))}

        {/* Occupancy ring */}
        <div className="card-surface" style={{ gridColumn:"span 2", padding:20, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.8px", textTransform:"uppercase", ...S, marginBottom:10 }}>Occupancy</div>
          <div style={{ position:"relative", width:90, height:90 }}>
            <OccupancyRing pct={stats.occupancyRate}/>
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:20, fontWeight:600, color:"#a29bfe", letterSpacing:-1 }}>{stats.occupancyRate}%</span>
              <span style={{ fontSize:9, letterSpacing:"0.5px", ...S }}>RATE</span>
            </div>
          </div>
          <div style={{ fontSize:11, marginTop:8, textAlign:"center", ...S }}>{stats.occupiedCount} of {stats.totalRooms} rooms</div>
        </div>

        {/* Quick actions */}
        <div className="card-surface" style={{ gridColumn:"span 4", padding:20 }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>Quick Actions</div>
          <div style={{ fontSize:11, marginBottom:16, ...S }}>Jump to common tasks</div>
          {[
            { href:"/guests",   icon:"🚪", label:"New Check-in",  sub:"Walk-in or reservation",  bg:"rgba(0,184,148,0.1)",   border:"rgba(0,184,148,0.2)" },
            { href:"/bookings", icon:"📋", label:"New Booking",   sub:"Reserve a room",           bg:"rgba(116,185,255,0.1)", border:"rgba(116,185,255,0.2)" },
            { href:"/billing",  icon:"🧾", label:"View Billing",  sub:"Invoices & payments",      bg:"rgba(253,203,110,0.1)", border:"rgba(253,203,110,0.2)" },
          ].map(a => (
            <Link key={a.href} href={a.href} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:12, background:a.bg, border:`1px solid ${a.border}`, marginBottom:8, transition:"all 0.15s" }}>
              <div style={{ width:32, height:32, borderRadius:8, background:"rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>{a.icon}</div>
              <div>
                <div style={{ fontSize:12, fontWeight:500, color:"var(--text-primary)" }}>{a.label}</div>
                <div style={{ fontSize:11, ...S }}>{a.sub}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Status alerts */}
        <div className="card-surface" style={{ gridColumn:"span 3", padding:20 }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>Status Alerts</div>
          <div style={{ fontSize:11, marginBottom:16, ...S }}>Items needing attention</div>
          {[
            { label:`${rooms.filter(r=>r.status==="cleaning").length} rooms need cleaning`, type: rooms.filter(r=>r.status==="cleaning").length>0?"amber":"gray" },
            { label:`${rooms.filter(r=>r.status==="maintenance").length} in maintenance`,   type: rooms.filter(r=>r.status==="maintenance").length>0?"red":"gray" },
            { label: stats.unreadNotifs>0?`${stats.unreadNotifs} unread notifications`:"Notifications clear", type: stats.unreadNotifs>0?"red":"green" },
            { label: stats.totalRooms===0?"Add rooms to get started":`${stats.totalRooms} rooms configured`, type: stats.totalRooms===0?"amber":"green" },
          ].map((a, i) => {
            const C = { amber:["rgba(253,203,110,0.08)","#fdcb6e"], red:["rgba(225,112,85,0.08)","#e17055"], green:["rgba(0,184,148,0.08)","#00b894"], gray:["rgba(255,255,255,0.04)","rgba(255,255,255,0.25)"] }[a.type]!
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:10, background:C[0], border:`1px solid ${C[1]}22`, marginBottom:7 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:C[1], flexShrink:0, display:"block" }}/>
                <span style={{ fontSize:12, color:C[1] }}>{a.label}</span>
              </div>
            )
          })}
        </div>

        {/* Occupancy chart */}
        <div className="card-surface" style={{ gridColumn:"span 8", padding:20 }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600 }}>Occupancy & Revenue</div>
              <div style={{ fontSize:11, marginTop:2, ...S }}>30-day trend · live data</div>
            </div>
            <div style={{ display:"flex", gap:4 }}>
              {(["daily","weekly","monthly"] as const).map(p => (
                <button key={p} onClick={()=>setPeriod(p)} style={{
                  fontSize:11, fontWeight:600, padding:"5px 12px", borderRadius:8, border:"none", cursor:"pointer", textTransform:"capitalize",
                  background: period===p?"rgba(108,92,231,0.25)":"transparent",
                  color: period===p?"#a29bfe":"rgba(255,255,255,0.35)",
                }}>{p}</button>
              ))}
            </div>
          </div>
          <div style={{ position:"relative", height:160 }}>
            <svg viewBox="0 0 700 160" preserveAspectRatio="none" style={{ width:"100%", height:"100%" }}>
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a29bfe" stopOpacity="0.1"/>
                  <stop offset="100%" stopColor="#a29bfe" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {[40,80,120].map(y=><line key={y} x1="0" y1={y} x2="700" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>)}
              <path d="M0,155 L700,155" stroke="#a29bfe" strokeWidth="2" opacity="0.35" strokeDasharray="6 3"/>
              <path d="M0,155 L700,155 L700,160 L0,160 Z" fill="url(#cg)"/>
              {xLabels.map((l,i)=><text key={i} x={i*175+4} y="154" fill="rgba(255,255,255,0.2)" fontSize="8" fontFamily="DM Mono,monospace">{l}</text>)}
            </svg>
          </div>
          <div style={{ display:"flex", gap:16, marginTop:10 }}>
            {[["#a29bfe","Occupancy %"],["#00b894","Revenue"]].map(([c,l])=>(
              <div key={l} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, ...S }}>
                <div style={{ width:18, height:2, background:c, borderRadius:2 }}/>
                {l}
              </div>
            ))}
          </div>
        </div>

        {/* Room map */}
        <div className="card-surface" style={{ gridColumn:"span 4", padding:20 }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>Room Map</div>
          <div style={{ fontSize:11, marginBottom:14, ...S }}>Live status · all floors</div>
          {rooms.length === 0 ? (
            <div className="empty-state" style={{ padding:"20px 0" }}>
              <span>No rooms added yet</span>
              <Link href="/rooms" style={{ fontSize:12, color:"#a29bfe", marginTop:4 }}>+ Add rooms →</Link>
            </div>
          ) : (
            <>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:6 }}>
                {rooms.slice(0,25).map((r: any) => {
                  const [bg, color] = ROOM_COLORS[r.status] || ROOM_COLORS.blocked
                  return (
                    <div key={r.id} title={`Room ${r.room_number} — ${r.status}`}
                      style={{ aspectRatio:"1", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:9, fontWeight:600, cursor:"pointer", background:bg, color, transition:"transform 0.15s" }}
                      onMouseEnter={e=>(e.currentTarget.style.transform="scale(1.1)")}
                      onMouseLeave={e=>(e.currentTarget.style.transform="scale(1)")}>
                      {r.room_number}
                    </div>
                  )
                })}
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginTop:12 }}>
                {[["#00b894","Available"],["#a29bfe","Occupied"],["#fdcb6e","Cleaning"],["#e17055","Maint."]].map(([c,l])=>(
                  <div key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:10, ...S }}>
                    <div style={{ width:6, height:6, borderRadius:3, background:c }}/>
                    {l}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Recent checkins */}
        <div className="card-surface" style={{ gridColumn:"span 12", padding:20 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600 }}>Recent Check-ins</div>
              <div style={{ fontSize:11, marginTop:2, ...S }}>Current & upcoming stays</div>
            </div>
            <Link href="/bookings" style={{ fontSize:12, color:"#a29bfe" }}>View all →</Link>
          </div>
          {recentCheckins.length === 0 ? (
            <div className="empty-state">
              <span>No active bookings — start by adding a guest</span>
              <Link href="/guests" style={{ fontSize:12, color:"#a29bfe", marginTop:4 }}>+ Add guest & check in →</Link>
            </div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Guest</th><th>Booking #</th><th>Room</th><th>Check-in</th><th>Check-out</th><th>Status</th></tr></thead>
              <tbody>
                {recentCheckins.map((b: any) => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ fontWeight:500, color:"var(--text-primary)", fontSize:13 }}>{b.guest?.full_name || "—"}</div>
                      <div style={{ fontSize:11, ...S }}>{b.guest?.phone || ""}</div>
                    </td>
                    <td><span style={{ fontFamily:"DM Mono,monospace", fontSize:12, background:"rgba(255,255,255,0.06)", padding:"2px 8px", borderRadius:6, color:"var(--text-secondary)" }}>{b.booking_number}</span></td>
                    <td><span style={{ fontFamily:"DM Mono,monospace", fontSize:12, background:"rgba(108,92,231,0.12)", padding:"2px 8px", borderRadius:6, color:"#a29bfe" }}>{b.room?.room_number || "—"}</span></td>
                    <td style={{ fontSize:12 }}>{new Date(b.check_in_date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</td>
                    <td style={{ fontSize:12 }}>{new Date(b.check_out_date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</td>
                    <td><span className={`pill ${BOOKING_PILL[b.status]||"pill-gray"}`}>{b.status.replace("_"," ")}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  )
}
'''

with open(page_path, 'w') as f:
    f.write(server_page)
print(f"✅ Dashboard page.tsx written: {page_path}")

with open(client_path, 'w') as f:
    f.write(client_code)
print(f"✅ DashboardClient.tsx written: {client_path}")
PYEOF

# ════════════════════════════════════════════
# 5. TYPESCRIPT CHECK
# ════════════════════════════════════════════
echo ""
echo "════════════════════════════════════════"
echo "  TypeScript check..."
echo "════════════════════════════════════════"
pnpm tsc --noEmit 2>&1 | grep "error TS" | sed 's/.*error TS/TS/' | sort | uniq -c | sort -rn | head -20
TOTAL=$(pnpm tsc --noEmit 2>&1 | grep "error TS" | wc -l | tr -d ' ')
echo ""
echo "Total TS errors: $TOTAL"
if [ "$TOTAL" = "0" ]; then echo "✅ Zero errors — all good!"; fi

echo ""
echo "════════════════════════════════════════"
echo "  ✅ Redesign complete!"
echo "  Now run: pnpm run dev"
echo "  Then open: http://localhost:3000/dashboard"
echo "════════════════════════════════════════"
