"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  TrendingUp, BedDouble, CalendarCheck, Clock,
  RefreshCw, ArrowUpRight, ArrowDownRight,
  Zap, Plus, UserPlus, DollarSign
} from "lucide-react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts"

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

const avatarColor = (name: string) => {
  const colors = [
    ["#6c5ce7","#a29bfe"],["#00b894","#55efc4"],["#74b9ff","#0984e3"],
    ["#fdcb6e","#e17055"],["#fd79a8","#e84393"],["#a29bfe","#6c5ce7"],
  ]
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return colors[Math.abs(h) % colors.length]
}

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const [from, to] = avatarColor(name)
  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, " + from + ", " + to + ")",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36 + "px", fontWeight: 700, color: "#fff",
      flexShrink: 0, letterSpacing: "0.5px",
    }}>{initials}</div>
  )
}

function StatCard({
  label, value, icon: Icon, color, bg, trend, trendUp
}: {
  label: string; value: string; icon: any;
  color: string; bg: string; trend?: string; trendUp?: boolean
}) {
  return (
    <div className="stat-card animate-fade-in" style={{ position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: 0, right: 0, width: "120px", height: "120px",
        background: "radial-gradient(circle at top right, " + bg + ", transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value" style={{ marginTop: "8px" }}>{value}</div>
          {trend && (
            <div style={{ marginTop: "8px" }}>
              <span className={"stat-trend " + (trendUp ? "stat-trend-up" : "stat-trend-down")}>
                {trendUp
                  ? <ArrowUpRight size={11} />
                  : <ArrowDownRight size={11} />}
                {trend}
              </span>
            </div>
          )}
        </div>
        <div className="stat-icon" style={{ background: bg }}>
          <Icon size={18} color={color} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  )
}

function RoomStatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    available: "var(--green)",
    occupied: "var(--purple)",
    maintenance: "var(--red)",
    cleaning: "var(--amber)",
    checked_out: "rgba(255,255,255,0.2)",
    reserved: "var(--blue)",
  }
  return (
    <div style={{
      width: "100%", paddingBottom: "100%", position: "relative", borderRadius: "6px",
      background: map[status] || "rgba(255,255,255,0.08)",
      transition: "transform 150ms ease", cursor: "default",
    }} title={status} />
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: "var(--bg-elevated)", border: "1px solid var(--border-hover)",
      borderRadius: "var(--radius-md)", padding: "10px 14px",
      boxShadow: "var(--shadow-card)", fontFamily: '"DM Sans", sans-serif',
    }}>
      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: p.color }} />
          <span style={{ fontSize: "13px", fontFamily: '"DM Mono", monospace', color: "var(--text-primary)", fontWeight: 500 }}>
            {fmt(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardClient() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    todayRevenue: 0, occupiedRooms: 0, totalRooms: 0,
    checkinsToday: 0, pendingBookings: 0,
  })
  const [recentCheckins, setRecentCheckins] = useState<any[]>([])
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const today = new Date().toISOString().split("T")[0]

      const [
        { data: invoices },
        { data: bookings },
        { data: allRooms },
        { data: recentB },
      ] = await Promise.all([
        supabase.from("invoices").select("total_amount,status,created_at").gte("created_at", today),
        supabase.from("bookings").select("status,check_in_date,check_out_date"),
        supabase.from("rooms").select("id,room_number,status,room_type_id"),
        supabase.from("bookings")
          .select("id,guest:guests(name),room:rooms(room_number),check_in_date,check_out_date,status,total_amount")
          .eq("status", "checked_in")
          .order("check_in_date", { ascending: false })
          .limit(6),
      ])

      const todayRevenue = (invoices || [])
        .filter((i: any) => i.status === "paid")
        .reduce((s: number, i: any) => s + (i.total_amount || 0), 0)

      const occupiedRooms = (allRooms || []).filter((r: any) => r.status === "occupied").length
      const checkinsToday = (bookings || []).filter((b: any) => b.check_in_date === today).length
      const pendingBookings = (bookings || []).filter((b: any) => b.status === "pending").length

      setStats({
        todayRevenue, occupiedRooms,
        totalRooms: (allRooms || []).length,
        checkinsToday, pendingBookings,
      })
      setRooms(allRooms || [])
      setRecentCheckins(recentB || [])

      // 30-day revenue
      const days: any[] = []
      for (let i = 29; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const ds = d.toISOString().split("T")[0]
        days.push({ date: ds, label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) })
      }
      const { data: allInvoices } = await supabase
        .from("invoices").select("total_amount,status,created_at")
        .gte("created_at", days[0].date)
      const mapped = days.map((d) => ({
        label: d.label,
        revenue: (allInvoices || [])
          .filter((i: any) => i.created_at?.startsWith(d.date) && i.status === "paid")
          .reduce((s: number, i: any) => s + (i.total_amount || 0), 0),
      }))
      setRevenueData(mapped)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const occupancyPct = stats.totalRooms > 0
    ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100)
    : 0

  const statusCounts = rooms.reduce((acc: any, r: any) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})

  if (loading) {
    return (
      <div style={{ padding: "28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "16px" }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton" style={{ height: "110px", borderRadius: "16px" }} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div className="skeleton" style={{ height: "200px", borderRadius: "16px" }} />
          <div className="skeleton" style={{ height: "200px", borderRadius: "16px" }} />
        </div>
        <div className="skeleton" style={{ height: "280px", borderRadius: "16px" }} />
      </div>
    )
  }

  return (
    <div style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchAll} style={{ gap: "6px" }}>
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* Row 1 — Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "16px" }}>
        <StatCard
          label="Today's Revenue"
          value={fmt(stats.todayRevenue)}
          icon={TrendingUp}
          color="var(--green)"
          bg="var(--green-bg)"
          trend="vs yesterday"
          trendUp
        />
        <StatCard
          label="Occupied Rooms"
          value={stats.occupiedRooms + " / " + stats.totalRooms}
          icon={BedDouble}
          color="var(--purple)"
          bg="var(--purple-bg)"
          trend={occupancyPct + "% occupancy"}
          trendUp={occupancyPct > 50}
        />
        <StatCard
          label="Check-ins Today"
          value={String(stats.checkinsToday)}
          icon={CalendarCheck}
          color="var(--blue)"
          bg="var(--blue-bg)"
        />
        <StatCard
          label="Pending Bookings"
          value={String(stats.pendingBookings)}
          icon={Clock}
          color="var(--amber)"
          bg="var(--amber-bg)"
          trend={stats.pendingBookings > 0 ? "Needs action" : "All clear"}
          trendUp={stats.pendingBookings === 0}
        />
      </div>

      {/* Row 2 — Occupancy Ring + Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>

        {/* Occupancy */}
        <div className="card-surface animate-fade-in-1" style={{ padding: "20px" }}>
          <div className="section-label" style={{ marginBottom: "16px" }}>Occupancy Overview</div>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div style={{ position: "relative", width: "110px", height: "110px", flexShrink: 0 }}>
              <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                <circle
                  cx="55" cy="55" r="46" fill="none"
                  stroke="var(--accent)" strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 46}
                  strokeDashoffset={2 * Math.PI * 46 * (1 - occupancyPct / 100)}
                  strokeLinecap="round"
                  transform="rotate(-90 55 55)"
                  style={{ transition: "stroke-dashoffset 800ms ease" }}
                />
              </svg>
              <div style={{
                position: "absolute", inset: 0, display: "flex",
                flexDirection: "column", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{ fontFamily: '"DM Mono",monospace', fontSize: "22px", fontWeight: 600, color: "var(--text-primary)" }}>
                  {occupancyPct}%
                </div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 500 }}>occupied</div>
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Available",    key: "available",   color: "var(--green)" },
                { label: "Occupied",     key: "occupied",    color: "var(--purple)" },
                { label: "Maintenance",  key: "maintenance", color: "var(--red)" },
                { label: "Cleaning",     key: "cleaning",    color: "var(--amber)" },
              ].map((s) => (
                <div key={s.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{s.label}</span>
                  </div>
                  <span style={{ fontFamily: '"DM Mono",monospace', fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                    {statusCounts[s.key] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-surface animate-fade-in-1" style={{ padding: "20px" }}>
          <div className="section-label" style={{ marginBottom: "16px" }}>Quick Actions</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {[
              { label: "New Booking",   icon: Plus,      color: "var(--accent)",  bg: "var(--accent-glow)",  href: "/bookings" },
              { label: "Add Guest",     icon: UserPlus,  color: "var(--green)",   bg: "var(--green-bg)",     href: "/guests" },
              { label: "Add Room",      icon: BedDouble, color: "var(--blue)",    bg: "var(--blue-bg)",      href: "/rooms" },
              { label: "Record Payment",icon: DollarSign,color: "var(--amber)",   bg: "var(--amber-bg)",     href: "/billing" },
            ].map((a) => {
              const Icon = a.icon
              return (
                <a key={a.label} href={a.href} style={{
                  display: "flex", flexDirection: "column", alignItems: "flex-start",
                  gap: "10px", padding: "16px", borderRadius: "12px",
                  background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
                  textDecoration: "none", cursor: "pointer",
                  transition: "all 150ms ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = a.bg
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"
                  e.currentTarget.style.transform = "translateY(-2px)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)"
                  e.currentTarget.style.borderColor = "var(--border)"
                  e.currentTarget.style.transform = "translateY(0)"
                }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "9px",
                    background: a.bg, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={16} color={a.color} strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{a.label}</span>
                </a>
              )
            })}
          </div>
        </div>
      </div>

      {/* Row 3 — Revenue Chart */}
      <div className="card-surface animate-fade-in-2" style={{ padding: "20px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <div className="section-label">Revenue Trend</div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>Last 30 days</div>
          </div>
          <div style={{
            fontFamily: '"DM Mono",monospace', fontSize: "20px", fontWeight: 600,
            color: "var(--text-primary)",
          }}>
            {fmt(revenueData.reduce((s, d) => s + d.revenue, 0))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6c5ce7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "rgba(240,240,248,0.35)", fontSize: 11 }}
              axisLine={false} tickLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fill: "rgba(240,240,248,0.35)", fontSize: 11 }}
              axisLine={false} tickLine={false}
              tickFormatter={(v) => "₹" + (v >= 1000 ? Math.round(v/1000) + "k" : v)}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone" dataKey="revenue" name="Revenue"
              stroke="#6c5ce7" strokeWidth={2}
              fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: "#6c5ce7", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Row 4 — Room Map + Recent Check-ins */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "16px" }}>

        {/* Room Status Map */}
        <div className="card-surface animate-fade-in-3" style={{ padding: "20px" }}>
          <div className="section-label" style={{ marginBottom: "16px" }}>Room Status Map</div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(36px, 1fr))",
            gap: "6px",
          }}>
            {rooms.length === 0
              ? <div style={{ color: "var(--text-muted)", fontSize: "13px", gridColumn: "1/-1" }}>No rooms found</div>
              : rooms.map((r: any) => (
                <div key={r.id} title={r.room_number + " — " + r.status} style={{ cursor: "default" }}>
                  <div style={{
                    aspectRatio: "1", borderRadius: "6px",
                    background:
                      r.status === "available"   ? "var(--green)"                  :
                      r.status === "occupied"    ? "var(--accent)"                 :
                      r.status === "maintenance" ? "var(--red)"                    :
                      r.status === "cleaning"    ? "var(--amber)"                  :
                      r.status === "reserved"    ? "var(--blue)"                   :
                      "rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.9)",
                    fontFamily: '"DM Mono",monospace',
                    transition: "transform 150ms ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.15)" }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)" }}
                  >
                    {r.room_number}
                  </div>
                </div>
              ))
            }
          </div>
          {/* Legend */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "16px" }}>
            {[
              { label: "Available",   color: "var(--green)" },
              { label: "Occupied",    color: "var(--accent)" },
              { label: "Maintenance", color: "var(--red)" },
              { label: "Cleaning",    color: "var(--amber)" },
              { label: "Reserved",    color: "var(--blue)" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "3px", background: l.color }} />
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Check-ins */}
        <div className="card-surface animate-fade-in-3" style={{ padding: "20px" }}>
          <div className="section-label" style={{ marginBottom: "16px" }}>Recent Check-ins</div>
          {recentCheckins.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 0" }}>
              <CalendarCheck size={36} style={{ color: "var(--text-muted)", marginBottom: "10px" }} />
              <div className="empty-state-title">No active check-ins</div>
              <div className="empty-state-sub">Checked-in guests will appear here</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {recentCheckins.map((b: any) => (
                <div key={b.id} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "10px 8px", borderRadius: "10px",
                  transition: "background 150ms ease", cursor: "default",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)" }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
                >
                  <Avatar name={b.guest?.name || "?"} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {b.guest?.name || "Unknown"}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: '"DM Mono",monospace' }}>
                      Room {b.room?.room_number} · {fmtDate(b.check_in_date)}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: '"DM Mono",monospace', fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                      {fmt(b.total_amount || 0)}
                    </div>
                    <span className="pill pill-green" style={{ fontSize: "10px", padding: "2px 8px" }}>
                      Checked In
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile responsive styles */}
      <style>{`
        @media (max-width: 1024px) {
          .dash-stats { grid-template-columns: repeat(2,1fr) !important; }
          .dash-row2  { grid-template-columns: 1fr !important; }
          .dash-row4  { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .dash-stats { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
