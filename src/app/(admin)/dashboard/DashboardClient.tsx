"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  TrendingUp, BedDouble, CalendarCheck, Clock,
  RefreshCw, ArrowUpRight, ArrowDownRight,
  Plus, UserPlus, DollarSign
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts"

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: "var(--bg-elevated)", border: "1px solid var(--border-hover)",
      borderRadius: "12px", padding: "10px 14px", boxShadow: "var(--shadow-card)",
    }}>
      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontFamily: '"DM Mono",monospace', fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
        {fmt(payload[0].value)}
      </div>
    </div>
  )
}

export default function DashboardClient() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [stats, setStats] = useState({ todayRevenue: 0, occupiedRooms: 0, totalRooms: 0, checkinsToday: 0, pendingBookings: 0 })
  const [recentCheckins, setRecentCheckins] = useState<any[]>([])
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
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
    finally { setLoading(false) }
  }

  const occupancyPct = stats.totalRooms > 0 ? Math.round((stats.occupiedRooms/stats.totalRooms)*100) : 0
  const statusCounts = rooms.reduce((acc:any,r:any)=>{ acc[r.status]=(acc[r.status]||0)+1; return acc },{})

  const p = isMobile ? "14px" : "28px"
  const gap = isMobile ? "10px" : "16px"
  const statCols = isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)"
  const row2Cols = isMobile ? "1fr" : "1fr 1fr"
  const row4Cols = isMobile ? "1fr" : "1fr 1.4fr"

  if (loading) return (
    <div style={{ padding: p }}>
      <div style={{ display:"grid", gridTemplateColumns:statCols, gap, marginBottom:gap }}>
        {[1,2,3,4].map(i=><div key={i} className="skeleton" style={{height:"100px",borderRadius:"16px"}}/>)}
      </div>
      <div className="skeleton" style={{height:"200px",borderRadius:"16px",marginBottom:gap}}/>
      <div className="skeleton" style={{height:"260px",borderRadius:"16px"}}/>
    </div>
  )

  return (
    <div style={{ padding: p, maxWidth:"1400px", margin:"0 auto" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px", flexWrap:"wrap", gap:"10px" }}>
        <div>
          <h1 style={{ fontSize: isMobile?"18px":"22px", fontWeight:600, color:"var(--text-primary)", letterSpacing:"-0.5px" }}>Dashboard</h1>
          <p style={{ fontSize:"12px", color:"var(--text-secondary)", marginTop:"2px" }}>
            {new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchAll}><RefreshCw size={13}/>Refresh</button>
      </div>

      {/* Stat Cards */}
      <div style={{ display:"grid", gridTemplateColumns:statCols, gap, marginBottom:gap }}>
        {[
          { label:"Today's Revenue", value:fmt(stats.todayRevenue), icon:TrendingUp, color:"var(--green)", bg:"var(--green-bg)" },
          { label:"Occupied Rooms",  value:stats.occupiedRooms+"/"+stats.totalRooms, icon:BedDouble, color:"var(--purple)", bg:"var(--purple-bg)" },
          { label:"Check-ins Today", value:String(stats.checkinsToday), icon:CalendarCheck, color:"var(--blue)", bg:"var(--blue-bg)" },
          { label:"Pending",         value:String(stats.pendingBookings), icon:Clock, color:"var(--amber)", bg:"var(--amber-bg)" },
        ].map((card)=>{
          const Icon = card.icon
          return (
            <div key={card.label} className="card-surface" style={{ padding:isMobile?"14px":"20px", minHeight:"90px", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, right:0, width:"80px", height:"80px", background:"radial-gradient(circle at top right,"+card.bg+",transparent 70%)", pointerEvents:"none" }}/>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:"10px", fontWeight:600, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:"6px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{card.label}</div>
                  <div style={{ fontFamily:'"DM Mono",monospace', fontSize:isMobile?"16px":"24px", fontWeight:600, color:"var(--text-primary)", letterSpacing:"-0.5px", lineHeight:1.1 }}>{card.value}</div>
                </div>
                <div style={{ width:"32px", height:"32px", borderRadius:"9px", background:card.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginLeft:"8px" }}>
                  <Icon size={16} color={card.color} strokeWidth={2.5}/>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Occupancy + Quick Actions */}
      <div style={{ display:"grid", gridTemplateColumns:row2Cols, gap, marginBottom:gap }}>

        {/* Occupancy */}
        <div className="card-surface" style={{ padding:isMobile?"14px":"20px" }}>
          <div style={{ fontSize:"11px", fontWeight:600, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:"14px" }}>Occupancy</div>
          <div style={{ display:"flex", alignItems:"center", gap:"20px" }}>
            <div style={{ position:"relative", width:"90px", height:"90px", flexShrink:0 }}>
              <svg width="90" height="90" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
                <circle cx="45" cy="45" r="36" fill="none" stroke="var(--accent)" strokeWidth="8"
                  strokeDasharray={2*Math.PI*36} strokeDashoffset={2*Math.PI*36*(1-occupancyPct/100)}
                  strokeLinecap="round" transform="rotate(-90 45 45)"
                  style={{transition:"stroke-dashoffset 800ms ease"}}/>
              </svg>
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                <div style={{ fontFamily:'"DM Mono",monospace', fontSize:"18px", fontWeight:600, color:"var(--text-primary)" }}>{occupancyPct}%</div>
                <div style={{ fontSize:"9px", color:"var(--text-muted)", fontWeight:500 }}>occupied</div>
              </div>
            </div>
            <div style={{ flex:1, display:"flex", flexDirection:"column", gap:"8px" }}>
              {[
                {label:"Available", key:"available", color:"var(--green)"},
                {label:"Occupied",  key:"occupied",  color:"var(--purple)"},
                {label:"Maintenance",key:"maintenance",color:"var(--red)"},
                {label:"Cleaning",  key:"cleaning",  color:"var(--amber)"},
              ].map(s=>(
                <div key={s.key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                    <div style={{ width:"7px", height:"7px", borderRadius:"50%", background:s.color, flexShrink:0 }}/>
                    <span style={{ fontSize:"11px", color:"var(--text-secondary)" }}>{s.label}</span>
                  </div>
                  <span style={{ fontFamily:'"DM Mono",monospace', fontSize:"12px", fontWeight:500, color:"var(--text-primary)" }}>{statusCounts[s.key]||0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-surface" style={{ padding:isMobile?"14px":"20px" }}>
          <div style={{ fontSize:"11px", fontWeight:600, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:"14px" }}>Quick Actions</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
            {[
              {label:"New Booking",    icon:Plus,        color:"var(--accent)",  bg:"var(--accent-glow)", href:"/bookings"},
              {label:"Add Guest",      icon:UserPlus,    color:"var(--green)",   bg:"var(--green-bg)",    href:"/guests"},
              {label:"Add Room",       icon:BedDouble,   color:"var(--blue)",    bg:"var(--blue-bg)",     href:"/rooms"},
              {label:"Record Payment", icon:DollarSign,  color:"var(--amber)",   bg:"var(--amber-bg)",    href:"/billing"},
            ].map(a=>{
              const Icon = a.icon
              return (
                <a key={a.label} href={a.href} style={{
                  display:"flex", flexDirection:"column", alignItems:"flex-start", gap:"8px",
                  padding:"12px", borderRadius:"10px",
                  background:"rgba(255,255,255,0.03)", border:"1px solid var(--border)",
                  textDecoration:"none", cursor:"pointer", transition:"all 150ms ease",
                }}
                onMouseEnter={e=>{ e.currentTarget.style.background=a.bg; e.currentTarget.style.transform="translateY(-2px)" }}
                onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.03)"; e.currentTarget.style.transform="translateY(0)" }}>
                  <div style={{ width:"28px", height:"28px", borderRadius:"8px", background:a.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Icon size={14} color={a.color} strokeWidth={2.5}/>
                  </div>
                  <span style={{ fontSize:"11px", fontWeight:600, color:"var(--text-primary)", lineHeight:1.3 }}>{a.label}</span>
                </a>
              )
            })}
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="card-surface" style={{ padding:isMobile?"14px":"20px", marginBottom:gap }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px" }}>
          <div>
            <div style={{ fontSize:"11px", fontWeight:600, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.7px" }}>Revenue Trend</div>
            <div style={{ fontSize:"12px", color:"var(--text-secondary)", marginTop:"2px" }}>Last 30 days</div>
          </div>
          <div style={{ fontFamily:'"DM Mono",monospace', fontSize:isMobile?"16px":"20px", fontWeight:600, color:"var(--text-primary)" }}>
            {fmt(revenueData.reduce((s,d)=>s+d.revenue,0))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={isMobile?160:220}>
          <AreaChart data={revenueData} margin={{top:5,right:5,left:isMobile?-20:5,bottom:0}}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6c5ce7" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
            <XAxis dataKey="label" tick={{fill:"rgba(240,240,248,0.35)",fontSize:isMobile?9:11}} axisLine={false} tickLine={false} interval={isMobile?9:4}/>
            <YAxis tick={{fill:"rgba(240,240,248,0.35)",fontSize:isMobile?9:11}} axisLine={false} tickLine={false} tickFormatter={(v)=>"₹"+(v>=1000?Math.round(v/1000)+"k":v)} width={isMobile?32:48}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Area type="monotone" dataKey="revenue" stroke="#6c5ce7" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{r:4,fill:"#6c5ce7",strokeWidth:0}}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Room Map + Recent Checkins */}
      <div style={{ display:"grid", gridTemplateColumns:row4Cols, gap }}>

        {/* Room Map */}
        <div className="card-surface" style={{ padding:isMobile?"14px":"20px" }}>
          <div style={{ fontSize:"11px", fontWeight:600, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:"14px" }}>Room Status Map</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(32px,1fr))", gap:"5px" }}>
            {rooms.length===0
              ? <div style={{color:"var(--text-muted)",fontSize:"13px",gridColumn:"1/-1"}}>No rooms</div>
              : rooms.map((r:any)=>(
                <div key={r.id} title={r.room_number+" — "+r.status} style={{
                  aspectRatio:"1", borderRadius:"5px",
                  background: r.status==="available"?"var(--green)":r.status==="occupied"?"var(--accent)":r.status==="maintenance"?"var(--red)":r.status==="cleaning"?"var(--amber)":r.status==="reserved"?"var(--blue)":"rgba(255,255,255,0.08)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"8px", fontWeight:700, color:"rgba(255,255,255,0.9)",
                  fontFamily:'"DM Mono",monospace',
                }}>
                  {r.room_number}
                </div>
              ))
            }
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", marginTop:"12px" }}>
            {[{label:"Available",color:"var(--green)"},{label:"Occupied",color:"var(--accent)"},{label:"Maintenance",color:"var(--red)"},{label:"Cleaning",color:"var(--amber)"}].map(l=>(
              <div key={l.label} style={{ display:"flex", alignItems:"center", gap:"4px" }}>
                <div style={{ width:"7px", height:"7px", borderRadius:"2px", background:l.color }}/>
                <span style={{ fontSize:"10px", color:"var(--text-muted)" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Check-ins */}
        <div className="card-surface" style={{ padding:isMobile?"14px":"20px" }}>
          <div style={{ fontSize:"11px", fontWeight:600, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:"14px" }}>Recent Check-ins</div>
          {recentCheckins.length===0 ? (
            <div style={{ textAlign:"center", padding:"30px 0" }}>
              <CalendarCheck size={32} style={{color:"var(--text-muted)",marginBottom:"8px"}}/>
              <div style={{fontSize:"13px",color:"var(--text-muted)"}}>No active check-ins</div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
              {recentCheckins.map((b:any)=>(
                <div key={b.id} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"9px 8px", borderRadius:"9px", transition:"background 150ms ease" }}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)"}}
                  onMouseLeave={e=>{e.currentTarget.style.background="transparent"}}>
                  <Avatar name={b.guest?.name||"?"} size={32}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:"13px", fontWeight:600, color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{b.guest?.name||"Unknown"}</div>
                    <div style={{ fontSize:"11px", color:"var(--text-muted)", fontFamily:'"DM Mono",monospace' }}>Room {b.room?.room_number} · {fmtDate(b.check_in_date)}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontFamily:'"DM Mono",monospace', fontSize:"12px", fontWeight:500, color:"var(--text-primary)" }}>{fmt(b.total_amount||0)}</div>
                    <span className="pill pill-green" style={{ fontSize:"10px", padding:"1px 7px" }}>In</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
