"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  CalendarCheck, Plus, RefreshCw, Search,
  ChevronRight, X, Check, LogIn, LogOut,
  Calendar, User, BedDouble, DollarSign
} from "lucide-react"

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

const STATUSES = ["all", "pending", "confirmed", "checked_in", "checked_out", "cancelled", "no_show"]

const STATUS_META: Record<string, { label: string; pill: string; color: string }> = {
  pending:      { label: "Pending",     pill: "pill-amber",  color: "var(--amber)"  },
  confirmed:    { label: "Confirmed",   pill: "pill-blue",   color: "var(--blue)"   },
  checked_in:   { label: "Checked In",  pill: "pill-green",  color: "var(--green)"  },
  checked_out:  { label: "Checked Out", pill: "pill-gray",   color: "rgba(255,255,255,0.35)" },
  cancelled:    { label: "Cancelled",   pill: "pill-red",    color: "var(--red)"    },
  no_show:      { label: "No Show",     pill: "pill-red",    color: "var(--red)"    },
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
  const diff = new Date(b).getTime() - new Date(a).getTime()
  return Math.max(1, Math.round(diff / 86400000))
}

export default function BookingsClient() {
  const supabase = createClient()
  const db = supabase as any

  const [bookings, setBookings] = useState<Booking[]>([])

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const [guests, setGuests] = useState<Guest[]>([])
  const [availRooms, setAvailRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [viewBooking, setViewBooking] = useState<Booking | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    guest_id: "", room_id: "", check_in_date: "", check_out_date: "", notes: "",
  })

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
      toast.success("Booking " + (booking.booking_number || "") + " → " + newStatus.replace("_", " "))
      setBookings((prev) => prev.map((b) => b.id === booking.id ? { ...b, status: newStatus } : b))
      if (viewBooking?.id === booking.id) setViewBooking({ ...viewBooking, status: newStatus })
    }
  }

  async function saveBooking() {
    if (!form.guest_id)      { toast.error("Select a guest"); return }
    if (!form.room_id)       { toast.error("Select a room"); return }
    if (!form.check_in_date) { toast.error("Enter check-in date"); return }
    if (!form.check_out_date){ toast.error("Enter check-out date"); return }
    if (form.check_out_date <= form.check_in_date) { toast.error("Check-out must be after check-in"); return }
    setSaving(true)
    try {
      const room = availRooms.find((r) => r.id === form.room_id)
      const nights = nightsBetween(form.check_in_date, form.check_out_date)
      const rate = room?.room_type?.base_price || 0
      const total = nights * rate
      const { error } = await db.from("bookings").insert({
        guest_id: form.guest_id,
        room_id: form.room_id,
        check_in_date: form.check_in_date,
        check_out_date: form.check_out_date,
        status: "pending",
        total_amount: total,
        notes: form.notes || null,
      })
      if (error) throw error
      toast.success("Booking created")
      setShowNew(false)
      setForm({ guest_id: "", room_id: "", check_in_date: "", check_out_date: "", notes: "" })
      fetchAll()
    } catch { toast.error("Failed to create booking") }
    finally { setSaving(false) }
  }

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = s === "all" ? bookings.length : bookings.filter((b) => b.status === s).length
    return acc
  }, {} as Record<string, number>)

  const filtered = bookings.filter((b) => {
    if (filter !== "all" && b.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      const guestName = (b.guest?.name || b.guest?.full_name || "").toLowerCase()
      const phone = (b.guest?.phone || "").toLowerCase()
      const num = (b.booking_number || "").toLowerCase()
      if (!guestName.includes(q) && !phone.includes(q) && !num.includes(q)) return false
    }
    return true
  })

  const selectedRoom = availRooms.find((r) => r.id === form.room_id)
  const previewNights = form.check_in_date && form.check_out_date && form.check_out_date > form.check_in_date
    ? nightsBetween(form.check_in_date, form.check_out_date) : 0
  const previewTotal = previewNights * (selectedRoom?.room_type?.base_price || 0)

  const guestDisplayName = (g: Guest | null | undefined) => g?.name || g?.full_name || "Unknown"

  if (loading) return (
    <div style={{ padding: isMobile ? "12px" : "28px" }}>
      <div className="skeleton" style={{ height: "48px", borderRadius: "12px", marginBottom: "16px" }} />
      <div className="skeleton" style={{ height: "400px", borderRadius: "16px" }} />
    </div>
  )

  return (
    <div style={{ padding: isMobile ? "12px" : "28px", maxWidth: "1400px", margin: "0 auto", overflowX: "hidden", boxSizing: "border-box" as const, width: "100%" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isMobile ? "16px" : "24px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 className="page-title" style={{ fontSize: isMobile ? "18px" : undefined }}>Bookings</h1>
          <p className="page-sub">{bookings.length} total &middot; {counts.checked_in || 0} active</p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchAll}><RefreshCw size={13} /> Refresh</button>
          <button className="btn btn-primary btn-sm" onClick={() => { fetchFormData(); setShowNew(true) }}>
            <Plus size={13} /> New Booking
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
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

      {/* Search */}
      <div className="search-wrap" style={{ marginBottom: "16px", maxWidth: isMobile ? "100%" : "360px" }}>
        <Search size={15} className="search-icon" />
        <input
          className="search-input"
          placeholder="Search by guest, phone or booking #..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
            <CalendarCheck size={40} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
            <div className="empty-state-title">No bookings found</div>
            <div className="empty-state-sub">
              {search ? "No bookings match your search" : filter !== "all" ? "No bookings with this status" : "Create your first booking to get started"}
            </div>
            {!search && filter === "all" && (
              <button className="btn btn-primary btn-sm" style={{ marginTop: "20px" }}
                onClick={() => { fetchFormData(); setShowNew(true) }}>
                <Plus size={13} /> New Booking
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
                  <th>Booking #</th>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Nights</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const meta = STATUS_META[b.status] || STATUS_META.pending
                  const nights = nightsBetween(b.check_in_date, b.check_out_date)
                  const gName = guestDisplayName(b.guest)
                  return (
                    <tr key={b.id} style={{ cursor: "pointer" }}
                      onClick={() => setViewBooking(b)}>
                      <td>
                        <span style={{ fontFamily: '"DM Mono", monospace', fontSize: "12px", fontWeight: 600, color: "var(--accent-light)" }}>
                          {b.booking_number || b.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <Avatar name={gName} size={30} />
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>{gName}</div>
                            {b.guest?.phone && (
                              <div style={{ fontSize: "11px", fontFamily: '"DM Mono", monospace', color: "var(--text-muted)" }}>{b.guest.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: '"DM Mono", monospace', fontWeight: 600, color: "var(--text-primary)" }}>
                          {b.room?.room_number || "—"}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: '"DM Mono", monospace', fontSize: "12px", color: "var(--text-secondary)" }}>
                          {fmtDate(b.check_in_date)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: '"DM Mono", monospace', fontSize: "12px", color: "var(--text-secondary)" }}>
                          {fmtDate(b.check_out_date)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: '"DM Mono", monospace', color: "var(--text-secondary)" }}>{nights}</span>
                      </td>
                      <td>
                        <span style={{ fontFamily: '"DM Mono", monospace', fontWeight: 500, color: "var(--text-primary)" }}>
                          {fmt(b.total_amount || 0)}
                        </span>
                      </td>
                      <td><span className={"pill " + meta.pill}>{meta.label}</span></td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: "5px" }}>
                          {b.status === "pending" && (
                            <button className="btn btn-secondary btn-sm" style={{ fontSize: "11px", padding: "4px 10px" }}
                              onClick={() => updateStatus(b, "confirmed")}>
                              <Check size={11} /> Confirm
                            </button>
                          )}
                          {b.status === "confirmed" && (
                            <button className="btn btn-secondary btn-sm" style={{ fontSize: "11px", padding: "4px 10px", color: "var(--green)", borderColor: "var(--green-border)" }}
                              onClick={() => updateStatus(b, "checked_in")}>
                              <LogIn size={11} /> Check In
                            </button>
                          )}
                          {b.status === "checked_in" && (
                            <button className="btn btn-secondary btn-sm" style={{ fontSize: "11px", padding: "4px 10px", color: "var(--amber)", borderColor: "var(--amber-border)" }}
                              onClick={() => updateStatus(b, "checked_out")}>
                              <LogOut size={11} /> Check Out
                            </button>
                          )}
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

      {/* View Booking Modal */}
      {viewBooking && (
        <Modal title="Booking Details" wide onClose={() => setViewBooking(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Top row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Avatar name={guestDisplayName(viewBooking.guest)} size={44} />
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {guestDisplayName(viewBooking.guest)}
                  </div>
                  {viewBooking.guest?.phone && (
                    <div style={{ fontFamily: '"DM Mono", monospace', fontSize: "12px", color: "var(--text-muted)" }}>
                      {viewBooking.guest.phone}
                    </div>
                  )}
                </div>
              </div>
              <span className={"pill " + (STATUS_META[viewBooking.status]?.pill || "pill-gray")} style={{ fontSize: "12px", padding: "4px 14px" }}>
                {STATUS_META[viewBooking.status]?.label || viewBooking.status}
              </span>
            </div>

            <div style={{ height: "1px", background: "var(--border)" }} />

            {/* Detail grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { icon: BedDouble,  label: "Room",       value: viewBooking.room?.room_number || "—" },
                { icon: DollarSign, label: "Total",      value: fmt(viewBooking.total_amount || 0) },
                { icon: Calendar,   label: "Check In",   value: fmtDate(viewBooking.check_in_date) },
                { icon: Calendar,   label: "Check Out",  value: fmtDate(viewBooking.check_out_date) },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "14px 16px", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <Icon size={14} style={{ color: "var(--text-muted)" }} />
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {item.label}
                      </span>
                    </div>
                    <div style={{ fontFamily: '"DM Mono", monospace', fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>
                      {item.value}
                    </div>
                  </div>
                )
              })}
            </div>

            {viewBooking.notes && (
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "14px 16px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Notes</div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{viewBooking.notes}</div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {viewBooking.status === "pending" && (
                <button className="btn btn-primary btn-sm" onClick={() => updateStatus(viewBooking, "confirmed")}>
                  <Check size={13} /> Confirm Booking
                </button>
              )}
              {viewBooking.status === "confirmed" && (
                <button className="btn btn-primary btn-sm" style={{ background: "var(--green)", boxShadow: "0 2px 8px rgba(0,184,148,0.25)" }}
                  onClick={() => updateStatus(viewBooking, "checked_in")}>
                  <LogIn size={13} /> Check In
                </button>
              )}
              {viewBooking.status === "checked_in" && (
                <button className="btn btn-secondary btn-sm" style={{ color: "var(--amber)", borderColor: "var(--amber-border)" }}
                  onClick={() => updateStatus(viewBooking, "checked_out")}>
                  <LogOut size={13} /> Check Out
                </button>
              )}
              {(viewBooking.status === "pending" || viewBooking.status === "confirmed") && (
                <button className="btn btn-danger btn-sm" onClick={() => updateStatus(viewBooking, "cancelled")}>
                  <X size={13} /> Cancel
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* New Booking Modal */}
      {showNew && (
        <Modal title="New Booking" wide onClose={() => setShowNew(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Guest *</label>
              <select className="form-select" value={form.guest_id}
                onChange={(e) => setForm((p) => ({ ...p, guest_id: e.target.value }))}>
                <option value="">Select guest...</option>
                {guests.map((g) => (
                  <option key={g.id} value={g.id}>{guestDisplayName(g)}{g.phone ? " · " + g.phone : ""}</option>
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

            {/* Price Preview */}
            {previewNights > 0 && (
              <div style={{ background: "var(--accent-glow)", border: "1px solid var(--border-active)", borderRadius: "12px", padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    {previewNights} night{previewNights > 1 ? "s" : ""} &times; {fmt(selectedRoom?.room_type?.base_price || 0)}
                  </span>
                  <span style={{ fontFamily: '"DM Mono", monospace', fontSize: "16px", fontWeight: 600, color: "var(--accent-light)" }}>
                    {fmt(previewTotal)}
                  </span>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" placeholder="Special requests, preferences..."
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
