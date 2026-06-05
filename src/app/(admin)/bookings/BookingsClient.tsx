"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

const STATUSES = ["all", "pending", "confirmed", "checked_in", "checked_out", "cancelled", "no_show"]

const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:     { label: "Pending",     color: "#fdcb6e", bg: "rgba(253,203,110,0.1)", border: "rgba(253,203,110,0.25)" },
  confirmed:   { label: "Confirmed",   color: "#74b9ff", bg: "rgba(116,185,255,0.1)", border: "rgba(116,185,255,0.25)" },
  checked_in:  { label: "Checked In",  color: "#00b894", bg: "rgba(0,184,148,0.1)",   border: "rgba(0,184,148,0.25)"   },
  checked_out: { label: "Checked Out", color: "rgba(240,240,248,0.4)", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.1)" },
  cancelled:   { label: "Cancelled",   color: "#e17055", bg: "rgba(225,112,85,0.1)",  border: "rgba(225,112,85,0.25)"  },
  no_show:     { label: "No Show",     color: "#e17055", bg: "rgba(225,112,85,0.1)",  border: "rgba(225,112,85,0.25)"  },
}

const avatarColors = [
  ["#6c5ce7","#a29bfe"],["#00b894","#55efc4"],["#74b9ff","#0984e3"],
  ["#fdcb6e","#e17055"],["#fd79a8","#e84393"],["#a29bfe","#6c5ce7"],
]
function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return avatarColors[Math.abs(h) % avatarColors.length]
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

interface Guest { id: string; name?: string | null; full_name?: string | null; phone?: string | null }
interface Room  { id: string; room_number: string; status: string; room_type?: { name: string; base_price: number } | null }
interface Booking {
  id: string
  booking_number?: string | null
  status: string
  check_in_date: string
  check_out_date: string
  total_amount?: number | null
  notes?: string | null
  guest?: Guest | null
  room?: Room | null
  guest_id?: string | null
  room_id?: string | null
}

function Modal({ title, onClose, wide, children }: { title: string; onClose: () => void; wide?: boolean; children: React.ReactNode }) {
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

function nightsBetween(a: string, b: string) {
  return Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000))
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────
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
const IcoCheck = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoLogIn = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M5 2H2a1 1 0 00-1 1v6a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M8 3.5L11 6l-3 2.5M4 6h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoLogOut = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M7 2h3a1 1 0 011 1v6a1 1 0 01-1 1H7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M4 3.5L1 6l3 2.5M8 6H1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoChevron = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M4 3l4 3-4 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ── Status Pill ───────────────────────────────────────────────────────────────
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

// ── Main Component ────────────────────────────────────────────────────────────
export default function BookingsClient() {
  const supabase = createClient()
  const db = supabase as any

  const [bookings, setBookings]     = useState<Booking[]>([])
  const [guests, setGuests]         = useState<Guest[]>([])
  const [availRooms, setAvailRooms] = useState<Room[]>([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState("all")
  const [search, setSearch]         = useState("")
  const [showNew, setShowNew]       = useState(false)
  const [viewBooking, setViewBooking] = useState<Booking | null>(null)
  const [saving, setSaving]         = useState(false)
  const [isMobile, setIsMobile]     = useState(false)

  const [form, setForm] = useState({
    guest_id: "", room_id: "", check_in_date: "", check_out_date: "", notes: "",
  })

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
      const { data: b } = await db
        .from("bookings")
        .select("id, booking_number, status, check_in_date, check_out_date, total_amount, notes, guest_id, room_id, guest:guests(id, name, full_name, phone), room:rooms(id, room_number, status, room_type:room_types(name, base_price))")
        .order("created_at", { ascending: false })
      setBookings((b as Booking[]) || [])
    } catch { toast.error("Failed to load bookings") }
    finally { setLoading(false) }
  }

  async function fetchFormData() {
    const [{ data: g }, { data: r }] = await Promise.all([
      db.from("guests").select("id, name, full_name, phone").order("name"),
      db.from("rooms").select("id, room_number, status, room_type:room_types(name, base_price)").eq("status", "available"),
    ])
    setGuests((g as Guest[]) || [])
    setAvailRooms((r as Room[]) || [])
  }

  async function updateStatus(booking: Booking, newStatus: string) {
    const { error } = await db.from("bookings").update({ status: newStatus }).eq("id", booking.id)
    if (error) { toast.error("Failed to update booking") }
    else {
      toast.success("Booking updated")
      setBookings((prev) => prev.map((b) => b.id === booking.id ? { ...b, status: newStatus } : b))
      if (viewBooking?.id === booking.id) setViewBooking({ ...viewBooking, status: newStatus })
    }
  }

  async function saveBooking() {
    if (!form.guest_id)       { toast.error("Select a guest"); return }
    if (!form.room_id)        { toast.error("Select a room"); return }
    if (!form.check_in_date)  { toast.error("Enter check-in date"); return }
    if (!form.check_out_date) { toast.error("Enter check-out date"); return }
    if (form.check_out_date <= form.check_in_date) { toast.error("Check-out must be after check-in"); return }
    setSaving(true)
    try {
      const room    = availRooms.find((r) => r.id === form.room_id)
      const nights  = nightsBetween(form.check_in_date, form.check_out_date)
      const total   = nights * (room?.room_type?.base_price || 0)
      const { error } = await db.from("bookings").insert({
        guest_id: form.guest_id, room_id: form.room_id,
        check_in_date: form.check_in_date, check_out_date: form.check_out_date,
        status: "pending", total_amount: total, notes: form.notes || null,
      })
      if (error) throw error
      toast.success("Booking created")
      setShowNew(false)
      setForm({ guest_id: "", room_id: "", check_in_date: "", check_out_date: "", notes: "" })
      fetchAll()
    } catch { toast.error("Failed to create booking") }
    finally { setSaving(false) }
  }

  const guestName = (g: Guest | null | undefined) => g?.name || g?.full_name || "Unknown"

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = s === "all" ? bookings.length : bookings.filter((b) => b.status === s).length
    return acc
  }, {} as Record<string, number>)

  const filtered = bookings.filter((b) => {
    if (filter !== "all" && b.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !(guestName(b.guest)).toLowerCase().includes(q) &&
        !(b.guest?.phone || "").toLowerCase().includes(q) &&
        !(b.booking_number || "").toLowerCase().includes(q)
      ) return false
    }
    return true
  })

  const selectedRoom  = availRooms.find((r) => r.id === form.room_id)
  const previewNights = form.check_in_date && form.check_out_date && form.check_out_date > form.check_in_date
    ? nightsBetween(form.check_in_date, form.check_out_date) : 0
  const previewTotal  = previewNights * (selectedRoom?.room_type?.base_price || 0)

  if (loading) return (
    <div style={{ padding: isMobile ? "12px" : "28px", overflowX: "hidden", width: "100%", boxSizing: "border-box" }}>
      <div className="skeleton" style={{ height: "56px", borderRadius: "0", marginBottom: "16px" }} />
      <div className="skeleton" style={{ height: "400px", borderRadius: "12px" }} />
    </div>
  )

  return (
    <div style={{ overflowX: "hidden", width: "100%", boxSizing: "border-box" }}>

      {/* ── Topbar ── */}
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
        gap: "10px", flexShrink: 0,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: isMobile ? "15px" : "16px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
            Bookings
          </div>
          {!isMobile && (
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>
              {bookings.length} total &middot; {counts.checked_in || 0} active
            </div>
          )}
        </div>
        <button
          onClick={fetchAll}
          style={{
            height: "32px", padding: "0 12px",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px", color: "rgba(240,240,248,0.6)",
            fontSize: "12px", fontWeight: 500, fontFamily: '"DM Sans",sans-serif',
            cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
            transition: "all 150ms ease",
          }}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.09)";e.currentTarget.style.color="rgba(240,240,248,0.9)"}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.color="rgba(240,240,248,0.6)"}}
        >
          <IcoRefresh />{!isMobile && "Refresh"}
        </button>
        <button
          onClick={() => { fetchFormData(); setShowNew(true) }}
          style={{
            height: "32px", padding: "0 14px",
            background: "var(--accent)", border: "none",
            borderRadius: "8px", color: "#fff",
            fontSize: "12px", fontWeight: 600, fontFamily: '"DM Sans",sans-serif',
            cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
            boxShadow: "0 0 18px rgba(108,92,231,0.3)", transition: "all 150ms ease",
            letterSpacing: "-0.1px",
          }}
          onMouseEnter={e=>{e.currentTarget.style.background="#7d6ff0";e.currentTarget.style.boxShadow="0 0 24px rgba(108,92,231,0.45)"}}
          onMouseLeave={e=>{e.currentTarget.style.background="var(--accent)";e.currentTarget.style.boxShadow="0 0 18px rgba(108,92,231,0.3)"}}
        >
          <IcoPlus />{!isMobile && "New Booking"}
        </button>
      </div>

      {/* ── Page content ── */}
      <div style={{ padding: isMobile ? "12px" : "28px", maxWidth: "1400px", margin: "0 auto" }}>

        {/* Filter tabs */}
        <div style={{ marginBottom: "14px", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div style={{
            display: "flex", gap: "3px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "10px", padding: "3px",
            width: "fit-content", minWidth: "100%",
          }}>
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  flexShrink: 0,
                  height: "28px", padding: "0 11px",
                  borderRadius: "7px", border: "none",
                  fontSize: "12px", fontWeight: 500,
                  fontFamily: '"DM Sans",sans-serif',
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "5px",
                  transition: "all 150ms ease",
                  background: filter === s ? "var(--bg-elevated)" : "transparent",
                  color: filter === s ? "var(--text-primary)" : "rgba(240,240,248,0.45)",
                  boxShadow: filter === s ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
                  borderWidth: filter === s ? "1px" : "0",
                  borderStyle: "solid",
                  borderColor: filter === s ? "rgba(255,255,255,0.1)" : "transparent",
                }}
              >
                {s === "all" ? "All" : (STATUS_META[s]?.label || s)}
                <span style={{
                  background: filter === s ? "rgba(108,92,231,0.2)" : "rgba(255,255,255,0.07)",
                  color: filter === s ? "var(--accent-light)" : "rgba(240,240,248,0.35)",
                  borderRadius: "99px", fontSize: "10px", fontWeight: 700,
                  padding: "1px 6px", minWidth: "18px", textAlign: "center",
                }}>
                  {counts[s] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", marginBottom: "16px", maxWidth: isMobile ? "100%" : "360px" }}>
          <span style={{ position: "absolute", left: "11px", color: "rgba(240,240,248,0.3)", display: "flex" }}>
            <IcoSearch />
          </span>
          <input
            style={{
              width: "100%", height: "36px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "9px", padding: "0 36px 0 34px",
              fontSize: "13px", fontFamily: '"DM Sans",sans-serif',
              color: "var(--text-primary)", outline: "none",
              transition: "border-color 150ms ease",
            }}
            placeholder="Search guest, phone, booking #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={e=>{e.currentTarget.style.borderColor="rgba(108,92,231,0.5)"}}
            onBlur={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"}}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                position: "absolute", right: "10px",
                background: "none", border: "none",
                color: "rgba(240,240,248,0.35)", cursor: "pointer",
                display: "flex", alignItems: "center", padding: "2px",
              }}
            >
              <IcoX />
            </button>
          )}
        </div>

        {/* Empty */}
        {filtered.length === 0 && (
          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: "12px", padding: "60px 24px", textAlign: "center",
          }}>
            <div style={{ fontSize: "13px", color: "rgba(240,240,248,0.35)", marginBottom: "8px" }}>
              {search ? "No bookings match your search" : filter !== "all" ? "No bookings with this status" : "No bookings yet"}
            </div>
            {!search && filter === "all" && (
              <button
                onClick={() => { fetchFormData(); setShowNew(true) }}
                style={{
                  marginTop: "12px", height: "32px", padding: "0 14px",
                  background: "var(--accent)", border: "none", borderRadius: "8px",
                  color: "#fff", fontSize: "12px", fontWeight: 600,
                  fontFamily: '"DM Sans",sans-serif', cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: "6px",
                }}
              >
                <IcoPlus /> New Booking
              </button>
            )}
          </div>
        )}

        {/* ── Mobile card list ── */}
        {filtered.length > 0 && isMobile && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filtered.map((b) => {
              const nights = nightsBetween(b.check_in_date, b.check_out_date)
              const gName  = guestName(b.guest)
              return (
                <div
                  key={b.id}
                  onClick={() => setViewBooking(b)}
                  style={{
                    background: "var(--bg-surface)", border: "1px solid var(--border)",
                    borderRadius: "12px", padding: "13px 14px",
                    cursor: "pointer", transition: "border-color 150ms ease",
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.13)"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)"}}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <Avatar name={gName} size={34} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {gName}
                      </div>
                      <div style={{ fontSize: "11px", color: "rgba(240,240,248,0.4)", fontFamily: '"DM Mono",monospace', marginTop: "1px" }}>
                        Room {b.room?.room_number || "—"} · {nights}N
                      </div>
                    </div>
                    <StatusPill status={b.status} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "11px", color: "rgba(240,240,248,0.4)", fontFamily: '"DM Mono",monospace' }}>
                      {fmtDate(b.check_in_date)} → {fmtDate(b.check_out_date)}
                    </div>
                    <div style={{ fontFamily: '"DM Mono",monospace', fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                      {fmt(b.total_amount || 0)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Desktop table ── */}
        {filtered.length > 0 && !isMobile && (
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.025)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    {["Booking #","Guest","Room","Check In","Check Out","Nights","Amount","Status",""].map((h) => (
                      <th key={h} style={{
                        padding: "10px 16px", textAlign: "left",
                        fontSize: "10px", fontWeight: 600,
                        color: "rgba(240,240,248,0.35)",
                        textTransform: "uppercase", letterSpacing: "0.55px",
                        whiteSpace: "nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => {
                    const nights = nightsBetween(b.check_in_date, b.check_out_date)
                    const gName  = guestName(b.guest)
                    return (
                      <tr
                        key={b.id}
                        onClick={() => setViewBooking(b)}
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", transition: "background 120ms ease" }}
                        onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.025)"}}
                        onMouseLeave={e=>{e.currentTarget.style.background="transparent"}}
                      >
                        <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                          <span style={{ fontFamily: '"DM Mono",monospace', fontSize: "12px", fontWeight: 600, color: "var(--accent-light)" }}>
                            {b.booking_number || b.id.slice(0, 8).toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                            <Avatar name={gName} size={28} />
                            <div>
                              <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{gName}</div>
                              {b.guest?.phone && (
                                <div style={{ fontSize: "11px", fontFamily: '"DM Mono",monospace', color: "rgba(240,240,248,0.4)" }}>{b.guest.phone}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <span style={{ fontFamily: '"DM Mono",monospace', fontWeight: 600, color: "var(--text-primary)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "5px", padding: "2px 8px", fontSize: "12px" }}>
                            {b.room?.room_number || "—"}
                          </span>
                        </td>
                        <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                          <span style={{ fontFamily: '"DM Mono",monospace', fontSize: "12px", color: "rgba(240,240,248,0.55)" }}>
                            {fmtDate(b.check_in_date)}
                          </span>
                        </td>
                        <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                          <span style={{ fontFamily: '"DM Mono",monospace', fontSize: "12px", color: "rgba(240,240,248,0.55)" }}>
                            {fmtDate(b.check_out_date)}
                          </span>
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <span style={{ fontFamily: '"DM Mono",monospace', color: "rgba(240,240,248,0.55)", fontSize: "12px" }}>{nights}</span>
                        </td>
                        <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                          <span style={{ fontFamily: '"DM Mono",monospace', fontWeight: 600, color: "var(--text-primary)" }}>
                            {fmt(b.total_amount || 0)}
                          </span>
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <StatusPill status={b.status} />
                        </td>
                        <td style={{ padding: "13px 10px" }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: "flex", gap: "5px" }}>
                            {b.status === "pending" && (
                              <button
                                onClick={() => updateStatus(b, "confirmed")}
                                style={{ height: "26px", padding: "0 9px", background: "rgba(116,185,255,0.1)", border: "1px solid rgba(116,185,255,0.25)", borderRadius: "6px", color: "#74b9ff", fontSize: "11px", fontWeight: 600, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap", transition: "all 130ms ease" }}
                                onMouseEnter={e=>{e.currentTarget.style.background="rgba(116,185,255,0.2)"}}
                                onMouseLeave={e=>{e.currentTarget.style.background="rgba(116,185,255,0.1)"}}
                              >
                                <IcoCheck /> Confirm
                              </button>
                            )}
                            {b.status === "confirmed" && (
                              <button
                                onClick={() => updateStatus(b, "checked_in")}
                                style={{ height: "26px", padding: "0 9px", background: "rgba(0,184,148,0.1)", border: "1px solid rgba(0,184,148,0.25)", borderRadius: "6px", color: "#00b894", fontSize: "11px", fontWeight: 600, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap", transition: "all 130ms ease" }}
                                onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,184,148,0.2)"}}
                                onMouseLeave={e=>{e.currentTarget.style.background="rgba(0,184,148,0.1)"}}
                              >
                                <IcoLogIn /> Check In
                              </button>
                            )}
                            {b.status === "checked_in" && (
                              <button
                                onClick={() => updateStatus(b, "checked_out")}
                                style={{ height: "26px", padding: "0 9px", background: "rgba(253,203,110,0.1)", border: "1px solid rgba(253,203,110,0.25)", borderRadius: "6px", color: "#fdcb6e", fontSize: "11px", fontWeight: 600, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap", transition: "all 130ms ease" }}
                                onMouseEnter={e=>{e.currentTarget.style.background="rgba(253,203,110,0.2)"}}
                                onMouseLeave={e=>{e.currentTarget.style.background="rgba(253,203,110,0.1)"}}
                              >
                                <IcoLogOut /> Check Out
                              </button>
                            )}
                            <button
                              onClick={() => setViewBooking(b)}
                              style={{ height: "26px", width: "26px", padding: "0", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "rgba(240,240,248,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 130ms ease" }}
                              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.09)";e.currentTarget.style.color="rgba(240,240,248,0.8)"}}
                              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.color="rgba(240,240,248,0.4)"}}
                            >
                              <IcoChevron />
                            </button>
                          </div>
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

      {/* ── View Booking Modal ── */}
      {viewBooking && (
        <Modal title="Booking Details" wide onClose={() => setViewBooking(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Avatar name={guestName(viewBooking.guest)} size={44} />
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {guestName(viewBooking.guest)}
                  </div>
                  {viewBooking.guest?.phone && (
                    <div style={{ fontFamily: '"DM Mono",monospace', fontSize: "12px", color: "rgba(240,240,248,0.4)" }}>
                      {viewBooking.guest.phone}
                    </div>
                  )}
                </div>
              </div>
              <StatusPill status={viewBooking.status} />
            </div>

            <div style={{ height: "1px", background: "rgba(255,255,255,0.07)" }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                { label: "Room",      value: viewBooking.room?.room_number || "—" },
                { label: "Total",     value: fmt(viewBooking.total_amount || 0) },
                { label: "Check In",  value: fmtDate(viewBooking.check_in_date) },
                { label: "Check Out", value: fmtDate(viewBooking.check_out_date) },
              ].map((item) => (
                <div key={item.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "13px 15px", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(240,240,248,0.35)", textTransform: "uppercase", letterSpacing: "0.55px", marginBottom: "5px" }}>
                    {item.label}
                  </div>
                  <div style={{ fontFamily: '"DM Mono",monospace', fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {viewBooking.notes && (
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "13px 15px", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(240,240,248,0.35)", textTransform: "uppercase", letterSpacing: "0.55px", marginBottom: "5px" }}>Notes</div>
                <div style={{ fontSize: "13px", color: "rgba(240,240,248,0.6)", lineHeight: 1.6 }}>{viewBooking.notes}</div>
              </div>
            )}

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {viewBooking.status === "pending" && (
                <button
                  onClick={() => updateStatus(viewBooking, "confirmed")}
                  style={{ height: "34px", padding: "0 14px", background: "var(--accent)", border: "none", borderRadius: "8px", color: "#fff", fontSize: "13px", fontWeight: 600, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <IcoCheck /> Confirm
                </button>
              )}
              {viewBooking.status === "confirmed" && (
                <button
                  onClick={() => updateStatus(viewBooking, "checked_in")}
                  style={{ height: "34px", padding: "0 14px", background: "rgba(0,184,148,0.15)", border: "1px solid rgba(0,184,148,0.3)", borderRadius: "8px", color: "#00b894", fontSize: "13px", fontWeight: 600, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <IcoLogIn /> Check In
                </button>
              )}
              {viewBooking.status === "checked_in" && (
                <button
                  onClick={() => updateStatus(viewBooking, "checked_out")}
                  style={{ height: "34px", padding: "0 14px", background: "rgba(253,203,110,0.12)", border: "1px solid rgba(253,203,110,0.3)", borderRadius: "8px", color: "#fdcb6e", fontSize: "13px", fontWeight: 600, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <IcoLogOut /> Check Out
                </button>
              )}
              {(viewBooking.status === "pending" || viewBooking.status === "confirmed") && (
                <button
                  onClick={() => updateStatus(viewBooking, "cancelled")}
                  style={{ height: "34px", padding: "0 14px", background: "rgba(225,112,85,0.1)", border: "1px solid rgba(225,112,85,0.3)", borderRadius: "8px", color: "#e17055", fontSize: "13px", fontWeight: 600, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <IcoX /> Cancel
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ── New Booking Modal ── */}
      {showNew && (
        <Modal title="New Booking" wide onClose={() => setShowNew(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Guest *</label>
              <select className="form-select" value={form.guest_id}
                onChange={(e) => setForm((p) => ({ ...p, guest_id: e.target.value }))}>
                <option value="">Select guest...</option>
                {guests.map((g) => (
                  <option key={g.id} value={g.id}>{guestName(g)}{g.phone ? " · " + g.phone : ""}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Room *</label>
              <select className="form-select" value={form.room_id}
                onChange={(e) => setForm((p) => ({ ...p, room_id: e.target.value }))}>
                <option value="">Select available room...</option>
                {availRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {"Room " + r.room_number + (r.room_type ? " · " + r.room_type.name + " · " + fmt(r.room_type.base_price) + "/night" : "")}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Check In Date *</label>
                <input className="form-input" type="date" value={form.check_in_date}
                  onChange={(e) => setForm((p) => ({ ...p, check_in_date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Check Out Date *</label>
                <input className="form-input" type="date" value={form.check_out_date}
                  onChange={(e) => setForm((p) => ({ ...p, check_out_date: e.target.value }))} />
              </div>
            </div>
            {previewNights > 0 && (
              <div style={{ background: "var(--accent-glow)", border: "1px solid rgba(108,92,231,0.3)", borderRadius: "10px", padding: "13px 15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: "rgba(240,240,248,0.55)" }}>
                    {previewNights} night{previewNights > 1 ? "s" : ""} &times; {fmt(selectedRoom?.room_type?.base_price || 0)}
                  </span>
                  <span style={{ fontFamily: '"DM Mono",monospace', fontSize: "15px", fontWeight: 700, color: "var(--accent-light)" }}>
                    {fmt(previewTotal)}
                  </span>
                </div>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" placeholder="Special requests..."
                value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveBooking} disabled={saving}>
              {saving ? "Creating..." : "Create Booking"}
            </button>
          </div>
        </Modal>
      )}

    </div>
  )
}
