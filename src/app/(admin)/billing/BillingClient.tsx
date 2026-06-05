"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

const STATUSES = ["all", "pending", "partial", "paid", "refunded"]

const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:  { label: "Pending",  color: "#fdcb6e", bg: "rgba(253,203,110,0.1)", border: "rgba(253,203,110,0.25)" },
  partial:  { label: "Partial",  color: "#74b9ff", bg: "rgba(116,185,255,0.1)", border: "rgba(116,185,255,0.25)" },
  paid:     { label: "Paid",     color: "#00b894", bg: "rgba(0,184,148,0.1)",   border: "rgba(0,184,148,0.25)"   },
  refunded: { label: "Refunded", color: "#a29bfe", bg: "rgba(162,155,254,0.1)", border: "rgba(162,155,254,0.25)" },
}

const PAYMENT_MODES = ["cash", "upi", "card", "bank_transfer", "cheque", "other"]

// ── SVG Icons ──────────────────────────────────────────────────────────────────
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
const IcoPay = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M6 1v10M3.5 4h4a1.5 1.5 0 010 3H3.5M3 4H2M3 7H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const IcoRevenue = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 12l3.5-4 2.5 2.5 4-5.5L14 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="2" cy="12" r="1.2" fill="currentColor"/>
  </svg>
)
const IcoClock = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M8 4.5v3.8l2.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoCheck = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M5 8l2.5 2.5 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoChevron = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M4 3l4 3-4 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ── Types ──────────────────────────────────────────────────────────────────────
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

function StatusPill({ status }: { status: string }) {
  const m = STATUS_META[status] || STATUS_META.pending
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      fontSize: "10px", fontWeight: 600, letterSpacing: "0.02em",
      padding: "3px 9px", borderRadius: "99px",
      color: m.color, background: m.bg, border: "1px solid " + m.border,
      whiteSpace: "nowrap",
    }}>
      {m.label}
    </span>
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

// ── Main Component ─────────────────────────────────────────────────────────────
export default function BillingClient() {
  const db = createClient() as any

  const [invoices, setInvoices]       = useState<Invoice[]>([])
  const [isMobile, setIsMobile]       = useState(false)
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState("all")
  const [search, setSearch]           = useState("")
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)
  const [payInvoice, setPayInvoice]   = useState<Invoice | null>(null)
  const [saving, setSaving]           = useState(false)
  const [payForm, setPayForm]         = useState({ amount: "", mode: "cash", notes: "" })

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
      const prevPaid  = payInvoice.paid_amount || 0
      const newPaid   = prevPaid + amount
      const newStatus = newPaid >= payInvoice.total_amount ? "paid" : "partial"
      const { error } = await db.from("invoices").update({ paid_amount: newPaid, status: newStatus }).eq("id", payInvoice.id)
      if (error) throw error
      await db.from("payments").insert({ invoice_id: payInvoice.id, amount, payment_mode: payForm.mode, notes: payForm.notes || null }).then(() => {}).catch(() => {})
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

  const counts       = STATUSES.reduce((acc, s) => { acc[s] = s === "all" ? invoices.length : invoices.filter((i) => i.status === s).length; return acc }, {} as Record<string, number>)
  const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total_amount, 0)
  const totalPending = invoices.filter((i) => i.status === "pending" || i.status === "partial").reduce((s, i) => s + (i.total_amount - (i.paid_amount || 0)), 0)
  const paidCount    = counts.paid || 0

  const filtered = invoices.filter((inv) => {
    if (filter !== "all" && inv.status !== filter) return false
    if (search) {
      const q    = search.toLowerCase()
      const name = guestName(inv).toLowerCase()
      const num  = (inv.invoice_number || "").toLowerCase()
      const room = (inv.booking?.room?.room_number || "").toLowerCase()
      if (!name.includes(q) && !num.includes(q) && !room.includes(q)) return false
    }
    return true
  })

  const p   = isMobile ? "12px" : "28px"
  const gap = isMobile ? "10px" : "14px"

  const statCards = [
    { label: "Total Revenue",  value: fmt(totalRevenue), Ico: IcoRevenue, accent: "#00b894", bg: "rgba(0,184,148,0.1)",   border: "rgba(0,184,148,0.22)"   },
    { label: "Pending Amount", value: fmt(totalPending), Ico: IcoClock,   accent: "#fdcb6e", bg: "rgba(253,203,110,0.1)", border: "rgba(253,203,110,0.22)" },
    { label: "Paid Invoices",  value: String(paidCount), Ico: IcoCheck,   accent: "#74b9ff", bg: "rgba(116,185,255,0.1)", border: "rgba(116,185,255,0.22)" },
  ]

  if (loading) return (
    <div style={{ padding: p, overflowX: "hidden", width: "100%", boxSizing: "border-box" }}>
      <div className="skeleton" style={{ height: "56px", borderRadius: "0", marginBottom: "16px" }} />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap, marginBottom: gap }}>
        {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: "90px", borderRadius: "12px" }} />)}
      </div>
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
            Billing
          </div>
          {!isMobile && (
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>
              {invoices.length} invoices &middot; {counts.paid || 0} paid
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
                    <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(240,240,248,0.38)", textTransform: "uppercase", letterSpacing: "0.55px", marginBottom: "7px" }}>
                      {card.label}
                    </div>
                    <div style={{ fontFamily: '"DM Mono",monospace', fontSize: isMobile ? "17px" : "22px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.5px", lineHeight: 1.1 }}>
                      {card.value}
                    </div>
                  </div>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: card.accent }}>
                    <Ico />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Filter tabs */}
        <div style={{ marginBottom: "14px", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div style={{ display: "flex", gap: "3px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "3px", width: "fit-content", minWidth: "100%" }}>
            {STATUSES.map((s) => (
              <button key={s} onClick={() => setFilter(s)} style={{
                flexShrink: 0, height: "28px", padding: "0 11px",
                borderRadius: "7px", border: "none",
                fontSize: "12px", fontWeight: 500, fontFamily: '"DM Sans",sans-serif',
                cursor: "pointer", display: "flex", alignItems: "center", gap: "5px",
                transition: "all 150ms ease",
                background: filter === s ? "var(--bg-elevated)" : "transparent",
                color: filter === s ? "var(--text-primary)" : "rgba(240,240,248,0.45)",
                boxShadow: filter === s ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
              }}>
                {s === "all" ? "All" : STATUS_META[s]?.label || s}
                <span style={{ background: filter === s ? "rgba(108,92,231,0.2)" : "rgba(255,255,255,0.07)", color: filter === s ? "var(--accent-light)" : "rgba(240,240,248,0.35)", borderRadius: "99px", fontSize: "10px", fontWeight: 700, padding: "1px 6px" }}>
                  {counts[s] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", marginBottom: "16px", maxWidth: isMobile ? "100%" : "360px" }}>
          <span style={{ position: "absolute", left: "11px", color: "rgba(240,240,248,0.3)", display: "flex" }}><IcoSearch /></span>
          <input
            style={{ width: "100%", height: "36px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "9px", padding: "0 36px 0 34px", fontSize: "13px", fontFamily: '"DM Sans",sans-serif', color: "var(--text-primary)", outline: "none", transition: "border-color 150ms ease" }}
            placeholder="Search by guest, invoice # or room..."
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
            <div style={{ fontSize: "13px", color: "rgba(240,240,248,0.35)" }}>
              {search ? "No invoices match your search" : filter !== "all" ? "No invoices with this status" : "Invoices are created automatically with bookings"}
            </div>
          </div>
        )}

        {/* ── Mobile Cards ── */}
        {filtered.length > 0 && isMobile && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filtered.map((inv) => {
              const meta    = STATUS_META[inv.status] || STATUS_META.pending
              const name    = guestName(inv)
              const balance = inv.total_amount - (inv.paid_amount || 0)
              return (
                <div key={inv.id}
                  onClick={() => setViewInvoice(inv)}
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "13px 14px", position: "relative", overflow: "hidden", cursor: "pointer", transition: "border-color 150ms ease" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.13)"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)"}}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: meta.color, borderRadius: "12px 12px 0 0", opacity: 0.8 }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <Avatar name={name} size={30} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                      <div style={{ fontFamily: '"DM Mono",monospace', fontSize: "11px", color: "var(--accent-light)" }}>
                        {inv.invoice_number || inv.id.slice(0, 8).toUpperCase()}
                      </div>
                    </div>
                    <StatusPill status={inv.status} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div style={{ fontSize: "11px", color: "rgba(240,240,248,0.4)" }}>
                      Room {inv.booking?.room?.room_number || "—"} &middot; {fmtDate(inv.created_at)}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: '"DM Mono",monospace', fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{fmt(inv.total_amount)}</div>
                      {inv.status !== "paid" && balance > 0 && (
                        <div style={{ fontFamily: '"DM Mono",monospace', fontSize: "11px", color: "#fdcb6e" }}>Due: {fmt(balance)}</div>
                      )}
                    </div>
                  </div>
                  {(inv.status === "pending" || inv.status === "partial") && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setPayInvoice(inv); setPayForm({ amount: String(balance), mode: "cash", notes: "" }) }}
                      style={{ marginTop: "10px", width: "100%", height: "30px", background: "rgba(0,184,148,0.1)", border: "1px solid rgba(0,184,148,0.25)", borderRadius: "7px", color: "#00b894", fontSize: "12px", fontWeight: 600, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", transition: "all 130ms ease" }}
                      onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,184,148,0.18)"}}
                      onMouseLeave={e=>{e.currentTarget.style.background="rgba(0,184,148,0.1)"}}
                    >
                      <IcoPay /> Record Payment
                    </button>
                  )}
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
                    {["Invoice #","Guest","Room","Date","Subtotal","Tax","Total","Paid","Status",""].map((h) => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "rgba(240,240,248,0.35)", textTransform: "uppercase", letterSpacing: "0.55px", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => {
                    const name    = guestName(inv)
                    const balance = inv.total_amount - (inv.paid_amount || 0)
                    return (
                      <tr key={inv.id}
                        onClick={() => setViewInvoice(inv)}
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", transition: "background 120ms ease" }}
                        onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.025)"}}
                        onMouseLeave={e=>{e.currentTarget.style.background="transparent"}}
                      >
                        <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                          <span style={{ fontFamily: '"DM Mono",monospace', fontSize: "12px", fontWeight: 600, color: "var(--accent-light)" }}>
                            {inv.invoice_number || inv.id.slice(0, 8).toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                            <Avatar name={name} size={28} />
                            <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontFamily: '"DM Mono",monospace', fontWeight: 600, color: "var(--text-primary)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "5px", padding: "2px 8px", fontSize: "12px" }}>
                            {inv.booking?.room?.room_number || "—"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                          <span style={{ fontFamily: '"DM Mono",monospace', fontSize: "12px", color: "rgba(240,240,248,0.45)" }}>{fmtDate(inv.created_at)}</span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontFamily: '"DM Mono",monospace', fontSize: "12px", color: "rgba(240,240,248,0.55)" }}>{fmt(inv.subtotal || inv.total_amount)}</span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontFamily: '"DM Mono",monospace', fontSize: "12px", color: "rgba(240,240,248,0.4)" }}>{fmt(inv.tax_amount || 0)}</span>
                        </td>
                        <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                          <span style={{ fontFamily: '"DM Mono",monospace', fontWeight: 600, color: "var(--text-primary)" }}>{fmt(inv.total_amount)}</span>
                        </td>
                        <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                          <span style={{ fontFamily: '"DM Mono",monospace', fontSize: "12px", color: inv.status === "paid" ? "#00b894" : "rgba(240,240,248,0.55)" }}>{fmt(inv.paid_amount || 0)}</span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <StatusPill status={inv.status} />
                        </td>
                        <td style={{ padding: "12px 10px" }} onClick={(e) => e.stopPropagation()}>
                          {(inv.status === "pending" || inv.status === "partial") && (
                            <button
                              onClick={() => { setPayInvoice(inv); setPayForm({ amount: String(balance), mode: "cash", notes: "" }) }}
                              style={{ height: "26px", padding: "0 10px", background: "rgba(0,184,148,0.1)", border: "1px solid rgba(0,184,148,0.25)", borderRadius: "6px", color: "#00b894", fontSize: "11px", fontWeight: 600, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap", transition: "all 130ms ease" }}
                              onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,184,148,0.2)"}}
                              onMouseLeave={e=>{e.currentTarget.style.background="rgba(0,184,148,0.1)"}}
                            >
                              <IcoPay /> Pay
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
      </div>

      {/* ── Invoice Detail Modal ── */}
      {viewInvoice && (
        <Modal title="Invoice Details" wide onClose={() => setViewInvoice(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <div style={{ fontFamily: '"DM Mono",monospace', fontSize: "18px", fontWeight: 700, color: "var(--accent-light)", letterSpacing: "-0.3px" }}>
                  {viewInvoice.invoice_number || viewInvoice.id.slice(0, 8).toUpperCase()}
                </div>
                <div style={{ fontSize: "12px", color: "rgba(240,240,248,0.4)", marginTop: "2px" }}>
                  Issued {fmtDate(viewInvoice.created_at)}
                </div>
              </div>
              <StatusPill status={viewInvoice.status} />
            </div>

            <div style={{ height: "1px", background: "rgba(255,255,255,0.07)" }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "14px", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ fontSize: "9.5px", fontWeight: 600, color: "rgba(240,240,248,0.35)", textTransform: "uppercase", letterSpacing: "0.55px", marginBottom: "9px" }}>Guest</div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Avatar name={guestName(viewInvoice)} size={32} />
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{guestName(viewInvoice)}</div>
                    {viewInvoice.booking?.guest?.phone && (
                      <div style={{ fontFamily: '"DM Mono",monospace', fontSize: "11px", color: "rgba(240,240,248,0.4)", marginTop: "2px" }}>{viewInvoice.booking.guest.phone}</div>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "14px", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ fontSize: "9.5px", fontWeight: 600, color: "rgba(240,240,248,0.35)", textTransform: "uppercase", letterSpacing: "0.55px", marginBottom: "9px" }}>Stay</div>
                <div style={{ fontFamily: '"DM Mono",monospace', fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Room {viewInvoice.booking?.room?.room_number || "—"}
                </div>
                {viewInvoice.booking && (
                  <div style={{ fontSize: "12px", color: "rgba(240,240,248,0.4)", marginTop: "4px" }}>
                    {fmtDate(viewInvoice.booking.check_in_date)} → {fmtDate(viewInvoice.booking.check_out_date)}
                  </div>
                )}
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "16px", border: "1px solid rgba(255,255,255,0.07)" }}>
              {[
                { label: "Subtotal", value: fmt(viewInvoice.subtotal || viewInvoice.total_amount), dim: true,  bold: false },
                { label: "Tax",      value: fmt(viewInvoice.tax_amount || 0),                       dim: true,  bold: false },
                { label: "Total",    value: fmt(viewInvoice.total_amount),                          dim: false, bold: true  },
                { label: "Paid",     value: fmt(viewInvoice.paid_amount || 0),                      dim: false, bold: false, color: "#00b894" },
                { label: "Balance",  value: fmt(viewInvoice.total_amount - (viewInvoice.paid_amount || 0)), dim: false, bold: false, color: viewInvoice.status === "paid" ? "#00b894" : "#fdcb6e" },
              ].map((row, idx) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderTop: idx > 0 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <span style={{ fontSize: "13px", color: row.dim ? "rgba(240,240,248,0.45)" : "var(--text-primary)", fontWeight: row.bold ? 600 : 400 }}>
                    {row.label}
                  </span>
                  <span style={{ fontFamily: '"DM Mono",monospace', fontSize: row.bold ? "16px" : "13px", fontWeight: row.bold ? 700 : 500, color: row.color || (row.dim ? "rgba(240,240,248,0.55)" : "var(--text-primary)") }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {(viewInvoice.status === "pending" || viewInvoice.status === "partial") && (
              <button
                onClick={() => {
                  const balance = viewInvoice.total_amount - (viewInvoice.paid_amount || 0)
                  setPayInvoice(viewInvoice)
                  setPayForm({ amount: String(balance), mode: "cash", notes: "" })
                  setViewInvoice(null)
                }}
                style={{ height: "36px", padding: "0 16px", background: "rgba(0,184,148,0.12)", border: "1px solid rgba(0,184,148,0.3)", borderRadius: "9px", color: "#00b894", fontSize: "13px", fontWeight: 600, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "flex", alignItems: "center", gap: "7px", transition: "all 150ms ease" }}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,184,148,0.2)"}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(0,184,148,0.12)"}}
              >
                <IcoPay /> Record Payment
              </button>
            )}
          </div>
        </Modal>
      )}

      {/* ── Record Payment Modal ── */}
      {payInvoice && (
        <Modal title={"Record Payment — " + (payInvoice.invoice_number || payInvoice.id.slice(0, 8).toUpperCase())} onClose={() => setPayInvoice(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ background: "rgba(108,92,231,0.08)", border: "1px solid rgba(108,92,231,0.2)", borderRadius: "12px", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(240,240,248,0.38)", textTransform: "uppercase", letterSpacing: "0.55px" }}>Balance Due</div>
                <div style={{ fontFamily: '"DM Mono",monospace', fontSize: "20px", fontWeight: 700, color: "var(--accent-light)", marginTop: "2px" }}>
                  {fmt(payInvoice.total_amount - (payInvoice.paid_amount || 0))}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(240,240,248,0.38)", textTransform: "uppercase", letterSpacing: "0.55px" }}>Total</div>
                <div style={{ fontFamily: '"DM Mono",monospace', fontSize: "14px", fontWeight: 600, color: "rgba(240,240,248,0.55)", marginTop: "2px" }}>
                  {fmt(payInvoice.total_amount)}
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Amount (&#8377;) *</label>
              <input className="form-input" style={{ fontFamily: '"DM Mono",monospace' }} type="number" placeholder="Enter amount"
                value={payForm.amount} onChange={(e) => setPayForm((p) => ({ ...p, amount: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Mode</label>
              <select className="form-select" value={payForm.mode} onChange={(e) => setPayForm((p) => ({ ...p, mode: e.target.value }))}>
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
            <button
              onClick={recordPayment} disabled={saving}
              style={{ height: "34px", padding: "0 16px", background: "rgba(0,184,148,0.15)", border: "1px solid rgba(0,184,148,0.3)", borderRadius: "8px", color: "#00b894", fontSize: "13px", fontWeight: 600, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "all 150ms ease" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,184,148,0.25)"}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(0,184,148,0.15)"}}
            >
              {saving ? "Recording..." : "Record Payment"}
            </button>
          </div>
        </Modal>
      )}

    </div>
  )
}
