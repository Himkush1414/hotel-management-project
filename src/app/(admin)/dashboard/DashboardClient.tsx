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
            <Link key={a.href} href={a.href} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:12, background:a.bg, border:"1px solid "+a.border, marginBottom:8, transition:"all 0.15s" }}>
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
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:10, background:C[0], border:"1px solid "+C[1]+"22", marginBottom:7 }}>
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
                    <div key={r.id} title={"Room "+r.room_number+" — ${r.status}"}
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
                    <td><span className={"pill "+BOOKING_PILL[b.status]||"pill-gray"}>{b.status.replace("_"," ")}</span></td>
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
