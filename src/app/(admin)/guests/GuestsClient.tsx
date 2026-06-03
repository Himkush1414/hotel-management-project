"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  Users, Plus, RefreshCw, Search, X,
  Phone, Mail, MapPin, CreditCard, Calendar
} from "lucide-react"

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

const STATUS_META: Record<string, { label: string; pill: string }> = {
  pending:     { label: "Pending",     pill: "pill-amber" },
  confirmed:   { label: "Confirmed",   pill: "pill-blue"  },
  checked_in:  { label: "Checked In",  pill: "pill-green" },
  checked_out: { label: "Checked Out", pill: "pill-gray"  },
  cancelled:   { label: "Cancelled",   pill: "pill-red"   },
  no_show:     { label: "No Show",     pill: "pill-red"   },
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

export default function GuestsClient() {
  const db = createClient() as any

  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [viewGuest, setViewGuest] = useState<Guest | null>(null)
  const [guestBookings, setGuestBookings] = useState<Booking[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(BLANK_FORM)

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
        name: displayName,
        full_name: displayName,
        email: form.email || null,
        phone: form.phone.trim(),
        id_type: form.id_type || null,
        id_number: form.id_number || null,
        nationality: form.nationality || null,
        address: form.address || null,
      })
      if (error) throw error
      toast.success("Guest added successfully")
      setShowAdd(false)
      setForm(BLANK_FORM)
      fetchGuests()
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

  if (loading) return (
    <div style={{ padding: "28px" }}>
      <div className="skeleton" style={{ height: "48px", borderRadius: "12px", marginBottom: "16px" }} />
      <div className="skeleton" style={{ height: "500px", borderRadius: "16px" }} />
    </div>
  )

  return (
    <div style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 className="page-title">Guests</h1>
          <p className="page-sub">{guests.length} registered guests</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchGuests}><RefreshCw size={13} /> Refresh</button>
          <button className="btn btn-primary btn-sm" onClick={() => { setForm(BLANK_FORM); setShowAdd(true) }}>
            <Plus size={13} /> Add Guest
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="search-wrap" style={{ marginBottom: "20px", maxWidth: "360px" }}>
        <Search size={15} className="search-icon" />
        <input className="search-input" placeholder="Search by name, phone or ID..."
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
            <Users size={40} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
            <div className="empty-state-title">No guests found</div>
            <div className="empty-state-sub">
              {search ? "No guests match your search" : "Add your first guest to get started"}
            </div>
            {!search && (
              <button className="btn btn-primary btn-sm" style={{ marginTop: "20px" }} onClick={() => setShowAdd(true)}>
                <Plus size={13} /> Add Guest
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
                  <th>Guest</th>
                  <th>Phone</th>
                  <th>ID</th>
                  <th>Nationality</th>
                  <th>Registered</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g) => (
                  <tr key={g.id} style={{ cursor: "pointer" }} onClick={() => openGuest(g)}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Avatar name={guestName(g)} size={32} />
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                            {guestName(g)}
                          </div>
                          {g.email && (
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{g.email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: '"DM Mono", monospace', fontSize: "12px", color: "var(--text-secondary)" }}>
                        {g.phone || "—"}
                      </span>
                    </td>
                    <td>
                      {g.id_type && g.id_number ? (
                        <div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                            {g.id_type}
                          </div>
                          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: "12px", color: "var(--text-secondary)" }}>
                            {g.id_number}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                      {g.nationality || "—"}
                    </td>
                    <td>
                      <span style={{ fontFamily: '"DM Mono", monospace', fontSize: "12px", color: "var(--text-muted)" }}>
                        {g.created_at ? fmtDate(g.created_at) : "—"}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button className="btn btn-secondary btn-sm" style={{ fontSize: "11px" }}
                        onClick={() => openGuest(g)}>
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Guest Profile Modal */}
      {viewGuest && (
        <Modal title="Guest Profile" wide onClose={() => { setViewGuest(null); setGuestBookings([]) }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Profile Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Avatar name={guestName(viewGuest)} size={56} />
              <div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
                  {guestName(viewGuest)}
                </div>
                {viewGuest.email && (
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>{viewGuest.email}</div>
                )}
              </div>
            </div>

            <div style={{ height: "1px", background: "var(--border)" }} />

            {/* Info Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { icon: Phone,      label: "Phone",       value: viewGuest.phone },
                { icon: Mail,       label: "Email",       value: viewGuest.email },
                { icon: CreditCard, label: "ID",          value: viewGuest.id_type && viewGuest.id_number ? viewGuest.id_type.toUpperCase() + ": " + viewGuest.id_number : null },
                { icon: MapPin,     label: "Nationality", value: viewGuest.nationality },
                { icon: MapPin,     label: "Address",     value: viewGuest.address },
                { icon: Calendar,   label: "Registered",  value: viewGuest.created_at ? fmtDate(viewGuest.created_at) : null },
              ].filter((item) => item.value).map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "12px 14px", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <Icon size={12} style={{ color: "var(--text-muted)" }} />
                      <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {item.label}
                      </span>
                    </div>
                    <div style={{ fontFamily: item.label === "Phone" || item.label === "ID" ? '"DM Mono", monospace' : "inherit", fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                      {item.value}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Booking History */}
            <div>
              <div className="section-label" style={{ marginBottom: "12px" }}>Booking History</div>
              {loadingBookings ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: "52px", borderRadius: "10px" }} />)}
                </div>
              ) : guestBookings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)", fontSize: "13px" }}>
                  No bookings yet
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {guestBookings.map((b) => {
                    const meta = STATUS_META[b.status] || STATUS_META.pending
                    return (
                      <div key={b.id} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "12px 14px", borderRadius: "10px",
                        background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontFamily: '"DM Mono", monospace', fontSize: "11px", fontWeight: 600, color: "var(--accent-light)" }}>
                            {b.booking_number || b.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span style={{ fontFamily: '"DM Mono", monospace', fontSize: "12px", color: "var(--text-muted)" }}>
                            Room {b.room?.room_number || "—"}
                          </span>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            {fmtDate(b.check_in_date)} → {fmtDate(b.check_out_date)}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontFamily: '"DM Mono", monospace', fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                            {fmt(b.total_amount || 0)}
                          </span>
                          <span className={"pill " + meta.pill}>{meta.label}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Add Guest Modal */}
      {showAdd && (
        <Modal title="Add New Guest" wide onClose={() => setShowAdd(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" placeholder="e.g. Rahul Sharma"
                  value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className="form-input" style={{ fontFamily: '"DM Mono", monospace' }}
                  placeholder="e.g. 9876543210" type="tel"
                  value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" placeholder="e.g. rahul@email.com" type="email"
                value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">ID Type</label>
                <select className="form-select" value={form.id_type}
                  onChange={(e) => setForm((p) => ({ ...p, id_type: e.target.value }))}>
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
                <input className="form-input" style={{ fontFamily: '"DM Mono", monospace' }}
                  placeholder="ID number"
                  value={form.id_number} onChange={(e) => setForm((p) => ({ ...p, id_number: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
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
