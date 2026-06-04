"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  BedDouble, Plus, Grid3X3, List,
  Edit2, RefreshCw
} from "lucide-react"

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

const STATUS_LIST = ["all", "available", "occupied", "maintenance", "cleaning", "reserved", "blocked"]

const STATUS_META: Record<string, { label: string; pill: string; color: string; bg: string }> = {
  available:   { label: "Available",   pill: "pill-green",  color: "var(--green)",  bg: "var(--green-bg)"  },
  occupied:    { label: "Occupied",    pill: "pill-purple", color: "var(--purple)", bg: "var(--purple-bg)" },
  maintenance: { label: "Maintenance", pill: "pill-red",    color: "var(--red)",    bg: "var(--red-bg)"    },
  cleaning:    { label: "Cleaning",    pill: "pill-amber",  color: "var(--amber)",  bg: "var(--amber-bg)"  },
  reserved:    { label: "Reserved",    pill: "pill-blue",   color: "var(--blue)",   bg: "var(--blue-bg)"   },
  blocked:     { label: "Blocked",     pill: "pill-gray",   color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.07)" },
}

const NEXT_STATUS: Record<string, string> = {
  available:   "occupied",
  occupied:    "cleaning",
  cleaning:    "available",
  maintenance: "available",
  reserved:    "available",
  blocked:     "available",
}

interface RoomType {
  id: string
  name: string
  base_price: number
  capacity: number
}

interface Room {
  id: string
  room_number: string
  floor?: number | null
  status: string
  room_type_id?: string | null
  notes?: string | null
  room_type?: RoomType | null
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-title">{title}</div>
        {children}
      </div>
    </div>
  )
}

export default function RoomsClient() {
  const supabase = createClient()
  const [rooms, setRooms] = useState<Room[]>([])

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [showAddType, setShowAddType] = useState(false)
  const [editRoom, setEditRoom] = useState<Room | null>(null)
  const [roomForm, setRoomForm] = useState({ room_number: "", floor: "", room_type_id: "", status: "available", notes: "" })
  const [typeForm, setTypeForm] = useState({ name: "", base_price: "", capacity: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const db = supabase as any
      const { data: r } = await db
        .from("rooms")
        .select("id, room_number, floor, status, room_type_id, notes, room_type:room_types(id, name, base_price, capacity)")
        .order("room_number", { ascending: true })
      const { data: t } = await db
        .from("room_types")
        .select("id, name, base_price, capacity")
        .order("name", { ascending: true })
      setRooms((r as Room[]) || [])
      setRoomTypes((t as RoomType[]) || [])
    } catch {
      toast.error("Failed to load rooms")
    } finally {
      setLoading(false)
    }
  }

  async function cycleStatus(room: Room) {
    const next = NEXT_STATUS[room.status] || "available"
    const { error } = await supabase.from("rooms").update({ status: next } as any).eq("id", room.id)
    if (error) {
      toast.error("Failed to update status")
    } else {
      toast.success("Room " + room.room_number + " → " + next)
      setRooms((prev) => prev.map((r) => (r.id === room.id ? { ...r, status: next } : r)))
    }
  }

  async function saveRoom() {
    if (!roomForm.room_number.trim()) { toast.error("Room number required"); return }
    setSaving(true)
    try {
      const payload: any = {
        room_number: roomForm.room_number.trim(),
        floor: roomForm.floor ? parseInt(roomForm.floor) : null,
        room_type_id: roomForm.room_type_id || null,
        status: roomForm.status,
        notes: roomForm.notes || null,
      }
      if (editRoom) {
        const { error } = await supabase.from("rooms").update(payload).eq("id", editRoom.id)
        if (error) throw error
        toast.success("Room updated")
      } else {
        const { error } = await supabase.from("rooms").insert(payload)
        if (error) throw error
        toast.success("Room added")
      }
      setShowAddRoom(false)
      setEditRoom(null)
      setRoomForm({ room_number: "", floor: "", room_type_id: "", status: "available", notes: "" })
      fetchAll()
    } catch {
      toast.error("Failed to save room")
    } finally {
      setSaving(false)
    }
  }

  async function saveType() {
    if (!typeForm.name.trim()) { toast.error("Type name required"); return }
    setSaving(true)
    try {
      const db2 = supabase as any
      const { error } = await db2.from("room_types").insert({
        name: typeForm.name.trim(),
        base_price: parseFloat(typeForm.base_price) || 0,
        capacity: parseInt(typeForm.capacity) || 1,
      })
      if (error) throw error
      toast.success("Room type added")
      setShowAddType(false)
      setTypeForm({ name: "", base_price: "", capacity: "" })
      fetchAll()
    } catch {
      toast.error("Failed to save room type")
    } finally {
      setSaving(false)
    }
  }

  function openEdit(room: Room) {
    setRoomForm({
      room_number: room.room_number,
      floor: room.floor?.toString() || "",
      room_type_id: room.room_type_id || "",
      status: room.status,
      notes: room.notes || "",
    })
    setEditRoom(room)
    setShowAddRoom(true)
  }

  const counts = STATUS_LIST.reduce((acc, s) => {
    acc[s] = s === "all" ? rooms.length : rooms.filter((r) => r.status === s).length
    return acc
  }, {} as Record<string, number>)

  const filtered = filter === "all" ? rooms : rooms.filter((r) => r.status === filter)

  if (loading) {
    return (
      <div style={{ padding: isMobile ? "12px" : "28px", overflowX: "hidden", width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(160px, 1fr))", gap: isMobile ? "10px" : "16px" }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="skeleton" style={{ height: "140px", borderRadius: "16px" }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      padding: isMobile ? "12px" : "28px",
      maxWidth: "1400px",
      margin: "0 auto",
      overflowX: "hidden",
      width: "100%",
      boxSizing: "border-box",
    }}>

      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: isMobile ? "16px" : "24px",
        flexWrap: "wrap",
        gap: "10px",
      }}>
        <div>
          <h1 className="page-title" style={{ fontSize: isMobile ? "18px" : undefined }}>Rooms</h1>
          <p className="page-sub">{rooms.length} rooms &middot; {counts.available || 0} available</p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchAll}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowAddType(true)}>
            <Plus size={13} /> Add Type
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => {
            setEditRoom(null)
            setRoomForm({ room_number: "", floor: "", room_type_id: "", status: "available", notes: "" })
            setShowAddRoom(true)
          }}>
            <Plus size={13} /> Add Room
          </button>
        </div>
      </div>

      {/* Room Type Cards */}
      {roomTypes.length > 0 && (
        <div style={{
          display: "flex",
          gap: "10px",
          overflowX: "auto",
          marginBottom: "20px",
          paddingBottom: "6px",
          flexWrap: "nowrap",
          WebkitOverflowScrolling: "touch",
        }}>
          {roomTypes.map((t) => (
            <div key={t.id} style={{
              flexShrink: 0,
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "12px 16px",
              minWidth: isMobile ? "130px" : "140px",
            }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>{t.name}</div>
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: "13px", color: "var(--accent-light)", fontWeight: 500 }}>{fmt(t.base_price)}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Capacity: {t.capacity}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter + View Toggle */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "20px",
        gap: "8px",
        flexWrap: isMobile ? "wrap" : "nowrap",
      }}>
        <div style={{
          display: "flex",
          gap: "6px",
          overflowX: "auto",
          flexWrap: "nowrap",
          WebkitOverflowScrolling: "touch",
          paddingBottom: "4px",
          flex: 1,
          minWidth: 0,
        }}>
          {STATUS_LIST.map((s) => (
            <button key={s} className={"filter-tab" + (filter === s ? " active" : "")} onClick={() => setFilter(s)}
              style={{ flexShrink: 0 }}>
              {s === "all" ? "All Rooms" : STATUS_META[s]?.label || s}
              <span className="tab-count">{counts[s] || 0}</span>
            </button>
          ))}
        </div>
        <div style={{
          display: "flex",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          padding: "3px",
          gap: "2px",
          flexShrink: 0,
        }}>
          {(["grid", "list"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "5px 12px",
              borderRadius: "7px",
              border: "none",
              cursor: "pointer",
              background: view === v ? "var(--bg-elevated)" : "transparent",
              color: view === v ? "var(--text-primary)" : "var(--text-muted)",
              fontSize: "12px",
              fontWeight: 500,
              transition: "all 150ms ease",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}>
              {v === "grid" ? <Grid3X3 size={13} /> : <List size={13} />}
              {v === "grid" ? "Grid" : "List"}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="card-surface">
          <div className="empty-state">
            <BedDouble size={40} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
            <div className="empty-state-title">No rooms found</div>
            <div className="empty-state-sub">
              {filter === "all" ? "Add your first room to get started" : "No rooms with this status"}
            </div>
            {filter === "all" && (
              <button className="btn btn-primary btn-sm" style={{ marginTop: "20px" }} onClick={() => setShowAddRoom(true)}>
                <Plus size={13} /> Add Room
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grid View */}
      {view === "grid" && filtered.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(165px, 1fr))",
          gap: isMobile ? "10px" : "14px",
        }}>
          {filtered.map((room) => {
            const meta = STATUS_META[room.status] || STATUS_META.blocked
            return (
              <div key={room.id} className="card-surface" style={{ padding: isMobile ? "12px" : "16px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: meta.color, borderRadius: "16px 16px 0 0" }} />
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px", gap: "4px" }}>
                  <div style={{
                    fontFamily: '"DM Mono", monospace',
                    fontSize: isMobile ? "16px" : "20px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.5px",
                  }}>
                    {room.room_number}
                  </div>
                  <span className={"pill " + meta.pill} style={{ fontSize: "9px", padding: "2px 6px", flexShrink: 0 }}>
                    {meta.label}
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>
                  {room.room_type?.name || "No type"}
                </div>
                {room.room_type?.base_price && (
                  <div style={{ fontFamily: '"DM Mono", monospace', fontSize: "11px", color: "var(--accent-light)", fontWeight: 500 }}>
                    {fmt(room.room_type.base_price)}
                    <span style={{ color: "var(--text-muted)", fontFamily: '"DM Sans", sans-serif' }}>/night</span>
                  </div>
                )}
                {room.floor && (
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>Floor {room.floor}</div>
                )}
                <div style={{ display: "flex", gap: "5px", marginTop: "10px" }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1, padding: "4px 0", fontSize: "10px" }} onClick={() => openEdit(room)}>
                    <Edit2 size={10} /> Edit
                  </button>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1, padding: "4px 0", fontSize: "10px" }} onClick={() => cycleStatus(room)}>
                    <RefreshCw size={10} />
                    {isMobile ? "→" : (NEXT_STATUS[room.status] ? (STATUS_META[NEXT_STATUS[room.status]]?.label || "Next") : "Next")}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* List View */}
      {view === "list" && filtered.length > 0 && (
        <div className="card-surface" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table className="data-table" style={{ minWidth: isMobile ? "540px" : undefined }}>
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Type</th>
                  <th>Floor</th>
                  <th>Rate / Night</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((room) => {
                  const meta = STATUS_META[room.status] || STATUS_META.blocked
                  return (
                    <tr key={room.id}>
                      <td>
                        <span style={{ fontFamily: '"DM Mono", monospace', fontSize: "15px", fontWeight: 600, color: "var(--accent-light)" }}>
                          {room.room_number}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>{room.room_type?.name || "—"}</td>
                      <td>
                        <span style={{ fontFamily: '"DM Mono", monospace', color: "var(--text-secondary)" }}>
                          {room.floor ?? "—"}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: '"DM Mono", monospace', color: "var(--text-primary)" }}>
                          {room.room_type?.base_price ? fmt(room.room_type.base_price) : "—"}
                        </span>
                      </td>
                      <td><span className={"pill " + meta.pill}>{meta.label}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(room)}>
                            <Edit2 size={12} /> Edit
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={() => cycleStatus(room)}>
                            <RefreshCw size={12} /> {NEXT_STATUS[room.status] ? (STATUS_META[NEXT_STATUS[room.status]]?.label || "Next") : "Next"}
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

      {/* Add / Edit Room Modal */}
      {showAddRoom && (
        <Modal title={editRoom ? "Edit Room " + editRoom.room_number : "Add New Room"} onClose={() => { setShowAddRoom(false); setEditRoom(null) }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Room Number *</label>
                <input className="form-input" style={{ fontFamily: '"DM Mono", monospace' }} placeholder="e.g. 101"
                  value={roomForm.room_number} onChange={(e) => setRoomForm((p) => ({ ...p, room_number: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Floor</label>
                <input className="form-input" style={{ fontFamily: '"DM Mono", monospace' }} type="number" placeholder="e.g. 1"
                  value={roomForm.floor} onChange={(e) => setRoomForm((p) => ({ ...p, floor: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Room Type</label>
                <select className="form-select" value={roomForm.room_type_id}
                  onChange={(e) => setRoomForm((p) => ({ ...p, room_type_id: e.target.value }))}>
                  <option value="">No type</option>
                  {roomTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={roomForm.status}
                  onChange={(e) => setRoomForm((p) => ({ ...p, status: e.target.value }))}>
                  {Object.entries(STATUS_META).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" placeholder="Optional notes about this room..."
                value={roomForm.notes} onChange={(e) => setRoomForm((p) => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => { setShowAddRoom(false); setEditRoom(null) }}>Cancel</button>
            <button className="btn btn-primary" onClick={saveRoom} disabled={saving}>
              {saving ? "Saving..." : editRoom ? "Save Changes" : "Add Room"}
            </button>
          </div>
        </Modal>
      )}

      {/* Add Room Type Modal */}
      {showAddType && (
        <Modal title="Add Room Type" onClose={() => setShowAddType(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Type Name *</label>
              <input className="form-input" placeholder="e.g. Deluxe Double"
                value={typeForm.name} onChange={(e) => setTypeForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Base Price / Night (&#8377;)</label>
                <input className="form-input" style={{ fontFamily: '"DM Mono", monospace' }} type="number" placeholder="e.g. 2500"
                  value={typeForm.base_price} onChange={(e) => setTypeForm((p) => ({ ...p, base_price: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Capacity (guests)</label>
                <input className="form-input" style={{ fontFamily: '"DM Mono", monospace' }} type="number" placeholder="e.g. 2"
                  value={typeForm.capacity} onChange={(e) => setTypeForm((p) => ({ ...p, capacity: e.target.value }))} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowAddType(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveType} disabled={saving}>
              {saving ? "Saving..." : "Add Type"}
            </button>
          </div>
        </Modal>
      )}

    </div>
  )
}
