"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

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
const IcoPhone = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <path d="M2 1h2.5l1 2.5-1.5 1a7 7 0 003.5 3.5l1-1.5L11 7.5V10a1 1 0 01-1 1A9 9 0 011 2a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoMail = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <rect x="1" y="2.5" width="9" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M1 3.5l4.5 3 4.5-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoCard = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <rect x="1" y="2.5" width="9" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M1 5h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M3 7.5h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
)
const IcoPin = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <circle cx="5.5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M5.5 10C5.5 10 1.5 6.8 1.5 4.5a4 4 0 018 0C9.5 6.8 5.5 10 5.5 10z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoCal = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <rect x="1" y="2" width="9" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M3.5 1v2M7.5 1v2M1 5h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
)
const IcoChevron = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M4 3l4 3-4 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ── Types ─────────────────────────────────────────────────────────────────────
interface Booking {
  id: string
  booking_number?: string | null
  status: string
  check_in_date: string
  check_out_date: string
  total_amount?: number | null
  room?: { room_number: string } | null
}
interface Guest {
  id: string
  name?: string | null
  full_name?: string | null
  email?: string | null
  phone?: string | null
  id_type?: string | null
  id_number?: string | null
  nationality?: string | null
  address?: string | null
  created_at?: string | null
  bookings?: Booking[]
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:     { label: "Pending",     color: "#fdcb6e", bg: "rgba(253,203,110,0.1)", border: "rgba(253,203,110,0.25)" },
  confirmed:   { label: "Confirmed",   color: "#74b9ff", bg: "rgba(116,185,255,0.1)", border: "rgba(116,185,255,0.25)" },
  checked_in:  { label: "Checked In",  color: "#00b894", bg: "rgba(0,184,148,0.1)",   border: "rgba(0,184,148,0.25)"   },
  checked_out: { label: "Checked Out", color: "rgba(240,240,248,0.4)", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.1)" },
  cancelled:   { label: "Cancelled",   color: "#e17055", bg: "rgba(225,112,85,0.1)",  border: "rgba(225,112,85,0.25)"  },
  no_show:     { label: "No Show",     color: "#e17055", bg: "rgba(225,112,85,0.1)",  border: "rgba(225,112,85,0.25)"  },
}

function StatusPill({ status }: { status: string }) {
  const m = STATUS_META[status] || STATUS_META.pending
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      fontSize: "10px", fontWeight: 600, letterSpacing: "0.02em",
      padding: "3px 8px", borderRadius: "99px",
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

const BLANK_FORM = {
  name: "", email: "", phone: "", id_type: "aadhaar",
  id_number: "", nationality: "Indian", address: "",
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function GuestsClient() {
  const db = createClient() as any

  const [guests, setGuests]             = useState<Guest[]>([])
  const [isMobile, setIsMobile]         = useState(false)
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState("")
  const [showAdd, setShowAdd]           = useState(false)
  const [viewGuest, setViewGuest]       = useState<Guest | null>(null)
  const [guestBookings, setGuestBookings] = useState<Booking[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [saving, setSaving]             = useState(false)
  const [form, setForm]                 = useState(BLANK_FORM)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => { fetchGuests() }, [])

  async function fetchGuests() {
    setLoading(true)
    try {
      const { data } = await db
        .from("guests")
        .select("id, name, full_name, email, phone, id_type, id_number, nationality, address, created_at")
        .order("created_at", { ascending: false })
      setGuests((data as Guest[]) || [])
    } catch { toast.error("Failed to load guests") }
    finally { setLoading(false) }
  }

  async function openGuest(guest: Guest) {
    setViewGuest(guest)
    setLoadingBookings(true)
    try {
      const { data } = await db
        .from("bookings")
        .select("id, booking_number, status, check_in_date, check_out_date, total_amount, room:rooms(room_number)")
        .eq("guest_id", guest.id)
        .order("check_in_date", { ascending: false })
      setGuestBookings((data as Booking[]) || [])
    } catch { toast.error("Failed to load booking history") }
    finally { setLoadingBookings(false) }
  }

  async function saveGuest() {
    const displayName = form.name.trim()
    if (!displayName) { toast.error("Guest name is required"); return }
    if (!form.phone.trim()) { toast.error("Phone number is required"); return }
    setSaving(true)
    try {
      const { error } = await db.from("guests").insert({
        name: displayName, full_name: displayName,
        email: form.email || null, phone: form.phone.trim(),
        id_type: form.id_type || null, id_number: form.id_number || null,
        nationality: form.nationality || null, address: form.address || null,
      })
      if (error) throw error
      toast.success("Guest added successfully")
      setShowAdd(false); setForm(BLANK_FORM); fetchGuests()
    } catch { toast.error("Failed to add guest") }
    finally { setSaving(false) }
  }

  const guestName = (g: Guest) => g.name || g.full_name || "Unknown"

  const filtered = guests.filter((g) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      guestName(g).toLowerCase().includes(q) ||
      (g.email || "").toLowerCase().includes(q) ||
      (g.phone || "").includes(q) ||
      (g.id_number || "").toLowerCase().includes(q)
    )
  })

  const p = isMobile ? "12px" : "28px"

  if (loading) return (
    <div style={{ padding: p, overflowX: "hidden", width: "100%", boxSizing: "border-box" }}>
      <div className="skeleton" style={{ height: "56px", borderRadius: "0", marginBottom: "16px" }} />
      <div className="skeleton" style={{ height: "500px", borderRadius: "12px" }} />
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
            Guests
          </div>
          {!isMobile && (
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>
              {guests.length} registered guests
            </div>
          )}
        </div>
        <button
          onClick={fetchGuests}
          style={{ height: "32px", padding: "0 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(240,240,248,0.6)", fontSize: "12px", fontWeight: 500, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "all 150ms ease" }}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.09)";e.currentTarget.style.color="rgba(240,240,248,0.9)"}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.color="rgba(240,240,248,0.6)"}}
        >
          <IcoRefresh />{!isMobile && "Refresh"}
        </button>
        <button
          onClick={() => { setForm(BLANK_FORM); setShowAdd(true) }}
          style={{ height: "32px", padding: "0 14px", background: "var(--accent)", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px", fontWeight: 600, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 0 18px rgba(108,92,231,0.3)", transition: "all 150ms ease", letterSpacing: "-0.1px" }}
          onMouseEnter={e=>{e.currentTarget.style.background="#7d6ff0";e.currentTarget.style.boxShadow="0 0 24px rgba(108,92,231,0.45)"}}
          onMouseLeave={e=>{e.currentTarget.style.background="var(--accent)";e.currentTarget.style.boxShadow="0 0 18px rgba(108,92,231,0.3)"}}
        >
          <IcoPlus />{!isMobile && "Add Guest"}
        </button>
      </div>

      {/* ── Page content ── */}
      <div style={{ padding: p, maxWidth: "1400px", margin: "0 auto" }}>

        {/* Search */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", marginBottom: "16px", maxWidth: isMobile ? "100%" : "360px" }}>
          <span style={{ position: "absolute", left: "11px", color: "rgba(240,240,248,0.3)", display: "flex" }}>
            <IcoSearch />
          </span>
          <input
            style={{ width: "100%", height: "36px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "9px", padding: "0 36px 0 34px", fontSize: "13px", fontFamily: '"DM Sans",sans-serif', color: "var(--text-primary)", outline: "none", transition: "border-color 150ms ease" }}
            placeholder="Search by name, phone or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
              {search ? "No guests match your search" : "No guests added yet"}
            </div>
            {!search && (
              <button onClick={() => setShowAdd(true)} style={{ marginTop: "12px", height: "32px", padding: "0 14px", background: "var(--accent)", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px", fontWeight: 600, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <IcoPlus /> Add Guest
              </button>
            )}
          </div>
        )}

        {/* ── Mobile card list ── */}
        {filtered.length > 0 && isMobile && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filtered.map((g) => {
              const name = guestName(g)
              return (
                <div
                  key={g.id}
                  onClick={() => openGuest(g)}
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "13px 14px", cursor: "pointer", transition: "border-color 150ms ease" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.13)"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)"}}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Avatar name={name} size={36} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {name}
                      </div>
                      {g.email && (
                        <div style={{ fontSize: "11px", color: "rgba(240,240,248,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {g.email}
                        </div>
                      )}
                    </div>
                    <span style={{ color: "rgba(240,240,248,0.3)", flexShrink: 0 }}><IcoChevron /></span>
                  </div>
                  {g.phone && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ color: "rgba(240,240,248,0.3)" }}><IcoPhone /></span>
                      <span style={{ fontFamily: '"DM Mono",monospace', fontSize: "12px", color: "rgba(240,240,248,0.5)" }}>{g.phone}</span>
                      {g.nationality && (
                        <span style={{ marginLeft: "auto", fontSize: "11px", color: "rgba(240,240,248,0.35)" }}>{g.nationality}</span>
                      )}
                    </div>
                  )}
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
                    {["Guest","Phone","ID","Nationality","Registered",""].map((h) => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "rgba(240,240,248,0.35)", textTransform: "uppercase", letterSpacing: "0.55px", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((g) => {
                    const name = guestName(g)
                    return (
                      <tr
                        key={g.id}
                        onClick={() => openGuest(g)}
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", transition: "background 120ms ease" }}
                        onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.025)"}}
                        onMouseLeave={e=>{e.currentTarget.style.background="transparent"}}
                      >
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <Avatar name={name} size={30} />
                            <div>
                              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{name}</div>
                              {g.email && <div style={{ fontSize: "11px", color: "rgba(240,240,248,0.4)", marginTop: "1px" }}>{g.email}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontFamily: '"DM Mono",monospace', fontSize: "12px", color: "rgba(240,240,248,0.55)" }}>
                            {g.phone || "—"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {g.id_type && g.id_number ? (
                            <div>
                              <div style={{ fontSize: "10px", color: "rgba(240,240,248,0.35)", textTransform: "uppercase", letterSpacing: "0.4px", fontWeight: 600 }}>{g.id_type}</div>
                              <div style={{ fontFamily: '"DM Mono",monospace', fontSize: "12px", color: "rgba(240,240,248,0.55)", marginTop: "1px" }}>{g.id_number}</div>
                            </div>
                          ) : <span style={{ color: "rgba(240,240,248,0.25)" }}>—</span>}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "12px", color: "rgba(240,240,248,0.55)" }}>
                          {g.nationality || "—"}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontFamily: '"DM Mono",monospace', fontSize: "12px", color: "rgba(240,240,248,0.4)" }}>
                            {g.created_at ? fmtDate(g.created_at) : "—"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 10px" }} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openGuest(g)}
                            style={{ height: "26px", padding: "0 10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "rgba(240,240,248,0.5)", fontSize: "11px", fontWeight: 600, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", transition: "all 130ms ease", whiteSpace: "nowrap" }}
                            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.09)";e.currentTarget.style.color="rgba(240,240,248,0.85)"}}
                            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.color="rgba(240,240,248,0.5)"}}
                          >
                            View Profile <IcoChevron />
                          </button>
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

      {/* ── Guest Profile Modal ── */}
      {viewGuest && (
        <Modal title="Guest Profile" wide onClose={() => { setViewGuest(null); setGuestBookings([]) }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <Avatar name={guestName(viewGuest)} size={52} />
              <div>
                <div style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
                  {guestName(viewGuest)}
                </div>
                {viewGuest.email && (
                  <div style={{ fontSize: "12px", color: "rgba(240,240,248,0.4)", marginTop: "3px" }}>{viewGuest.email}</div>
                )}
              </div>
            </div>

            <div style={{ height: "1px", background: "rgba(255,255,255,0.07)" }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                { Ico: IcoPhone, label: "Phone",       value: viewGuest.phone,       mono: true  },
                { Ico: IcoMail,  label: "Email",        value: viewGuest.email,       mono: false },
                { Ico: IcoCard,  label: "ID",           value: viewGuest.id_type && viewGuest.id_number ? viewGuest.id_type.toUpperCase() + ": " + viewGuest.id_number : null, mono: true },
                { Ico: IcoPin,   label: "Nationality",  value: viewGuest.nationality, mono: false },
                { Ico: IcoPin,   label: "Address",      value: viewGuest.address,     mono: false },
                { Ico: IcoCal,   label: "Registered",   value: viewGuest.created_at ? fmtDate(viewGuest.created_at) : null, mono: true },
              ].filter((item) => item.value).map((item) => {
                const { Ico } = item
                return (
                  <div key={item.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "12px 14px", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "5px" }}>
                      <span style={{ color: "rgba(240,240,248,0.35)" }}><Ico /></span>
                      <span style={{ fontSize: "9.5px", fontWeight: 600, color: "rgba(240,240,248,0.35)", textTransform: "uppercase", letterSpacing: "0.55px" }}>
                        {item.label}
                      </span>
                    </div>
                    <div style={{ fontFamily: item.mono ? '"DM Mono",monospace' : "inherit", fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                      {item.value}
                    </div>
                  </div>
                )
              })}
            </div>

            <div>
              <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(240,240,248,0.35)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "12px" }}>
                Booking History
              </div>
              {loadingBookings ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: "52px", borderRadius: "10px" }} />)}
                </div>
              ) : guestBookings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px", color: "rgba(240,240,248,0.3)", fontSize: "13px" }}>
                  No bookings yet
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {guestBookings.map((b) => (
                    <div key={b.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", gap: "8px", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", flex: 1, minWidth: 0 }}>
                        <span style={{ fontFamily: '"DM Mono",monospace', fontSize: "11px", fontWeight: 600, color: "var(--accent-light)", whiteSpace: "nowrap" }}>
                          {b.booking_number || b.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span style={{ fontFamily: '"DM Mono",monospace', fontSize: "11px", color: "rgba(240,240,248,0.4)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px", padding: "1px 6px", whiteSpace: "nowrap" }}>
                          Room {b.room?.room_number || "—"}
                        </span>
                        <span style={{ fontSize: "11px", color: "rgba(240,240,248,0.4)", whiteSpace: "nowrap" }}>
                          {fmtDate(b.check_in_date)} → {fmtDate(b.check_out_date)}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                        <span style={{ fontFamily: '"DM Mono",monospace', fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                          {fmt(b.total_amount || 0)}
                        </span>
                        <StatusPill status={b.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ── Add Guest Modal ── */}
      {showAdd && (
        <Modal title="Add New Guest" wide onClose={() => setShowAdd(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" placeholder="e.g. Rahul Sharma"
                  value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className="form-input" style={{ fontFamily: '"DM Mono",monospace' }} placeholder="e.g. 9876543210" type="tel"
                  value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" placeholder="e.g. rahul@email.com" type="email"
                value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">ID Type</label>
                <select className="form-select" value={form.id_type} onChange={(e) => setForm((p) => ({ ...p, id_type: e.target.value }))}>
                  <option value="aadhaar">Aadhaar</option>
                  <option value="passport">Passport</option>
                  <option value="pan">PAN Card</option>
                  <option value="driving_license">Driving Licence</option>
                  <option value="voter_id">Voter ID</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">ID Number</label>
                <input className="form-input" style={{ fontFamily: '"DM Mono",monospace' }} placeholder="ID number"
                  value={form.id_number} onChange={(e) => setForm((p) => ({ ...p, id_number: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Nationality</label>
                <input className="form-input" placeholder="e.g. Indian"
                  value={form.nationality} onChange={(e) => setForm((p) => ({ ...p, nationality: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-input" placeholder="City, State"
                  value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveGuest} disabled={saving}>
              {saving ? "Saving..." : "Add Guest"}
            </button>
          </div>
        </Modal>
      )}

    </div>
  )
}
