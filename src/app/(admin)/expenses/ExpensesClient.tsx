"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts"

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

// ── SVG Icons ──────────────────────────────────────────────────────────────────
const IcoPlus = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)
const IcoRefresh = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M11.5 2A6 6 0 106.5 1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
    <path d="M6.5 1L9 3.5M6.5 1L4 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoSearch = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)
const IcoX = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
  </svg>
)
const IcoTrend = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 11l3-4 2.5 2 4-5.5 3 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 3h3v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoCal = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1.5" y="3" width="13" height="11" rx="1.8" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M5 1.5v3M11 1.5v3M1.5 7h13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)
const IcoReceipt = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 2h10v12l-2-1.5-2 1.5-2-1.5-2 1.5L3 14V2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.5 6h5M5.5 9h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

// Category SVG icons
const IcoWrench = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M8.5 1.5a3 3 0 00-3 3.5L1 9.5 2.5 11l4.5-4.5a3 3 0 003.5-3 3 3 0 00-2-2.8L7 2.7l1.2 1.2-.7.7L6.3 3.4A3 3 0 008.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoZap = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M7 1L2 7h5l-2 4 5-6H5l2-4z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoCart = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M1 1h2l1.5 6h5.5l1-4H3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="5.5" cy="10" r="1" fill="currentColor"/>
    <circle cx="9" cy="10" r="1" fill="currentColor"/>
  </svg>
)
const IcoUsers = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <circle cx="4.5" cy="4" r="2" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M1 11c0-2 1.57-3.5 3.5-3.5S8 9 8 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M9 5.5c.83.5 1.5 1.5 1.5 2.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <circle cx="8.5" cy="3.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
  </svg>
)
const IcoCoffee = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 4h7v5a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M9 5h1a1.5 1.5 0 010 3H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M4.5 1.5c0 1 1 1 1 2M6.5 1.5c0 1 1 1 1 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)
const IcoDots = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <circle cx="2" cy="6" r="1.2" fill="currentColor"/>
    <circle cx="6" cy="6" r="1.2" fill="currentColor"/>
    <circle cx="10" cy="6" r="1.2" fill="currentColor"/>
  </svg>
)

// ── Category config (no Lucide) ────────────────────────────────────────────────
const CATEGORIES = [
  { key: "maintenance", label: "Maintenance", color: "#e17055", bg: "rgba(225,112,85,0.12)",  Ico: IcoWrench },
  { key: "utilities",   label: "Utilities",   color: "#74b9ff", bg: "rgba(116,185,255,0.12)", Ico: IcoZap    },
  { key: "supplies",    label: "Supplies",    color: "#fdcb6e", bg: "rgba(253,203,110,0.12)", Ico: IcoCart   },
  { key: "staff",       label: "Staff",       color: "#a29bfe", bg: "rgba(162,155,254,0.12)", Ico: IcoUsers  },
  { key: "food",        label: "Food & Bev",  color: "#00b894", bg: "rgba(0,184,148,0.12)",   Ico: IcoCoffee },
  { key: "other",       label: "Other",       color: "rgba(240,240,248,0.4)", bg: "rgba(255,255,255,0.07)", Ico: IcoDots },
]
const CAT_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]))

interface Expense {
  id: string
  category?: string | null
  description?: string | null
  amount: number
  date: string
  paid_by?: string | null
  notes?: string | null
  created_at?: string | null
}

const BLANK = {
  category: "maintenance", description: "", amount: "",
  date: new Date().toISOString().split("T")[0], paid_by: "", notes: "",
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&#215;</button>
        <div className="modal-title">{title}</div>
        {children}
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: "var(--bg-elevated)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
      <div style={{ fontSize: "11px", color: "rgba(240,240,248,0.4)", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontFamily: '"DM Mono",monospace', fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{fmt(payload[0].value)}</div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ExpensesClient() {
  const db = createClient() as any

  const [expenses, setExpenses]     = useState<Expense[]>([])
  const [isMobile, setIsMobile]     = useState(false)
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState("")
  const [filterCat, setFilterCat]   = useState("all")
  const [showAdd, setShowAdd]       = useState(false)
  const [saving, setSaving]         = useState(false)
  const [form, setForm]             = useState(BLANK)

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
      const { data } = await db
        .from("expenses")
        .select("id, category, description, amount, date, paid_by, notes, created_at")
        .order("date", { ascending: false })
      setExpenses((data as Expense[]) || [])
    } catch { toast.error("Failed to load expenses") }
    finally { setLoading(false) }
  }

  async function saveExpense() {
    if (!form.description.trim()) { toast.error("Description is required"); return }
    const amount = parseFloat(form.amount)
    if (!amount || amount <= 0) { toast.error("Enter a valid amount"); return }
    if (!form.date) { toast.error("Date is required"); return }
    setSaving(true)
    try {
      const { error } = await db.from("expenses").insert({
        category: form.category, description: form.description.trim(),
        amount, date: form.date, paid_by: form.paid_by || null, notes: form.notes || null,
      })
      if (error) throw error
      toast.success("Expense recorded")
      setShowAdd(false); setForm(BLANK); fetchAll()
    } catch { toast.error("Failed to save expense") }
    finally { setSaving(false) }
  }

  const now              = new Date()
  const thisMonth        = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0")
  const thisMonthExp     = expenses.filter((e) => e.date.startsWith(thisMonth))
  const thisMonthTotal   = thisMonthExp.reduce((s, e) => s + e.amount, 0)
  const allTotal         = expenses.reduce((s, e) => s + e.amount, 0)

  const catTotals = CATEGORIES.map((c) => ({
    ...c,
    total: thisMonthExp.filter((e) => e.category === c.key).reduce((s, e) => s + e.amount, 0),
  })).filter((c) => c.total > 0).sort((a, b) => b.total - a.total)

  const trendDays: { label: string; amount: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d  = new Date(); d.setDate(d.getDate() - i)
    const ds = d.toISOString().split("T")[0]
    trendDays.push({
      label:  d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      amount: expenses.filter((e) => e.date === ds).reduce((s, e) => s + e.amount, 0),
    })
  }

  const filtered = expenses.filter((e) => {
    if (filterCat !== "all" && e.category !== filterCat) return false
    if (search) {
      const q = search.toLowerCase()
      return (e.description || "").toLowerCase().includes(q) || (e.category || "").toLowerCase().includes(q) || (e.paid_by || "").toLowerCase().includes(q)
    }
    return true
  })

  const p   = isMobile ? "12px" : "28px"
  const gap = isMobile ? "10px" : "14px"

  const statCards = [
    { label: "This Month",  value: fmt(thisMonthTotal),          Ico: IcoTrend,   accent: "#e17055", bg: "rgba(225,112,85,0.1)",   border: "rgba(225,112,85,0.22)"   },
    { label: "All Time",    value: fmt(allTotal),                Ico: IcoCal,     accent: "#fdcb6e", bg: "rgba(253,203,110,0.1)",  border: "rgba(253,203,110,0.22)"  },
    { label: "Records",     value: String(thisMonthExp.length),  Ico: IcoReceipt, accent: "#74b9ff", bg: "rgba(116,185,255,0.1)",  border: "rgba(116,185,255,0.22)"  },
  ]

  if (loading) return (
    <div style={{ padding: p, overflowX: "hidden", width: "100%", boxSizing: "border-box" }}>
      <div className="skeleton" style={{ height: "56px", borderRadius: "0", marginBottom: "16px" }} />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap, marginBottom: gap }}>
        {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: "90px", borderRadius: "12px" }} />)}
      </div>
      <div className="skeleton" style={{ height: "220px", borderRadius: "12px", marginBottom: gap }} />
      <div className="skeleton" style={{ height: "400px", borderRadius: "12px" }} />
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
          <div style={{ fontSize: isMobile ? "15px" : "16px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
            Expenses
          </div>
          {!isMobile && (
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>
              {expenses.length} records &middot; {fmt(thisMonthTotal)} this month
            </div>
          )}
        </div>
        <button
          onClick={fetchAll}
          style={{ height: "32px", padding: "0 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(240,240,248,0.6)", fontSize: "12px", fontWeight: 500, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "all 150ms ease" }}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.09)";e.currentTarget.style.color="rgba(240,240,248,0.9)"}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.color="rgba(240,240,248,0.6)"}}
        >
          <IcoRefresh />{!isMobile && "Refresh"}
        </button>
        <button
          onClick={() => { setForm(BLANK); setShowAdd(true) }}
          style={{ height: "32px", padding: "0 14px", background: "var(--accent)", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px", fontWeight: 600, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 0 18px rgba(108,92,231,0.3)", transition: "all 150ms ease", letterSpacing: "-0.1px" }}
          onMouseEnter={e=>{e.currentTarget.style.background="#7d6ff0";e.currentTarget.style.boxShadow="0 0 24px rgba(108,92,231,0.45)"}}
          onMouseLeave={e=>{e.currentTarget.style.background="var(--accent)";e.currentTarget.style.boxShadow="0 0 18px rgba(108,92,231,0.3)"}}
        >
          <IcoPlus />{!isMobile && "Add Expense"}
        </button>
      </div>

      {/* ── Page content ── */}
      <div style={{ padding: p, maxWidth: "1400px", margin: "0 auto" }}>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap, marginBottom: gap }}>
          {statCards.map((card) => {
            const { Ico } = card
            return (
              <div key={card.label} style={{
                background: "var(--bg-surface)", border: "1px solid var(--border)",
                borderRadius: "12px", padding: isMobile ? "13px 14px" : "18px 20px",
                position: "relative", overflow: "hidden",
                transition: "border-color 150ms ease, transform 150ms ease",
              }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=card.border;e.currentTarget.style.transform="translateY(-1px)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="translateY(0)"}}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: card.accent, borderRadius: "12px 12px 0 0", opacity: 0.8 }} />
                <div style={{ position: "absolute", top: 0, right: 0, width: "70px", height: "70px", background: "radial-gradient(circle at top right," + card.bg + ",transparent 70%)", pointerEvents: "none" }} />
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(240,240,248,0.38)", textTransform: "uppercase", letterSpacing: "0.55px", marginBottom: "7px" }}>{card.label}</div>
                    <div style={{ fontFamily: '"DM Mono",monospace', fontSize: isMobile ? "17px" : "22px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.5px", lineHeight: 1.1 }}>{card.value}</div>
                  </div>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: card.accent }}>
                    <Ico />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.6fr 1fr", gap, marginBottom: gap }}>

          {/* 30-day trend */}
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: isMobile ? "14px" : "20px" }}>
            <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(240,240,248,0.38)", textTransform: "uppercase", letterSpacing: "0.55px", marginBottom: "3px" }}>30-Day Trend</div>
            <div style={{ fontSize: "12px", color: "rgba(240,240,248,0.4)", marginBottom: "16px" }}>Daily spend over the last month</div>
            <ResponsiveContainer width="100%" height={isMobile ? 140 : 180}>
              <AreaChart data={trendDays} margin={{ top: 5, right: 5, left: isMobile ? -20 : 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#e17055" stopOpacity={0.28}/>
                    <stop offset="95%" stopColor="#e17055" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                <XAxis dataKey="label" tick={{ fill: "rgba(240,240,248,0.3)", fontSize: isMobile ? 9 : 11 }} axisLine={false} tickLine={false} interval={6}/>
                <YAxis tick={{ fill: "rgba(240,240,248,0.3)", fontSize: isMobile ? 9 : 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? Math.round(v/1000) + "k" : String(v)} width={isMobile ? 30 : 38}/>
                <Tooltip content={<CustomTooltip />}/>
                <Area type="monotone" dataKey="amount" stroke="#e17055" strokeWidth={2}
                  fill="url(#expGrad)" dot={false} activeDot={{ r: 4, fill: "#e17055", strokeWidth: 0 }}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category breakdown */}
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: isMobile ? "14px" : "20px" }}>
            <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(240,240,248,0.38)", textTransform: "uppercase", letterSpacing: "0.55px", marginBottom: "3px" }}>By Category</div>
            <div style={{ fontSize: "12px", color: "rgba(240,240,248,0.4)", marginBottom: "16px" }}>This month breakdown</div>
            {catTotals.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100px" }}>
                <div style={{ fontSize: "13px", color: "rgba(240,240,248,0.3)" }}>No expenses this month</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {catTotals.slice(0, 5).map((c) => {
                  const pct = thisMonthTotal > 0 ? (c.total / thisMonthTotal) * 100 : 0
                  const { Ico } = c
                  return (
                    <div key={c.key}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                          <div style={{ width: "22px", height: "22px", borderRadius: "6px", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: c.color }}>
                            <Ico />
                          </div>
                          <span style={{ fontSize: "12px", color: "rgba(240,240,248,0.6)", fontWeight: 500 }}>{c.label}</span>
                        </div>
                        <span style={{ fontFamily: '"DM Mono",monospace', fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{fmt(c.total)}</span>
                      </div>
                      <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: pct + "%", background: c.color, borderRadius: "99px", transition: "width 600ms ease" }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ marginBottom: "14px", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div style={{ display: "flex", gap: "3px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "3px", width: "fit-content", minWidth: "100%" }}>
            <button onClick={() => setFilterCat("all")} style={{
              flexShrink: 0, height: "28px", padding: "0 11px",
              borderRadius: "7px", border: "none",
              fontSize: "12px", fontWeight: 500, fontFamily: '"DM Sans",sans-serif',
              cursor: "pointer", display: "flex", alignItems: "center", gap: "5px",
              transition: "all 150ms ease",
              background: filterCat === "all" ? "var(--bg-elevated)" : "transparent",
              color: filterCat === "all" ? "var(--text-primary)" : "rgba(240,240,248,0.45)",
            }}>
              All
              <span style={{ background: filterCat === "all" ? "rgba(108,92,231,0.2)" : "rgba(255,255,255,0.07)", color: filterCat === "all" ? "var(--accent-light)" : "rgba(240,240,248,0.35)", borderRadius: "99px", fontSize: "10px", fontWeight: 700, padding: "1px 6px" }}>
                {expenses.length}
              </span>
            </button>
            {CATEGORIES.map((c) => {
              const cnt    = expenses.filter((e) => e.category === c.key).length
              const active = filterCat === c.key
              const { Ico } = c
              return (
                <button key={c.key} onClick={() => setFilterCat(c.key)} style={{
                  flexShrink: 0, height: "28px", padding: "0 10px",
                  borderRadius: "7px", border: "none",
                  fontSize: "11px", fontWeight: 500, fontFamily: '"DM Sans",sans-serif',
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "5px",
                  transition: "all 150ms ease",
                  background: active ? "var(--bg-elevated)" : "transparent",
                  color: active ? c.color : "rgba(240,240,248,0.45)",
                }}>
                  <span style={{ color: active ? c.color : "rgba(240,240,248,0.35)" }}><Ico /></span>
                  {c.label}
                  <span style={{ background: active ? c.bg : "rgba(255,255,255,0.07)", color: active ? c.color : "rgba(240,240,248,0.35)", borderRadius: "99px", fontSize: "9px", fontWeight: 700, padding: "1px 5px" }}>
                    {cnt}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", marginBottom: "16px", maxWidth: isMobile ? "100%" : "360px" }}>
          <span style={{ position: "absolute", left: "11px", color: "rgba(240,240,248,0.3)", display: "flex" }}><IcoSearch /></span>
          <input
            style={{ width: "100%", height: "36px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "9px", padding: "0 36px 0 34px", fontSize: "13px", fontFamily: '"DM Sans",sans-serif', color: "var(--text-primary)", outline: "none", transition: "border-color 150ms ease" }}
            placeholder="Search by description or category..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            onFocus={e=>{e.currentTarget.style.borderColor="rgba(108,92,231,0.5)"}}
            onBlur={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"}}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: "10px", background: "none", border: "none", color: "rgba(240,240,248,0.35)", cursor: "pointer", display: "flex", alignItems: "center", padding: "2px" }}>
              <IcoX />
            </button>
          )}
        </div>

        {/* Empty */}
        {filtered.length === 0 && (
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "60px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "13px", color: "rgba(240,240,248,0.35)", marginBottom: "8px" }}>
              {search ? "No expenses match your search" : filterCat !== "all" ? "No expenses in this category" : "Record your first expense"}
            </div>
            {!search && filterCat === "all" && (
              <button onClick={() => setShowAdd(true)} style={{ marginTop: "12px", height: "32px", padding: "0 14px", background: "var(--accent)", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px", fontWeight: 600, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <IcoPlus /> Add Expense
              </button>
            )}
          </div>
        )}

        {/* ── Mobile Cards ── */}
        {filtered.length > 0 && isMobile && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filtered.map((e) => {
              const cat = CAT_MAP[e.category || "other"] || CAT_MAP.other
              const { Ico } = cat
              return (
                <div key={e.id} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "13px 14px", transition: "border-color 150ms ease" }}
                  onMouseEnter={el=>{el.currentTarget.style.borderColor="rgba(255,255,255,0.13)"}}
                  onMouseLeave={el=>{el.currentTarget.style.borderColor="var(--border)"}}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                      <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: cat.color }}>
                        <Ico />
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: 600, color: cat.color, textTransform: "uppercase", letterSpacing: "0.4px" }}>{cat.label}</div>
                        <div style={{ fontFamily: '"DM Mono",monospace', fontSize: "11px", color: "rgba(240,240,248,0.4)", marginTop: "1px" }}>{fmtDate(e.date)}</div>
                      </div>
                    </div>
                    <div style={{ fontFamily: '"DM Mono",monospace', fontSize: "15px", fontWeight: 700, color: "#e17055" }}>{fmt(e.amount)}</div>
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 500 }}>{e.description || "—"}</div>
                  {e.paid_by && <div style={{ fontSize: "11px", color: "rgba(240,240,248,0.4)", marginTop: "4px" }}>Paid by: {e.paid_by}</div>}
                  {e.notes && <div style={{ fontSize: "11px", color: "rgba(240,240,248,0.35)", marginTop: "2px" }}>{e.notes}</div>}
                </div>
              )
            })}
          </div>
        )}

        {/* ── Desktop Table ── */}
        {filtered.length > 0 && !isMobile && (
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.025)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    {["Date","Category","Description","Paid By","Amount"].map((h) => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "rgba(240,240,248,0.35)", textTransform: "uppercase", letterSpacing: "0.55px", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => {
                    const cat = CAT_MAP[e.category || "other"] || CAT_MAP.other
                    const { Ico } = cat
                    return (
                      <tr key={e.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 120ms ease" }}
                        onMouseEnter={el=>{el.currentTarget.style.background="rgba(255,255,255,0.025)"}}
                        onMouseLeave={el=>{el.currentTarget.style.background="transparent"}}
                      >
                        <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                          <span style={{ fontFamily: '"DM Mono",monospace', fontSize: "12px", color: "rgba(240,240,248,0.45)" }}>{fmtDate(e.date)}</span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: cat.color }}>
                              <Ico />
                            </div>
                            <span style={{ fontSize: "12px", fontWeight: 600, color: cat.color }}>{cat.label}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 500 }}>{e.description || "—"}</div>
                          {e.notes && <div style={{ fontSize: "11px", color: "rgba(240,240,248,0.38)", marginTop: "2px" }}>{e.notes}</div>}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "12px", color: "rgba(240,240,248,0.5)" }}>{e.paid_by || "—"}</td>
                        <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                          <span style={{ fontFamily: '"DM Mono",monospace', fontSize: "13px", fontWeight: 700, color: "#e17055" }}>{fmt(e.amount)}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Add Expense Modal ── */}
      {showAdd && (
        <Modal title="Add Expense" onClose={() => setShowAdd(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <input className="form-input" placeholder="e.g. AC repair in Room 203"
                value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Amount (&#8377;) *</label>
                <input className="form-input" style={{ fontFamily: '"DM Mono",monospace' }} type="number" placeholder="e.g. 1500"
                  value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Paid By</label>
                <input className="form-input" placeholder="e.g. Manager / Petty Cash"
                  value={form.paid_by} onChange={(e) => setForm((p) => ({ ...p, paid_by: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" placeholder="Optional additional notes..."
                value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveExpense} disabled={saving}>
              {saving ? "Saving..." : "Add Expense"}
            </button>
          </div>
        </Modal>
      )}

    </div>
  )
}
