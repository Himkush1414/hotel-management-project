"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  TrendingUp, TrendingDown, BedDouble,
  DollarSign, RefreshCw, BarChart3
} from "lucide-react"
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts"

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

const fmtShort = (n: number) =>
  n >= 100000
    ? "₹" + (n / 100000).toFixed(1) + "L"
    : n >= 1000
    ? "₹" + Math.round(n / 1000) + "k"
    : "₹" + n

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
      background: "var(--bg-elevated)", border: "1px solid var(--border-hover)",
      borderRadius: "var(--radius-md)", padding: "12px 16px",
      boxShadow: "var(--shadow-card)", fontFamily: '"DM Sans", sans-serif',
      minWidth: "160px",
    }}>
      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 600 }}>
        {label}
      </div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: p.color, flexShrink: 0 }} />
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{p.name}</span>
          </div>
          <span style={{ fontFamily: '"DM Mono", monospace', fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
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
      background: "var(--bg-elevated)", border: "1px solid var(--border-hover)",
      borderRadius: "var(--radius-md)", padding: "12px 16px",
      boxShadow: "var(--shadow-card)", fontFamily: '"DM Sans", sans-serif',
    }}>
      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: '"DM Mono", monospace', fontSize: "14px", fontWeight: 700, color: "var(--accent-light)" }}>
        {payload[0]?.value}%
      </div>
    </div>
  )
}

export default function AnalyticsClient() {
  const db = createClient() as any

  const [data, setData] = useState<DayData[]>([])

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const [loading, setLoading] = useState(true)
  const [totalRooms, setTotalRooms] = useState(0)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const days: DayData[] = []
      for (let i = 29; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const ds = d.toISOString().split("T")[0]
        const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
        days.push({ label, date: ds, revenue: 0, expenses: 0, profit: 0, occupancy: 0 })
      }

      const startDate = days[0].date
      const endDate = days[days.length - 1].date

      const [
        { data: invoices },
        { data: expenses },
        { data: rooms },
        { data: bookings },
      ] = await Promise.all([
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
  const avgOccupancy  = data.length > 0
    ? Math.round(data.reduce((s, d) => s + d.occupancy, 0) / data.length)
    : 0
  const profitMargin  = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0

  if (loading) return (
    <div style={{ padding: isMobile ? "12px" : "28px" }}>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4, 1fr)", gap: isMobile ? "10px" : "16px", marginBottom: isMobile ? "14px" : "20px" }}>
        {[1,2,3,4].map((i) => <div key={i} className="skeleton" style={{ height: "100px", borderRadius: "16px" }} />)}
      </div>
      <div className="skeleton" style={{ height: "300px", borderRadius: "16px", marginBottom: "16px" }} />
      <div className="skeleton" style={{ height: "260px", borderRadius: "16px" }} />
    </div>
  )

  return (
    <div style={{ padding: isMobile ? "12px" : "28px", maxWidth: "1400px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isMobile ? "16px" : "24px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 className="page-title" style={{ fontSize: isMobile ? "18px" : undefined }}>Analytics</h1>
          <p className="page-sub">Last 30 days performance overview</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchAll}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4, 1fr)", gap: isMobile ? "10px" : "16px", marginBottom: isMobile ? "14px" : "20px" }}>
        {[
          {
            label: "Total Revenue",
            value: fmt(totalRevenue),
            icon: TrendingUp,
            color: "var(--green)",
            bg: "var(--green-bg)",
            sub: "30-day total",
            subColor: "var(--green)",
          },
          {
            label: "Total Expenses",
            value: fmt(totalExpenses),
            icon: TrendingDown,
            color: "var(--red)",
            bg: "var(--red-bg)",
            sub: "30-day total",
            subColor: "var(--red)",
          },
          {
            label: "Net Profit",
            value: fmt(netProfit),
            icon: DollarSign,
            color: netProfit >= 0 ? "var(--green)" : "var(--red)",
            bg: netProfit >= 0 ? "var(--green-bg)" : "var(--red-bg)",
            sub: profitMargin + "% margin",
            subColor: netProfit >= 0 ? "var(--green)" : "var(--red)",
          },
          {
            label: "Avg Occupancy",
            value: avgOccupancy + "%",
            icon: BedDouble,
            color: "var(--purple)",
            bg: "var(--purple-bg)",
            sub: totalRooms + " total rooms",
            subColor: "var(--text-muted)",
          },
        ].map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="stat-card animate-fade-in" style={{ position: "relative", overflow: "hidden" }}>
              <div style={{
                position: "absolute", top: 0, right: 0, width: "100px", height: "100px",
                background: "radial-gradient(circle at top right, " + card.bg + ", transparent 70%)",
                pointerEvents: "none",
              }} />
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div className="stat-label">{card.label}</div>
                  <div className="stat-value" style={{ marginTop: "8px", color: card.color }}>{card.value}</div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: card.subColor, marginTop: "6px" }}>
                    {card.sub}
                  </div>
                </div>
                <div className="stat-icon" style={{ background: card.bg }}>
                  <Icon size={18} color={card.color} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Revenue vs Expenses Chart */}
      <div className="card-surface animate-fade-in-1" style={{ padding: "24px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div className="section-label">Revenue vs Expenses</div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Daily comparison over the last 30 days
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            {[
              { color: "#00b894", label: "Revenue" },
              { color: "#e17055", label: "Expenses" },
              { color: "#6c5ce7", label: "Profit"  },
            ].map((l) => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "10px", height: "3px", borderRadius: "99px", background: l.color }} />
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6c5ce7" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "rgba(240,240,248,0.35)", fontSize: 10 }}
              axisLine={false} tickLine={false} interval={4}
            />
            <YAxis
              tick={{ fill: "rgba(240,240,248,0.35)", fontSize: 10 }}
              axisLine={false} tickLine={false}
              tickFormatter={fmtShort} width={52}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone" dataKey="revenue" name="Revenue"
              stroke="#00b894" strokeWidth={2} dot={false}
              activeDot={{ r: 4, fill: "#00b894", strokeWidth: 0 }}
            />
            <Line
              type="monotone" dataKey="expenses" name="Expenses"
              stroke="#e17055" strokeWidth={2} dot={false}
              activeDot={{ r: 4, fill: "#e17055", strokeWidth: 0 }}
            />
            <Line
              type="monotone" dataKey="profit" name="Profit"
              stroke="#6c5ce7" strokeWidth={2} dot={false}
              activeDot={{ r: 4, fill: "#6c5ce7", strokeWidth: 0 }}
              strokeDasharray="4 2"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Occupancy Rate Chart */}
      <div className="card-surface animate-fade-in-2" style={{ padding: "24px", marginBottom: "16px" }}>
        <div style={{ marginBottom: "20px" }}>
          <div className="section-label">Occupancy Rate</div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Daily room occupancy percentage over the last 30 days
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a29bfe" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a29bfe" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "rgba(240,240,248,0.35)", fontSize: 10 }}
              axisLine={false} tickLine={false} interval={4}
            />
            <YAxis
              tick={{ fill: "rgba(240,240,248,0.35)", fontSize: 10 }}
              axisLine={false} tickLine={false}
              tickFormatter={(v) => v + "%"} domain={[0, 100]} width={40}
            />
            <Tooltip content={<OccupancyTooltip />} />
            <Area
              type="monotone" dataKey="occupancy" name="Occupancy"
              stroke="#a29bfe" strokeWidth={2}
              fill="url(#occGrad)" dot={false}
              activeDot={{ r: 4, fill: "#a29bfe", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Row */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isMobile ? "10px" : "16px" }}>
        {[
          {
            label: "Best Revenue Day",
            value: data.length > 0 ? fmt(Math.max(...data.map((d) => d.revenue))) : fmt(0),
            sub: data.length > 0 ? data.reduce((a, b) => a.revenue > b.revenue ? a : b).label : "—",
            color: "var(--green)",
          },
          {
            label: "Highest Expense Day",
            value: data.length > 0 ? fmt(Math.max(...data.map((d) => d.expenses))) : fmt(0),
            sub: data.length > 0 && Math.max(...data.map((d) => d.expenses)) > 0 ? data.reduce((a, b) => a.expenses > b.expenses ? a : b).label : "—",
            color: "var(--red)",
          },
          {
            label: "Peak Occupancy Day",
            value: data.length > 0 ? Math.max(...data.map((d) => d.occupancy)) + "%" : "0%",
            sub: data.length > 0 ? data.reduce((a, b) => a.occupancy > b.occupancy ? a : b).label : "—",
            color: "var(--purple)",
          },
        ].map((card) => (
          <div key={card.label} className="card-surface animate-fade-in-3" style={{ padding: "18px" }}>
            <div className="stat-label" style={{ marginBottom: "8px" }}>{card.label}</div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: "22px", fontWeight: 700, color: card.color, lineHeight: 1.1 }}>
              {card.value}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
              {card.sub}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
