"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  TrendingDown, Plus, RefreshCw, Search, X,
  ShoppingCart, Zap, Wrench, Users, Coffee,
  MoreHorizontal, Calendar
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from "recharts"

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

const CATEGORIES = [
  { key: "maintenance",  label: "Maintenance",  color: "var(--red)",    bg: "var(--red-bg)",    icon: Wrench        },
  { key: "utilities",    label: "Utilities",    color: "var(--blue)",   bg: "var(--blue-bg)",   icon: Zap           },
  { key: "supplies",     label: "Supplies",     color: "var(--amber)",  bg: "var(--amber-bg)",  icon: ShoppingCart  },
  { key: "staff",        label: "Staff",        color: "var(--purple)", bg: "var(--purple-bg)", icon: Users         },
  { key: "food",         label: "Food & Bev",   color: "var(--green)",  bg: "var(--green-bg)",  icon: Coffee        },
  { key: "other",        label: "Other",        color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.07)", icon: MoreHorizontal },
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
    <div style={{
      background: "var(--bg-elevated)", border: "1px solid var(--border-hover)",
      borderRadius: "var(--radius-md)", padding: "10px 14px", boxShadow: "var(--shadow-card)",
    }}>
      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontFamily: '"DM Mono", monospace', fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
        {fmt(payload[0].value)}
      </div>
    </div>
  )
}

export default function ExpensesClient() {
  const db = createClient() as any

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterCat, setFilterCat] = useState("all")
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(BLANK)

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
        category: form.category,
        description: form.description.trim(),
        amount,
        date: form.date,
        paid_by: form.paid_by || null,
        notes: form.notes || null,
      })
      if (error) throw error
      toast.success("Expense recorded")
      setShowAdd(false)
      setForm(BLANK)
      fetchAll()
    } catch { toast.error("Failed to save expense") }
    finally { setSaving(false) }
  }

  // This month total
  const now = new Date()
  const thisMonth = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0")
  const thisMonthExpenses = expenses.filter((e) => e.date.startsWith(thisMonth))
  const thisMonthTotal = thisMonthExpenses.reduce((s, e) => s + e.amount, 0)
  const allTotal = expenses.reduce((s, e) => s + e.amount, 0)

  // Category totals for this month
  const catTotals = CATEGORIES.map((c) => ({
    ...c,
    total: thisMonthExpenses.filter((e) => e.category === c.key).reduce((s, e) => s + e.amount, 0),
  })).filter((c) => c.total > 0).sort((a, b) => b.total - a.total)

  // 30-day trend
  const trendDays: { label: string; amount: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const ds = d.toISOString().split("T")[0]
    const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    trendDays.push({
      label,
      amount: expenses.filter((e) => e.date === ds).reduce((s, e) => s + e.amount, 0),
    })
  }

  const filtered = expenses.filter((e) => {
    if (filterCat !== "all" && e.category !== filterCat) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        (e.description || "").toLowerCase().includes(q) ||
        (e.category || "").toLowerCase().includes(q) ||
        (e.paid_by || "").toLowerCase().includes(q)
      )
    }
    return true
  })

  if (loading) return (
    <div style={{ padding: "28px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "20px" }}>
        {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: "90px", borderRadius: "16px" }} />)}
      </div>
      <div className="skeleton" style={{ height: "220px", borderRadius: "16px", marginBottom: "16px" }} />
      <div className="skeleton" style={{ height: "400px", borderRadius: "16px" }} />
    </div>
  )

  return (
    <div style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-sub">{expenses.length} total records</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchAll}><RefreshCw size={13} /> Refresh</button>
          <button className="btn btn-primary btn-sm" onClick={() => { setForm(BLANK); setShowAdd(true) }}>
            <Plus size={13} /> Add Expense
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "This Month",  value: fmt(thisMonthTotal), color: "var(--red)",    bg: "var(--red-bg)",    icon: TrendingDown },
          { label: "All Time",    value: fmt(allTotal),       color: "var(--amber)",  bg: "var(--amber-bg)",  icon: Calendar     },
          { label: "This Month Records", value: String(thisMonthExpenses.length), color: "var(--blue)", bg: "var(--blue-bg)", icon: ShoppingCart },
        ].map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="stat-card animate-fade-in">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div className="stat-label">{card.label}</div>
                  <div className="stat-value" style={{ marginTop: "8px" }}>{card.value}</div>
                </div>
                <div className="stat-icon" style={{ background: card.bg }}>
                  <Icon size={18} color={card.color} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "16px", marginBottom: "24px" }}>

        {/* 30-day trend */}
        <div className="card-surface animate-fade-in-1" style={{ padding: "20px" }}>
          <div className="section-label" style={{ marginBottom: "4px" }}>30-Day Expense Trend</div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>Daily spend over the last month</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trendDays} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e17055" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#e17055" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "rgba(240,240,248,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} interval={6} />
              <YAxis tick={{ fill: "rgba(240,240,248,0.35)", fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v >= 1000 ? Math.round(v/1000) + "k" : String(v)} width={36} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="amount" stroke="#e17055" strokeWidth={2}
                fill="url(#expGrad)" dot={false} activeDot={{ r: 4, fill: "#e17055", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown */}
        <div className="card-surface animate-fade-in-1" style={{ padding: "20px" }}>
          <div className="section-label" style={{ marginBottom: "4px" }}>This Month by Category</div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>Spend breakdown</div>
          {catTotals.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "140px" }}>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>No expenses this month</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {catTotals.slice(0, 5).map((c) => {
                const pct = thisMonthTotal > 0 ? (c.total / thisMonthTotal) * 100 : 0
                const Icon = c.icon
                return (
                  <div key={c.key}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                        <div style={{ width: "22px", height: "22px", borderRadius: "6px", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon size={12} color={c.color} strokeWidth={2.5} />
                        </div>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>{c.label}</span>
                      </div>
                      <span style={{ fontFamily: '"DM Mono", monospace', fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {fmt(c.total)}
                      </span>
                    </div>
                    <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: pct + "%", background: c.color, borderRadius: "99px", transition: "width 600ms ease" }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Filter + Search */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
        <div className="filter-tabs" style={{ flex: 1, minWidth: 0 }}>
          <button className={"filter-tab" + (filterCat === "all" ? " active" : "")} onClick={() => setFilterCat("all")}>
            All <span className="tab-count">{expenses.length}</span>
          </button>
          {CATEGORIES.map((c) => {
            const cnt = expenses.filter((e) => e.category === c.key).length
            return (
              <button key={c.key} className={"filter-tab" + (filterCat === c.key ? " active" : "")} onClick={() => setFilterCat(c.key)}>
                {c.label} <span className="tab-count">{cnt}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="search-wrap" style={{ marginBottom: "20px", maxWidth: "360px" }}>
        <Search size={15} className="search-icon" />
        <input className="search-input" placeholder="Search by description or category..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
        {search && (
          <button onClick={() => setSearch("")} style={{
            position: "absolute", right: "10px", background: "none", border: "none",
            color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center",
          }}><X size={13} /></button>
        )}
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="card-surface">
          <div className="empty-state">
            <TrendingDown size={40} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
            <div className="empty-state-title">No expenses found</div>
            <div className="empty-state-sub">
              {search ? "No expenses match your search" : filterCat !== "all" ? "No expenses in this category" : "Record your first expense"}
            </div>
            {!search && filterCat === "all" && (
              <button className="btn btn-primary btn-sm" style={{ marginTop: "20px" }} onClick={() => setShowAdd(true)}>
                <Plus size={13} /> Add Expense
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="card-surface" style={{ overflow: "hidden" }}>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Paid By</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const cat = CAT_MAP[e.category || "other"] || CAT_MAP.other
                  const Icon = cat.icon
                  return (
                    <tr key={e.id}>
                      <td>
                        <span style={{ fontFamily: '"DM Mono", monospace', fontSize: "12px", color: "var(--text-muted)" }}>
                          {fmtDate(e.date)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "24px", height: "24px", borderRadius: "7px", background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Icon size={12} color={cat.color} strokeWidth={2.5} />
                          </div>
                          <span style={{ fontSize: "12px", fontWeight: 500, color: cat.color }}>{cat.label}</span>
                        </div>
                      </td>
                      <td style={{ color: "var(--text-primary)", fontSize: "13px" }}>
                        {e.description || "—"}
                        {e.notes && (
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{e.notes}</div>
                        )}
                      </td>
                      <td style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                        {e.paid_by || "—"}
                      </td>
                      <td>
                        <span style={{ fontFamily: '"DM Mono", monospace', fontSize: "13px", fontWeight: 600, color: "var(--red)" }}>
                          {fmt(e.amount)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAdd && (
        <Modal title="Add Expense" onClose={() => setShowAdd(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={form.date}
                  onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <input className="form-input" placeholder="e.g. AC repair in Room 203"
                value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Amount (&#8377;) *</label>
                <input className="form-input" style={{ fontFamily: '"DM Mono", monospace' }}
                  type="number" placeholder="e.g. 1500"
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
