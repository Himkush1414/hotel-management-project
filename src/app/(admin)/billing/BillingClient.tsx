"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  Receipt, RefreshCw, Search, X, Plus,
  TrendingUp, Clock, CheckCircle, DollarSign
} from "lucide-react"

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

const STATUSES = ["all", "pending", "partial", "paid", "refunded"]

const STATUS_META: Record<string, { label: string; pill: string; color: string }> = {
  pending:  { label: "Pending",  pill: "pill-amber",  color: "var(--amber)"  },
  partial:  { label: "Partial",  pill: "pill-blue",   color: "var(--blue)"   },
  paid:     { label: "Paid",     pill: "pill-green",  color: "var(--green)"  },
  refunded: { label: "Refunded", pill: "pill-purple", color: "var(--purple)" },
}

const PAYMENT_MODES = ["cash", "upi", "card", "bank_transfer", "cheque", "other"]

interface Guest { id: string; name?: string | null; full_name?: string | null; phone?: string | null }
interface Room  { id: string; room_number: string }
interface Invoice {
  id: string
  invoice_number?: string | null
  status: string
  total_amount: number
  paid_amount?: number | null
  tax_amount?: number | null
  subtotal?: number | null
  created_at: string
  due_date?: string | null
  notes?: string | null
  booking?: {
    id: string
    check_in_date: string
    check_out_date: string
    guest?: Guest | null
    room?: Room | null
  } | null
}

const avatarColors = [
  ["#6c5ce7","#a29bfe"],["#00b894","#55efc4"],["#74b9ff","#0984e3"],
  ["#fdcb6e","#e17055"],["#fd79a8","#e84393"],
]
function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return avatarColors[Math.abs(h) % avatarColors.length]
}
function Avatar({ name, size = 30 }: { name: string; size?: number }) {
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

function Modal({ title, onClose, wide, children }: {
  title: string; onClose: () => void; wide?: boolean; children: React.ReactNode
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={"modal-container" + (wide ? " modal-container-lg" : "")} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&#215;</button>
        <div className="modal-title">{title}</div>
        {children}
      </div>
    </div>
  )
}

export default function BillingClient() {
  const db = createClient() as any

  const [invoices, setInvoices] = useState<Invoice[]>([])

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)
  const [payInvoice, setPayInvoice] = useState<Invoice | null>(null)
  const [saving, setSaving] = useState(false)
  const [payForm, setPayForm] = useState({ amount: "", mode: "cash", notes: "" })

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const { data } = await db
        .from("invoices")
        .select("id, invoice_number, status, total_amount, paid_amount, tax_amount, subtotal, created_at, due_date, notes, booking:bookings(id, check_in_date, check_out_date, guest:guests(id, name, full_name, phone), room:rooms(id, room_number))")
        .order("created_at", { ascending: false })
      setInvoices((data as Invoice[]) || [])
    } catch { toast.error("Failed to load invoices") }
    finally { setLoading(false) }
  }

  async function recordPayment() {
    if (!payInvoice) return
    const amount = parseFloat(payForm.amount)
    if (!amount || amount <= 0) { toast.error("Enter a valid amount"); return }
    setSaving(true)
    try {
      const prevPaid = payInvoice.paid_amount || 0
      const newPaid = prevPaid + amount
      const newStatus = newPaid >= payInvoice.total_amount ? "paid" : "partial"
      const { error } = await db
        .from("invoices")
        .update({ paid_amount: newPaid, status: newStatus })
        .eq("id", payInvoice.id)
      if (error) throw error
      // log payment if payments table exists
      await db.from("payments").insert({
        invoice_id: payInvoice.id,
        amount,
        payment_mode: payForm.mode,
        notes: payForm.notes || null,
      }).then(() => {}).catch(() => {})
      toast.success("Payment of " + fmt(amount) + " recorded")
      setPayInvoice(null)
      setPayForm({ amount: "", mode: "cash", notes: "" })
      fetchAll()
    } catch { toast.error("Failed to record payment") }
    finally { setSaving(false) }
  }

  const guestName = (inv: Invoice) => {
    const g = inv.booking?.guest
    return g?.name || g?.full_name || "Unknown"
  }

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = s === "all" ? invoices.length : invoices.filter((i) => i.status === s).length
    return acc
  }, {} as Record<string, number>)

  const totalRevenue  = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total_amount, 0)
  const totalPending  = invoices.filter((i) => i.status === "pending" || i.status === "partial").reduce((s, i) => s + (i.total_amount - (i.paid_amount || 0)), 0)
  const paidCount     = counts.paid || 0

  const filtered = invoices.filter((inv) => {
    if (filter !== "all" && inv.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      const name = guestName(inv).toLowerCase()
      const num = (inv.invoice_number || "").toLowerCase()
      const room = (inv.booking?.room?.room_number || "").toLowerCase()
      if (!name.includes(q) && !num.includes(q) && !room.includes(q)) return false
    }
    return true
  })

  if (loading) return (
    <div style={{ padding: isMobile ? "12px" : "28px" }}>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isMobile ? "10px" : "16px", marginBottom: isMobile ? "14px" : "20px" }}>
        {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: "90px", borderRadius: "16px" }} />)}
      </div>
      <div className="skeleton" style={{ height: "500px", borderRadius: "16px" }} />
    </div>
  )

  return (
    <div style={{ padding: isMobile ? "12px" : "28px", maxWidth: "1400px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isMobile ? "16px" : "24px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 className="page-title" style={{ fontSize: isMobile ? "18px" : undefined }}>Billing</h1>
          <p className="page-sub">{invoices.length} invoices total</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchAll}><RefreshCw size={13} /> Refresh</button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isMobile ? "10px" : "16px", marginBottom: isMobile ? "14px" : "24px" }}>
        {[
          { label: "Total Revenue",   value: fmt(totalRevenue),  icon: TrendingUp,   color: "var(--green)",  bg: "var(--green-bg)"  },
          { label: "Pending Amount",  value: fmt(totalPending),  icon: Clock,        color: "var(--amber)",  bg: "var(--amber-bg)"  },
          { label: "Paid Invoices",   value: String(paidCount),  icon: CheckCircle,  color: "var(--blue)",   bg: "var(--blue-bg)"   },
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

      {/* Filter Tabs + Search */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
        <div className="filter-tabs" style={{ flex: 1, minWidth: 0, overflowX: "auto" }}>
          {STATUSES.map((s) => (
            <button key={s} className={"filter-tab" + (filter === s ? " active" : "")} onClick={() => setFilter(s)}>
              {s === "all" ? "All" : STATUS_META[s]?.label || s}
              <span className="tab-count">{counts[s] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="search-wrap" style={{ marginBottom: "16px", maxWidth: isMobile ? "100%" : "360px" }}>
        <Search size={15} className="search-icon" />
        <input className="search-input" placeholder="Search by guest, invoice # or room..."
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
            <Receipt size={40} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
            <div className="empty-state-title">No invoices found</div>
            <div className="empty-state-sub">
              {search ? "No invoices match your search" : filter !== "all" ? "No invoices with this status" : "Invoices are created automatically with bookings"}
            </div>
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
                  <th>Invoice #</th>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Date</th>
                  <th>Subtotal</th>
                  <th>Tax</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => {
                  const meta = STATUS_META[inv.status] || STATUS_META.pending
                  const name = guestName(inv)
                  const balance = inv.total_amount - (inv.paid_amount || 0)
                  return (
                    <tr key={inv.id} style={{ cursor: "pointer" }} onClick={() => setViewInvoice(inv)}>
                      <td>
                        <span style={{ fontFamily: '"DM Mono", monospace', fontSize: "12px", fontWeight: 600, color: "var(--accent-light)" }}>
                          {inv.invoice_number || inv.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Avatar name={name} size={28} />
                          <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>{name}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: '"DM Mono", monospace', fontWeight: 600, color: "var(--text-secondary)" }}>
                          {inv.booking?.room?.room_number || "—"}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: '"DM Mono", monospace', fontSize: "12px", color: "var(--text-muted)" }}>
                          {fmtDate(inv.created_at)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: '"DM Mono", monospace', color: "var(--text-secondary)" }}>
                          {fmt(inv.subtotal || inv.total_amount)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: '"DM Mono", monospace', color: "var(--text-muted)" }}>
                          {fmt(inv.tax_amount || 0)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: '"DM Mono", monospace', fontWeight: 600, color: "var(--text-primary)" }}>
                          {fmt(inv.total_amount)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: '"DM Mono", monospace', color: inv.status === "paid" ? "var(--green)" : "var(--text-secondary)" }}>
                          {fmt(inv.paid_amount || 0)}
                        </span>
                      </td>
                      <td><span className={"pill " + meta.pill}>{meta.label}</span></td>
                      <td onClick={(e) => e.stopPropagation()}>
                        {(inv.status === "pending" || inv.status === "partial") && (
                          <button className="btn btn-secondary btn-sm" style={{ fontSize: "11px", color: "var(--green)", borderColor: "var(--green-border)" }}
                            onClick={() => { setPayInvoice(inv); setPayForm({ amount: String(balance), mode: "cash", notes: "" }) }}>
                            <DollarSign size={11} /> Pay
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {viewInvoice && (
        <Modal title="Invoice Details" wide onClose={() => setViewInvoice(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <div style={{ fontFamily: '"DM Mono", monospace', fontSize: "18px", fontWeight: 700, color: "var(--accent-light)", letterSpacing: "-0.3px" }}>
                  {viewInvoice.invoice_number || viewInvoice.id.slice(0, 8).toUpperCase()}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Issued {fmtDate(viewInvoice.created_at)}
                </div>
              </div>
              <span className={"pill " + (STATUS_META[viewInvoice.status]?.pill || "pill-gray")} style={{ fontSize: "12px", padding: "4px 14px" }}>
                {STATUS_META[viewInvoice.status]?.label || viewInvoice.status}
              </span>
            </div>

            <div style={{ height: "1px", background: "var(--border)" }} />

            {/* Guest + Room */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "14px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Guest</div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Avatar name={guestName(viewInvoice)} size={32} />
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{guestName(viewInvoice)}</div>
                    {viewInvoice.booking?.guest?.phone && (
                      <div style={{ fontFamily: '"DM Mono", monospace', fontSize: "11px", color: "var(--text-muted)" }}>{viewInvoice.booking.guest.phone}</div>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "14px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Stay</div>
                <div style={{ fontFamily: '"DM Mono", monospace', fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Room {viewInvoice.booking?.room?.room_number || "—"}
                </div>
                {viewInvoice.booking && (
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                    {fmtDate(viewInvoice.booking.check_in_date)} → {fmtDate(viewInvoice.booking.check_out_date)}
                  </div>
                )}
              </div>
            </div>

            {/* Amount breakdown */}
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "16px", border: "1px solid var(--border)" }}>
              {[
                { label: "Subtotal",  value: fmt(viewInvoice.subtotal || viewInvoice.total_amount), muted: true },
                { label: "Tax",       value: fmt(viewInvoice.tax_amount || 0), muted: true },
                { label: "Total",     value: fmt(viewInvoice.total_amount), bold: true },
                { label: "Paid",      value: fmt(viewInvoice.paid_amount || 0), color: "var(--green)" },
                { label: "Balance",   value: fmt(viewInvoice.total_amount - (viewInvoice.paid_amount || 0)), color: viewInvoice.status === "paid" ? "var(--green)" : "var(--amber)" },
              ].map((row, idx) => (
                <div key={row.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 0",
                  borderTop: idx > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}>
                  <span style={{ fontSize: "13px", color: row.bold ? "var(--text-primary)" : "var(--text-muted)", fontWeight: row.bold ? 600 : 400 }}>
                    {row.label}
                  </span>
                  <span style={{ fontFamily: '"DM Mono", monospace', fontSize: row.bold ? "16px" : "13px", fontWeight: row.bold ? 700 : 500, color: row.color || (row.muted ? "var(--text-secondary)" : "var(--text-primary)") }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Pay button */}
            {(viewInvoice.status === "pending" || viewInvoice.status === "partial") && (
              <button className="btn btn-primary" style={{ background: "var(--green)", boxShadow: "0 2px 8px rgba(0,184,148,0.25)" }}
                onClick={() => {
                  const balance = viewInvoice.total_amount - (viewInvoice.paid_amount || 0)
                  setPayInvoice(viewInvoice)
                  setPayForm({ amount: String(balance), mode: "cash", notes: "" })
                  setViewInvoice(null)
                }}>
                <DollarSign size={14} /> Record Payment
              </button>
            )}
          </div>
        </Modal>
      )}

      {/* Record Payment Modal */}
      {payInvoice && (
        <Modal title={"Record Payment — " + (payInvoice.invoice_number || payInvoice.id.slice(0, 8).toUpperCase())} onClose={() => setPayInvoice(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* Balance info */}
            <div style={{ background: "var(--accent-glow)", border: "1px solid var(--border-active)", borderRadius: "12px", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Balance Due</div>
                <div style={{ fontFamily: '"DM Mono", monospace', fontSize: "20px", fontWeight: 700, color: "var(--accent-light)", marginTop: "2px" }}>
                  {fmt(payInvoice.total_amount - (payInvoice.paid_amount || 0))}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Total</div>
                <div style={{ fontFamily: '"DM Mono", monospace', fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", marginTop: "2px" }}>
                  {fmt(payInvoice.total_amount)}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Amount (&#8377;) *</label>
              <input className="form-input" style={{ fontFamily: '"DM Mono", monospace' }}
                type="number" placeholder="Enter amount"
                value={payForm.amount} onChange={(e) => setPayForm((p) => ({ ...p, amount: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Mode</label>
              <select className="form-select" value={payForm.mode}
                onChange={(e) => setPayForm((p) => ({ ...p, mode: e.target.value }))}>
                {PAYMENT_MODES.map((m) => (
                  <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1).replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" placeholder="Optional notes..."
                value={payForm.notes} onChange={(e) => setPayForm((p) => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setPayInvoice(null)}>Cancel</button>
            <button className="btn btn-primary" style={{ background: "var(--green)", boxShadow: "0 2px 8px rgba(0,184,148,0.2)" }}
              onClick={recordPayment} disabled={saving}>
              {saving ? "Recording..." : "Record Payment"}
            </button>
          </div>
        </Modal>
      )}

    </div>
  )
}
