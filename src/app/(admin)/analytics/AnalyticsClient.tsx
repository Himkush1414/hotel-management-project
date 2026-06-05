"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts"

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

const fmtShort = (n: number) =>
  n >= 100000 ? "₹" + (n / 100000).toFixed(1) + "L"
  : n >= 1000  ? "₹" + Math.round(n / 1000) + "k"
  : "₹" + n

// ── SVG Icons ──────────────────────────────────────────────────────────────────
const IcoRefresh = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M11.5 2A6 6 0 106.5 1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
    <path d="M6.5 1L9 3.5M6.5 1L4 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoTrendUp = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
    <path d="M2 12l4-5 3 2.5 5-7 3 2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13 4h4v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoTrendDown = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
    <path d="M2 5l4 5 3-2.5 5 7 3-2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13 13h4v-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoDollar = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
    <path d="M8.5 1v15M5 5.5h5a3 3 0 010 6H5M4.5 5.5H3.5M4.5 11.5H3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)
const IcoBed = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
    <rect x="1.5" y="1.5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M1.5 9.5h14M6.5 9.5V15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <circle cx="10.5" cy="5.5" r="1.3" fill="currentColor"/>
  </svg>
)

interface DayData {
  label: string
  date: string
  revenue: number
  expenses: number
  profit: number
  occupancy: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: "var(--bg-elevated)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "10px", padding: "12px 16px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      minWidth: "160px",
    }}>
      <div style={{ fontSize: "11px", color: "rgba(240,240,248,0.4)", marginBottom: "8px", fontWeight: 600 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: p.color, flexShrink: 0 }} />
            <span style={{ fontSize: "12px", color: "rgba(240,240,248,0.55)" }}>{p.name}</span>
          </div>
          <span style={{ fontFamily: '"DM Mono",monospace', fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
            {p.name === "Occupancy" ? p.value + "%" : fmt(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

const OccupancyTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: "var(--bg-elevated)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "10px", padding: "12px 16px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
    }}>
      <div style={{ fontSize: "11px", color: "rgba(240,240,248,0.4)", marginBottom: "6px", fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: '"DM Mono",monospace', fontSize: "14px", fontWeight: 700, color: "var(--accent-light)" }}>
        {payload[0]?.value}%
      </div>
    </div>
  )
}

export default function AnalyticsClient() {
  const db = createClient() as any

  const [data, setData]           = useState<DayData[]>([])
  const [isMobile, setIsMobile]   = useState(false)
  const [loading, setLoading]     = useState(true)
  const [totalRooms, setTotalRooms] = useState(0)

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
      const days: DayData[] = []
      for (let i = 29; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i)
        const ds    = d.toISOString().split("T")[0]
        const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
        days.push({ label, date: ds, revenue: 0, expenses: 0, profit: 0, occupancy: 0 })
      }
      const startDate = days[0].date
      const endDate   = days[days.length - 1].date

      const [{ data: invoices }, { data: expenses }, { data: rooms }, { data: bookings }] = await Promise.all([
        db.from("invoices").select("total_amount, status, created_at").gte("created_at", startDate).lte("created_at", endDate + "T23:59:59"),
        db.from("expenses").select("amount, date").gte("date", startDate).lte("date", endDate),
        db.from("rooms").select("id"),
        db.from("bookings").select("check_in_date, check_out_date, status").in("status", ["checked_in", "checked_out", "confirmed"]),
      ])

      const roomCount = (rooms || []).length
      setTotalRooms(roomCount)

      const filled = days.map((day) => {
        const rev = (invoices || [])
          .filter((inv: any) => inv.created_at?.startsWith(day.date) && inv.status === "paid")
          .reduce((s: number, inv: any) => s + (inv.total_amount || 0), 0)
        const exp = (expenses || [])
          .filter((e: any) => e.date === day.date)
          .reduce((s: number, e: any) => s + (e.amount || 0), 0)
        const occupiedOnDay = roomCount > 0
          ? (bookings || []).filter((b: any) => b.check_in_date <= day.date && b.check_out_date > day.date).length
          : 0
        const occ = roomCount > 0 ? Math.round((occupiedOnDay / roomCount) * 100) : 0
        return { ...day, revenue: rev, expenses: exp, profit: rev - exp, occupancy: occ }
      })
      setData(filled)
    } catch { toast.error("Failed to load analytics") }
    finally { setLoading(false) }
  }

  const totalRevenue  = data.reduce((s, d) => s + d.revenue,  0)
  const totalExpenses = data.reduce((s, d) => s + d.expenses, 0)
  const netProfit     = totalRevenue - totalExpenses
  const avgOccupancy  = data.length > 0 ? Math.round(data.reduce((s, d) => s + d.occupancy, 0) / data.length) : 0
  const profitMargin  = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0

  const p   = isMobile ? "12px" : "28px"
  const gap = isMobile ? "10px" : "16px"

  const kpiCards = [
    {
      label: "Total Revenue",  value: fmt(totalRevenue),
      Ico: IcoTrendUp,  accent: "#00b894", bg: "rgba(0,184,148,0.1)",   border: "rgba(0,184,148,0.22)",
      sub: "30-day total", subColor: "#00b894",
    },
    {
      label: "Total Expenses", value: fmt(totalExpenses),
      Ico: IcoTrendDown, accent: "#e17055", bg: "rgba(225,112,85,0.1)",  border: "rgba(225,112,85,0.22)",
      sub: "30-day total", subColor: "#e17055",
    },
    {
      label: "Net Profit",     value: fmt(netProfit),
      Ico: IcoDollar,
      accent: netProfit >= 0 ? "#00b894" : "#e17055",
      bg:     netProfit >= 0 ? "rgba(0,184,148,0.1)"  : "rgba(225,112,85,0.1)",
      border: netProfit >= 0 ? "rgba(0,184,148,0.22)" : "rgba(225,112,85,0.22)",
      sub: profitMargin + "% margin",
      subColor: netProfit >= 0 ? "#00b894" : "#e17055",
    },
    {
      label: "Avg Occupancy",  value: avgOccupancy + "%",
      Ico: IcoBed, accent: "#a29bfe", bg: "rgba(162,155,254,0.1)", border: "rgba(162,155,254,0.22)",
      sub: totalRooms + " total rooms", subColor: "rgba(240,240,248,0.38)",
    },
  ]

  if (loading) return (
    <div style={{ padding: p, overflowX: "hidden", width: "100%", boxSizing: "border-box" }}>
      <div className="skeleton" style={{ height: "56px", borderRadius: "0", marginBottom: "16px" }} />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap, marginBottom: gap }}>
        {[1,2,3,4].map((i) => <div key={i} className="skeleton" style={{ height: "100px", borderRadius: "12px" }} />)}
      </div>
      <div className="skeleton" style={{ height: "280px", borderRadius: "12px", marginBottom: gap }} />
      <div className="skeleton" style={{ height: "220px", borderRadius: "12px" }} />
    </div>
  )

  return (
    <div style={{ overflowX: "hidden", width: "100%", boxSizing: "border-box" }}>

      {/* ── Topbar ── */}
      <div style={{
        position: "sticky", top: 0, height: "56px",
        background: "rgba(10,10,15,0.88)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.065)",
        zIndex: 50, display: "flex", alignItems: "center",
        padding: isMobile ? "0 14px" : "0 28px",
        gap: "8px", flexShrink: 0,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: isMobile ? "15px" : "16px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>Analytics</div>
          {!isMobile && <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>Last 30 days performance</div>}
        </div>
        <button onClick={fetchAll}
          style={{ height: "32px", padding: "0 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(240,240,248,0.6)", fontSize: "12px", fontWeight: 500, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "all 150ms ease" }}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.09)";e.currentTarget.style.color="rgba(240,240,248,0.9)"}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.color="rgba(240,240,248,0.6)"}}
        >
          <IcoRefresh />{!isMobile && "Refresh"}
        </button>
      </div>

      <div style={{ padding: p, maxWidth: "1400px", margin: "0 auto" }}>

        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap, marginBottom: gap }}>
          {kpiCards.map((card) => {
            const { Ico } = card
            return (
              <div key={card.label} style={{
                background: "var(--bg-surface)", border: "1px solid var(--border)",
                borderRadius: "12px", padding: isMobile ? "12px 13px" : "18px 20px",
                position: "relative", overflow: "hidden",
                transition: "border-color 150ms ease, transform 150ms ease",
              }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=card.border;e.currentTarget.style.transform="translateY(-1px)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="translateY(0)"}}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: card.accent, borderRadius: "12px 12px 0 0", opacity: 0.8 }} />
                <div style={{ position: "absolute", top: 0, right: 0, width: "70px", height: "70px", background: "radial-gradient(circle at top right," + card.bg + ",transparent 70%)", pointerEvents: "none" }} />
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(240,240,248,0.38)", textTransform: "uppercase", letterSpacing: "0.55px", marginBottom: "7px" }}>{card.label}</div>
                    <div style={{ fontFamily: '"DM Mono",monospace', fontSize: isMobile ? "14px" : "22px", fontWeight: 600, color: card.accent, letterSpacing: "-0.5px", lineHeight: 1.1 }}>{card.value}</div>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: card.subColor, marginTop: "6px" }}>{card.sub}</div>
                  </div>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: "8px", color: card.accent }}>
                    <Ico />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Revenue vs Expenses Chart */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: isMobile ? "14px" : "22px", marginBottom: gap }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(240,240,248,0.38)", textTransform: "uppercase", letterSpacing: "0.55px" }}>Revenue vs Expenses</div>
              <div style={{ fontSize: "12px", color: "rgba(240,240,248,0.4)", marginTop: "3px" }}>Daily comparison — last 30 days</div>
            </div>
            <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
              {[
                { color: "#00b894", label: "Revenue"  },
                { color: "#e17055", label: "Expenses" },
                { color: "#6c5ce7", label: "Profit"   },
              ].map((l) => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div style={{ width: "10px", height: "3px", borderRadius: "99px", background: l.color }} />
                  <span style={{ fontSize: "11px", color: "rgba(240,240,248,0.5)" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={isMobile ? 180 : 260}>
            <LineChart data={data} margin={{ top: 5, right: 5, left: isMobile ? -20 : 5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "rgba(240,240,248,0.3)", fontSize: isMobile ? 9 : 11 }} axisLine={false} tickLine={false} interval={isMobile ? 7 : 4} />
              <YAxis tick={{ fill: "rgba(240,240,248,0.3)", fontSize: isMobile ? 9 : 11 }} axisLine={false} tickLine={false} tickFormatter={fmtShort} width={isMobile ? 30 : 48} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue"  name="Revenue"  stroke="#00b894" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#00b894",  strokeWidth: 0 }} />
              <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#e17055" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#e17055",  strokeWidth: 0 }} />
              <Line type="monotone" dataKey="profit"   name="Profit"   stroke="#6c5ce7" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#6c5ce7",  strokeWidth: 0 }} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Occupancy Chart */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: isMobile ? "14px" : "22px", marginBottom: gap }}>
          <div style={{ marginBottom: "18px" }}>
            <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(240,240,248,0.38)", textTransform: "uppercase", letterSpacing: "0.55px" }}>Occupancy Rate</div>
            <div style={{ fontSize: "12px", color: "rgba(240,240,248,0.4)", marginTop: "3px" }}>Daily room occupancy % — last 30 days</div>
          </div>
          <ResponsiveContainer width="100%" height={isMobile ? 150 : 200}>
            <AreaChart data={data} margin={{ top: 5, right: 5, left: isMobile ? -20 : 5, bottom: 0 }}>
              <defs>
                <linearGradient id="occGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#a29bfe" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a29bfe" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "rgba(240,240,248,0.3)", fontSize: isMobile ? 9 : 11 }} axisLine={false} tickLine={false} interval={isMobile ? 7 : 4} />
              <YAxis tick={{ fill: "rgba(240,240,248,0.3)", fontSize: isMobile ? 9 : 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => v + "%"} domain={[0, 100]} width={isMobile ? 30 : 38} />
              <Tooltip content={<OccupancyTooltip />} />
              <Area type="monotone" dataKey="occupancy" name="Occupancy" stroke="#a29bfe" strokeWidth={2} fill="url(#occGrad2)" dot={false} activeDot={{ r: 4, fill: "#a29bfe", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Row */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap }}>
          {[
            {
              label: "Best Revenue Day",
              value: data.length > 0 ? fmt(Math.max(...data.map((d) => d.revenue))) : fmt(0),
              sub:   data.length > 0 ? data.reduce((a, b) => a.revenue > b.revenue ? a : b).label : "—",
              color: "#00b894",
            },
            {
              label: "Highest Expense Day",
              value: data.length > 0 ? fmt(Math.max(...data.map((d) => d.expenses))) : fmt(0),
              sub:   data.length > 0 && Math.max(...data.map((d) => d.expenses)) > 0 ? data.reduce((a, b) => a.expenses > b.expenses ? a : b).label : "—",
              color: "#e17055",
            },
            {
              label: "Peak Occupancy Day",
              value: data.length > 0 ? Math.max(...data.map((d) => d.occupancy)) + "%" : "0%",
              sub:   data.length > 0 ? data.reduce((a, b) => a.occupancy > b.occupancy ? a : b).label : "—",
              color: "#a29bfe",
            },
          ].map((card) => (
            <div key={card.label} style={{
              background: "var(--bg-surface)", border: "1px solid var(--border)",
              borderRadius: "12px", padding: isMobile ? "14px" : "18px",
              transition: "border-color 150ms ease",
            }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.13)"}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)"}}
            >
              <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(240,240,248,0.38)", textTransform: "uppercase", letterSpacing: "0.55px", marginBottom: "8px" }}>
                {card.label}
              </div>
              <div style={{ fontFamily: '"DM Mono",monospace', fontSize: isMobile ? "20px" : "24px", fontWeight: 700, color: card.color, lineHeight: 1.1, letterSpacing: "-0.5px" }}>
                {card.value}
              </div>
              <div style={{ fontSize: "12px", color: "rgba(240,240,248,0.38)", marginTop: "6px" }}>
                {card.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
