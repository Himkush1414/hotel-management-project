"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts"

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

// ── Avatar ────────────────────────────────────────────────────────────────────
const avatarColors = [
  ["#6c5ce7","#a29bfe"],["#00b894","#55efc4"],["#74b9ff","#0984e3"],
  ["#fdcb6e","#e17055"],["#fd79a8","#e84393"],
]
function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return avatarColors[Math.abs(h) % avatarColors.length]
}
function Avatar({ name, size = 34 }: { name: string; size?: number }) {
  const [from, to] = avatarColor(name)
  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, " + from + ", " + to + ")",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36 + "px", fontWeight: 700, color: "#fff", flexShrink: 0,
    }}>{initials}</div>
  )
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: "var(--bg-elevated)", border: "1px solid var(--border-hover)",
      borderRadius: "10px", padding: "10px 14px", boxShadow: "var(--shadow-card)",
    }}>
      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontFamily: '"DM Mono",monospace', fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
        {fmt(payload[0].value)}
      </div>
    </div>
  )
}

// ── SVG Icons (no lucide dependency) ─────────────────────────────────────────
const IcoRefresh = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M11.5 2A6 6 0 106.5 1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
    <path d="M6.5 1L9 3.5M6.5 1L4 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoPlus = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)
const IcoRevenue = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M7.5 1v13M4.5 5h5a2.5 2.5 0 010 5H4.5M4 5H3M4 10H3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)
const IcoBed = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="1" y="1" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M1 8.5h13M6 8.5V14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <circle cx="10" cy="5" r="1.2" fill="currentColor"/>
  </svg>
)
const IcoCalendar = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="1" y="2.5" width="13" height="11" rx="1.8" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M4.5 1v3M10.5 1v3M1 7h13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M4.5 10.5h2M8.5 10.5h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const IcoClock = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M7.5 4v3.5l2.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoUserPlus = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="6" cy="5" r="2.8" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M1 13c0-2.76 2.24-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M11 8v5M8.5 10.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)
const IcoArrowRight = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ── Main Component ────────────────────────────────────────────────────────────
export default function DashboardClient() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [stats, setStats] = useState({ todayRevenue: 0, occupiedRooms: 0, totalRooms: 0, checkinsToday: 0, pendingBookings: 0 })
  const [recentCheckins, setRecentCheckins] = useState<any[]>([])
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setRefreshing(true)
    setLoading(true)
    try {
      const db = supabase as any
      const today = new Date().toISOString().split("T")[0]
      const [{ data: invoices }, { data: bookings }, { data: allRooms }, { data: recentB }] = await Promise.all([
        db.from("invoices").select("total_amount,status,created_at").gte("created_at", today),
        db.from("bookings").select("status,check_in_date"),
        db.from("rooms").select("id,room_number,status,room_type_id"),
        db.from("bookings").select("id,guest:guests(name),room:rooms(room_number),check_in_date,check_out_date,status,total_amount").eq("status","checked_in").order("check_in_date",{ascending:false}).limit(5),
      ])
      const todayRevenue = (invoices||[]).filter((i:any)=>i.status==="paid").reduce((s:number,i:any)=>s+(i.total_amount||0),0)
      setStats({
        todayRevenue,
        occupiedRooms: (allRooms||[]).filter((r:any)=>r.status==="occupied").length,
        totalRooms: (allRooms||[]).length,
        checkinsToday: (bookings||[]).filter((b:any)=>b.check_in_date===today).length,
        pendingBookings: (bookings||[]).filter((b:any)=>b.status==="pending").length,
      })
      setRooms(allRooms||[])
      setRecentCheckins(recentB||[])
      const days: any[] = []
      for (let i = 29; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate()-i)
        days.push({ date: d.toISOString().split("T")[0], label: d.toLocaleDateString("en-IN",{day:"numeric",month:"short"}) })
      }
      const { data: allInv } = await db.from("invoices").select("total_amount,status,created_at").gte("created_at",days[0].date)
      setRevenueData(days.map(d=>({
        label: d.label,
        revenue: (allInv||[]).filter((i:any)=>i.created_at?.startsWith(d.date)&&i.status==="paid").reduce((s:number,i:any)=>s+(i.total_amount||0),0),
      })))
    } catch(e){ console.error(e) }
    finally { setLoading(false); setRefreshing(false) }
  }

  const occupancyPct = stats.totalRooms > 0 ? Math.round((stats.occupiedRooms/stats.totalRooms)*100) : 0
  const statusCounts = rooms.reduce((acc:any,r:any)=>{ acc[r.status]=(acc[r.status]||0)+1; return acc },{})

  const p    = isMobile ? "12px" : "28px"
  const gap  = isMobile ? "10px" : "14px"
  const statCols = isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)"
  const row2Cols = isMobile ? "1fr" : "1fr 1fr"
  const row4Cols = isMobile ? "1fr" : "1fr 1.4fr"

  // ── Stat card data ──
  const statCards = [
    {
      label: "Today's Revenue",
      value: fmt(stats.todayRevenue),
      Icon: IcoRevenue,
      accent: "#00b894",
      bg: "rgba(0,184,148,0.1)",
      border: "rgba(0,184,148,0.22)",
    },
    {
      label: "Occupied Rooms",
      value: stats.occupiedRooms + "/" + stats.totalRooms,
      Icon: IcoBed,
      accent: "#a29bfe",
      bg: "rgba(162,155,254,0.1)",
      border: "rgba(162,155,254,0.22)",
    },
    {
      label: "Check-ins Today",
      value: String(stats.checkinsToday),
      Icon: IcoCalendar,
      accent: "#74b9ff",
      bg: "rgba(116,185,255,0.1)",
      border: "rgba(116,185,255,0.22)",
    },
    {
      label: "Pending",
      value: String(stats.pendingBookings),
      Icon: IcoClock,
      accent: "#fdcb6e",
      bg: "rgba(253,203,110,0.1)",
      border: "rgba(253,203,110,0.22)",
    },
  ]

  if (loading) return (
    <div style={{ padding: p, overflowX: "hidden", width: "100%", boxSizing: "border-box" }}>
      <div style={{ height: "56px", marginBottom: gap, background: "rgba(255,255,255,0.03)", borderRadius: "12px" }} className="skeleton" />
      <div style={{ display:"grid", gridTemplateColumns:statCols, gap, marginBottom:gap }}>
        {[1,2,3,4].map(i=><div key={i} className="skeleton" style={{height:"96px",borderRadius:"12px"}}/>)}
      </div>
      <div className="skeleton" style={{height:"220px",borderRadius:"12px",marginBottom:gap}}/>
      <div className="skeleton" style={{height:"260px",borderRadius:"12px"}}/>
    </div>
  )

  return (
    <div style={{ overflowX: "hidden", width: "100%", boxSizing: "border-box" }}>

      {/* ── Topbar ─────────────────────────────────────────────────────────── */}
      <div style={{
        position: "sticky", top: 0,
        height: "56px",
        background: "rgba(10,10,15,0.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.065)",
        zIndex: 50,
        display: "flex", alignItems: "center",
        padding: isMobile ? "0 14px" : "0 28px",
        gap: "10px",
        flexShrink: 0,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: isMobile ? "15px" : "16px",
            fontWeight: 600,
            color: "var(--text-primary)",
            letterSpacing: "-0.3px",
          }}>Dashboard</div>
          {!isMobile && (
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>
              {new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}
            </div>
          )}
        </div>

        {/* Actions */}
        <button
          onClick={fetchAll}
          style={{
            height: "32px",
            padding: "0 12px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            color: "rgba(240,240,248,0.6)",
            fontSize: "12px",
            fontWeight: 500,
            fontFamily: '"DM Sans",sans-serif',
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: "6px",
            transition: "all 150ms ease",
            opacity: refreshing ? 0.6 : 1,
          }}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.09)";e.currentTarget.style.color="rgba(240,240,248,0.9)"}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.color="rgba(240,240,248,0.6)"}}
        >
          <span style={{ display:"inline-flex", animation: refreshing ? "spin 600ms linear infinite" : "none" }}>
            <IcoRefresh />
          </span>
          {!isMobile && "Refresh"}
        </button>

        <a href="/bookings" style={{
          height: "32px",
          padding: "0 14px",
          background: "var(--accent)",
          border: "none",
          borderRadius: "8px",
          color: "#fff",
          fontSize: "12px",
          fontWeight: 600,
          fontFamily: '"DM Sans",sans-serif',
          cursor: "pointer",
          display: "flex", alignItems: "center", gap: "6px",
          textDecoration: "none",
          boxShadow: "0 0 18px rgba(108,92,231,0.3)",
          transition: "all 150ms ease",
          letterSpacing: "-0.1px",
        }}
          onMouseEnter={e=>{e.currentTarget.style.background="#7d6ff0";e.currentTarget.style.boxShadow="0 0 24px rgba(108,92,231,0.45)"}}
          onMouseLeave={e=>{e.currentTarget.style.background="var(--accent)";e.currentTarget.style.boxShadow="0 0 18px rgba(108,92,231,0.3)"}}
        >
          <IcoPlus />
          {!isMobile && "New Booking"}
        </a>
      </div>

      {/* ── Page content ────────────────────────────────────────────────────── */}
      <div style={{ padding: p, maxWidth: "1400px", margin: "0 auto" }}>

        {/* ── Stat Cards ── */}
        <div style={{ display:"grid", gridTemplateColumns:statCols, gap, marginBottom:gap }}>
          {statCards.map((card) => {
            const { Icon } = card
            return (
              <div
                key={card.label}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: isMobile ? "13px 14px" : "18px 20px",
                  position: "relative",
                  overflow: "hidden",
                  transition: "border-color 150ms ease, transform 150ms ease",
                  cursor: "default",
                }}
                onMouseEnter={e=>{
                  e.currentTarget.style.borderColor = card.border
                  e.currentTarget.style.transform = "translateY(-1px)"
                }}
                onMouseLeave={e=>{
                  e.currentTarget.style.borderColor = "var(--border)"
                  e.currentTarget.style.transform = "translateY(0)"
                }}
              >
                {/* Top accent bar */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: "2px",
                  background: card.accent,
                  borderRadius: "12px 12px 0 0",
                  opacity: 0.7,
                }} />
                {/* Radial glow */}
                <div style={{
                  position: "absolute", top: 0, right: 0,
                  width: "70px", height: "70px",
                  background: "radial-gradient(circle at top right," + card.bg + ",transparent 70%)",
                  pointerEvents: "none",
                }} />

                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{
                      fontSize: "10px", fontWeight: 600,
                      color: "rgba(240,240,248,0.38)",
                      textTransform: "uppercase", letterSpacing: "0.55px",
                      marginBottom: "7px",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {card.label}
                    </div>
                    <div style={{
                      fontFamily: '"DM Mono",monospace',
                      fontSize: isMobile ? "17px" : "24px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      letterSpacing: "-0.5px",
                      lineHeight: 1.1,
                    }}>
                      {card.value}
                    </div>
                  </div>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "8px",
                    background: card.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginLeft: "8px",
                    color: card.accent,
                  }}>
                    <Icon />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Occupancy + Quick Actions ── */}
        <div style={{ display:"grid", gridTemplateColumns:row2Cols, gap, marginBottom:gap }}>

          {/* Occupancy ring */}
          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: "12px", padding: isMobile ? "14px" : "20px",
          }}>
            <div style={{
              fontSize: "10px", fontWeight: 600, color: "rgba(240,240,248,0.38)",
              textTransform: "uppercase", letterSpacing: "0.55px", marginBottom: "14px",
            }}>
              Occupancy
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:"20px" }}>
              <div style={{ position:"relative", width:"88px", height:"88px", flexShrink:0 }}>
                <svg width="88" height="88" viewBox="0 0 88 88">
                  <circle cx="44" cy="44" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
                  <circle cx="44" cy="44" r="34" fill="none"
                    stroke="url(#occGrad)" strokeWidth="7"
                    strokeDasharray={2*Math.PI*34}
                    strokeDashoffset={2*Math.PI*34*(1-occupancyPct/100)}
                    strokeLinecap="round" transform="rotate(-90 44 44)"
                    style={{transition:"stroke-dashoffset 900ms cubic-bezier(0.4,0,0.2,1)"}}/>
                  <defs>
                    <linearGradient id="occGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6c5ce7"/>
                      <stop offset="100%" stopColor="#a29bfe"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                  <div style={{ fontFamily:'"DM Mono",monospace', fontSize:"18px", fontWeight:700, color:"var(--text-primary)" }}>
                    {occupancyPct}%
                  </div>
                  <div style={{ fontSize:"9px", color:"rgba(240,240,248,0.35)", fontWeight:500 }}>filled</div>
                </div>
              </div>

              <div style={{ flex:1, display:"flex", flexDirection:"column", gap:"9px" }}>
                {[
                  { label:"Available",   key:"available",   color:"#00b894" },
                  { label:"Occupied",    key:"occupied",    color:"#a29bfe" },
                  { label:"Maintenance", key:"maintenance", color:"#e17055" },
                  { label:"Cleaning",    key:"cleaning",    color:"#fdcb6e" },
                ].map(s => {
                  const count = statusCounts[s.key]||0
                  const pct = stats.totalRooms > 0 ? Math.round(count/stats.totalRooms*100) : 0
                  return (
                    <div key={s.key} style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                      <div style={{ width:"7px", height:"7px", borderRadius:"50%", background:s.color, flexShrink:0 }}/>
                      <span style={{ fontSize:"11px", color:"rgba(240,240,248,0.55)", flex:1 }}>{s.label}</span>
                      <div style={{
                        width: "42px", height: "3px",
                        background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow:"hidden",
                      }}>
                        <div style={{ width: pct+"%", height:"100%", background:s.color, borderRadius:"2px", transition:"width 600ms ease" }}/>
                      </div>
                      <span style={{ fontFamily:'"DM Mono",monospace', fontSize:"11px", fontWeight:500, color:"var(--text-primary)", minWidth:"16px", textAlign:"right" }}>
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: "12px", padding: isMobile ? "14px" : "20px",
          }}>
            <div style={{
              fontSize: "10px", fontWeight: 600, color: "rgba(240,240,248,0.38)",
              textTransform: "uppercase", letterSpacing: "0.55px", marginBottom: "14px",
            }}>
              Quick Actions
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
              {[
                { label:"New Booking",    Icon: IcoPlus,     color:"var(--accent-light)", bg:"rgba(108,92,231,0.12)", border:"rgba(108,92,231,0.2)", href:"/bookings" },
                { label:"Add Guest",      Icon: IcoUserPlus, color:"var(--green)",         bg:"rgba(0,184,148,0.1)",   border:"rgba(0,184,148,0.2)",   href:"/guests"   },
                { label:"View Rooms",     Icon: IcoBed,      color:"var(--blue)",           bg:"rgba(116,185,255,0.1)",border:"rgba(116,185,255,0.2)", href:"/rooms"    },
                { label:"Record Payment", Icon: IcoRevenue,  color:"var(--amber)",          bg:"rgba(253,203,110,0.1)",border:"rgba(253,203,110,0.2)", href:"/billing"  },
              ].map(a => {
                const { Icon } = a
                return (
                  <a
                    key={a.label}
                    href={a.href}
                    style={{
                      display:"flex", alignItems:"center", gap:"10px",
                      padding: "11px 13px",
                      borderRadius: "9px",
                      background: a.bg,
                      border: "1px solid " + a.border,
                      textDecoration: "none",
                      cursor: "pointer",
                      transition: "all 150ms ease",
                    }}
                    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.borderColor=a.color}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.borderColor=a.border}}
                  >
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "7px",
                      background: "rgba(255,255,255,0.06)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, color: a.color,
                    }}>
                      <Icon />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:"12px", fontWeight:600, color:"var(--text-primary)", letterSpacing:"-0.1px" }}>{a.label}</div>
                    </div>
                    <span style={{ color:"rgba(240,240,248,0.3)", flexShrink:0 }}><IcoArrowRight /></span>
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Revenue Chart ── */}
        <div style={{
          background: "var(--bg-surface)", border: "1px solid var(--border)",
          borderRadius: "12px", padding: isMobile ? "14px" : "20px",
          marginBottom: gap,
        }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"18px", flexWrap:"wrap", gap:"8px" }}>
            <div>
              <div style={{ fontSize:"10px", fontWeight:600, color:"rgba(240,240,248,0.38)", textTransform:"uppercase", letterSpacing:"0.55px" }}>
                Revenue Trend
              </div>
              <div style={{ fontSize:"12px", color:"rgba(240,240,248,0.45)", marginTop:"3px" }}>Last 30 days</div>
            </div>
            <div style={{
              fontFamily:'"DM Mono",monospace',
              fontSize: isMobile ? "16px" : "22px",
              fontWeight: 600,
              color: "var(--text-primary)",
              letterSpacing: "-0.5px",
            }}>
              {fmt(revenueData.reduce((s,d)=>s+d.revenue,0))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={isMobile ? 150 : 210}>
            <AreaChart data={revenueData} margin={{ top:5, right:5, left: isMobile ? -20 : 0, bottom:0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6c5ce7" stopOpacity={0.28}/>
                  <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
              <XAxis
                dataKey="label"
                tick={{ fill:"rgba(240,240,248,0.3)", fontSize: isMobile ? 9 : 11 }}
                axisLine={false} tickLine={false}
                interval={isMobile ? 9 : 4}
              />
              <YAxis
                tick={{ fill:"rgba(240,240,248,0.3)", fontSize: isMobile ? 9 : 11 }}
                axisLine={false} tickLine={false}
                tickFormatter={(v)=>"₹"+(v>=1000?Math.round(v/1000)+"k":v)}
                width={isMobile ? 32 : 44}
              />
              <Tooltip content={<CustomTooltip/>}/>
              <Area
                type="monotone" dataKey="revenue"
                stroke="#6c5ce7" strokeWidth={2}
                fill="url(#revGrad)" dot={false}
                activeDot={{ r:4, fill:"#a29bfe", strokeWidth:0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ── Room Map + Recent Check-ins ── */}
        <div style={{ display:"grid", gridTemplateColumns:row4Cols, gap }}>

          {/* Room map */}
          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: "12px", padding: isMobile ? "14px" : "20px",
          }}>
            <div style={{
              fontSize: "10px", fontWeight: 600, color: "rgba(240,240,248,0.38)",
              textTransform: "uppercase", letterSpacing: "0.55px", marginBottom: "14px",
            }}>
              Room Map
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(30px,1fr))", gap:"4px" }}>
              {rooms.length===0
                ? <div style={{color:"var(--text-muted)",fontSize:"12px",gridColumn:"1/-1"}}>No rooms found</div>
                : rooms.map((r:any)=>(
                  <div
                    key={r.id}
                    title={r.room_number + " — " + r.status}
                    style={{
                      aspectRatio:"1", borderRadius:"5px",
                      background:
                        r.status==="available"   ? "rgba(0,184,148,0.8)"  :
                        r.status==="occupied"    ? "rgba(108,92,231,0.8)" :
                        r.status==="maintenance" ? "rgba(225,112,85,0.8)" :
                        r.status==="cleaning"    ? "rgba(253,203,110,0.8)" :
                        r.status==="reserved"    ? "rgba(116,185,255,0.8)" :
                        "rgba(255,255,255,0.08)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:"7px", fontWeight:700, color:"rgba(255,255,255,0.95)",
                      fontFamily:'"DM Mono",monospace',
                      transition:"transform 150ms ease, opacity 150ms ease",
                      cursor:"default",
                    }}
                    onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.15)";e.currentTarget.style.opacity="1"}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.opacity="1"}}
                  >
                    {r.room_number}
                  </div>
                ))
              }
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", marginTop:"14px" }}>
              {[
                {label:"Available",   color:"rgba(0,184,148,0.8)"},
                {label:"Occupied",    color:"rgba(108,92,231,0.8)"},
                {label:"Maintenance", color:"rgba(225,112,85,0.8)"},
                {label:"Cleaning",    color:"rgba(253,203,110,0.8)"},
              ].map(l=>(
                <div key={l.label} style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                  <div style={{ width:"7px", height:"7px", borderRadius:"2px", background:l.color }}/>
                  <span style={{ fontSize:"10px", color:"rgba(240,240,248,0.38)" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent check-ins */}
          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: "12px", padding: isMobile ? "14px" : "20px",
          }}>
            <div style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              marginBottom: "14px",
            }}>
              <div style={{
                fontSize:"10px", fontWeight:600, color:"rgba(240,240,248,0.38)",
                textTransform:"uppercase", letterSpacing:"0.55px",
              }}>
                Recent Check-ins
              </div>
              <a href="/bookings" style={{
                fontSize:"11px", color:"var(--accent-light)",
                textDecoration:"none", fontWeight:500,
                display:"flex", alignItems:"center", gap:"3px",
                opacity:0.8,
              }}
                onMouseEnter={e=>{e.currentTarget.style.opacity="1"}}
                onMouseLeave={e=>{e.currentTarget.style.opacity="0.8"}}
              >
                View all <IcoArrowRight />
              </a>
            </div>

            {recentCheckins.length===0 ? (
              <div style={{ textAlign:"center", padding:"30px 0" }}>
                <IcoCalendar />
                <div style={{fontSize:"12px",color:"rgba(240,240,248,0.35)",marginTop:"8px"}}>No active check-ins</div>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"1px" }}>
                {recentCheckins.map((b:any)=>(
                  <div
                    key={b.id}
                    style={{
                      display:"flex", alignItems:"center", gap:"10px",
                      padding:"9px 8px", borderRadius:"8px",
                      transition:"background 130ms ease",
                      cursor:"default",
                    }}
                    onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)"}}
                    onMouseLeave={e=>{e.currentTarget.style.background="transparent"}}
                  >
                    <Avatar name={b.guest?.name||"?"} size={32}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:"13px", fontWeight:600, color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {b.guest?.name||"Unknown"}
                      </div>
                      <div style={{ fontSize:"11px", color:"rgba(240,240,248,0.38)", fontFamily:'"DM Mono",monospace', marginTop:"1px" }}>
                        Room {b.room?.room_number} · {fmtDate(b.check_in_date)}
                      </div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontFamily:'"DM Mono",monospace', fontSize:"12px", fontWeight:600, color:"var(--text-primary)" }}>
                        {fmt(b.total_amount||0)}
                      </div>
                      <div style={{
                        fontSize:"10px", fontWeight:600, color:"var(--green)",
                        background:"rgba(0,184,148,0.1)",
                        border:"1px solid rgba(0,184,148,0.2)",
                        borderRadius:"99px", padding:"1px 7px", marginTop:"3px",
                        display:"inline-block",
                      }}>
                        In
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
