"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

const STATUS_LIST = ["all", "available", "occupied", "maintenance", "cleaning", "reserved", "blocked"]

const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  available:   { label: "Available",   color: "#00b894", bg: "rgba(0,184,148,0.1)",   border: "rgba(0,184,148,0.25)"   },
  occupied:    { label: "Occupied",    color: "#a29bfe", bg: "rgba(162,155,254,0.1)", border: "rgba(162,155,254,0.25)" },
  maintenance: { label: "Maintenance", color: "#e17055", bg: "rgba(225,112,85,0.1)",  border: "rgba(225,112,85,0.25)"  },
  cleaning:    { label: "Cleaning",    color: "#fdcb6e", bg: "rgba(253,203,110,0.1)", border: "rgba(253,203,110,0.25)" },
  reserved:    { label: "Reserved",    color: "#74b9ff", bg: "rgba(116,185,255,0.1)", border: "rgba(116,185,255,0.25)" },
  blocked:     { label: "Blocked",     color: "rgba(240,240,248,0.38)", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)" },
}

const NEXT_STATUS: Record<string, string> = {
  available: "occupied", occupied: "cleaning", cleaning: "available",
  maintenance: "available", reserved: "available", blocked: "available",
}

interface RoomType { id: string; name: string; base_price: number; capacity: number }
interface Room {
  id: string; room_number: string; floor?: number | null
  status: string; room_type_id?: string | null; notes?: string | null
  room_type?: RoomType | null
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
const IcoEdit = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <path d="M7.5 1.5l2 2L3 10H1V8L7.5 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoGrid = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <rect x="1" y="1" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="7.5" y="1" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="1" y="7.5" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="7.5" y="7.5" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
  </svg>
)
const IcoList = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M4 3.5h8M4 6.5h8M4 9.5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="1.5" cy="3.5" r="1" fill="currentColor"/>
    <circle cx="1.5" cy="6.5" r="1" fill="currentColor"/>
    <circle cx="1.5" cy="9.5" r="1" fill="currentColor"/>
  </svg>
)
const IcoArrow = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <path d="M2 5.5h7M6 3l3 2.5L6 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ── Status Pill ───────────────────────────────────────────────────────────────
function StatusPill({ status, small }: { status: string; small?: boolean }) {
  const m = STATUS_META[status] || STATUS_META.blocked
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      fontSize: small ? "9px" : "10px", fontWeight: 600, letterSpacing: "0.02em",
      padding: small ? "2px 6px" : "3px 9px", borderRadius: "99px",
      color: m.color, background: m.bg, border: "1px solid " + m.border,
      whiteSpace: "nowrap", flexShrink: 0,
    }}>
      {m.label}
    </span>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function RoomsClient() {
  const supabase = createClient()
  const [rooms, setRooms]         = useState<Room[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState("all")
  const [view, setView]           = useState<"grid" | "list">("grid")
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [showAddType, setShowAddType] = useState(false)
  const [editRoom, setEditRoom]   = useState<Room | null>(null)
  const [saving, setSaving]       = useState(false)
  const [isMobile, setIsMobile]   = useState(false)

  const [roomForm, setRoomForm] = useState({ room_number: "", floor: "", room_type_id: "", status: "available", notes: "" })
  const [typeForm, setTypeForm] = useState({ name: "", base_price: "", capacity: "" })

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
      const db = supabase as any
      const { data: r } = await db.from("rooms").select("id, room_number, floor, status, room_type_id, notes, room_type:room_types(id, name, base_price, capacity)").order("room_number", { ascending: true })
      const { data: t } = await db.from("room_types").select("id, name, base_price, capacity").order("name", { ascending: true })
      setRooms((r as Room[]) || [])
      setRoomTypes((t as RoomType[]) || [])
    } catch { toast.error("Failed to load rooms") }
    finally { setLoading(false) }
  }

  async function cycleStatus(room: Room) {
    const next = NEXT_STATUS[room.status] || "available"
    const { error } = await supabase.from("rooms").update({ status: next } as any).eq("id", room.id)
    if (error) { toast.error("Failed to update status") }
    else {
      toast.success("Room " + room.room_number + " → " + next)
      setRooms((prev) => prev.map((r) => r.id === room.id ? { ...r, status: next } : r))
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
      setShowAddRoom(false); setEditRoom(null)
      setRoomForm({ room_number: "", floor: "", room_type_id: "", status: "available", notes: "" })
      fetchAll()
    } catch { toast.error("Failed to save room") }
    finally { setSaving(false) }
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
    } catch { toast.error("Failed to save room type") }
    finally { setSaving(false) }
  }

  function openEdit(room: Room) {
    setRoomForm({ room_number: room.room_number, floor: room.floor?.toString() || "", room_type_id: room.room_type_id || "", status: room.status, notes: room.notes || "" })
    setEditRoom(room)
    setShowAddRoom(true)
  }

  const counts  = STATUS_LIST.reduce((acc, s) => { acc[s] = s === "all" ? rooms.length : rooms.filter((r) => r.status === s).length; return acc }, {} as Record<string, number>)
  const filtered = filter === "all" ? rooms : rooms.filter((r) => r.status === filter)

  if (loading) return (
    <div style={{ padding: isMobile ? "12px" : "28px", overflowX: "hidden", width: "100%", boxSizing: "border-box" }}>
      <div style={{ height: "56px", background: "rgba(255,255,255,0.03)", borderRadius: "0", marginBottom: "16px" }} className="skeleton" />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(auto-fill,minmax(160px,1fr))", gap: isMobile ? "10px" : "14px" }}>
        {[1,2,3,4,5,6,7,8].map((i) => <div key={i} className="skeleton" style={{ height: "140px", borderRadius: "12px" }} />)}
      </div>
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
          <div style={{ fontSize: isMobile ? "15px" : "16px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>Rooms</div>
          {!isMobile && <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>{rooms.length} rooms &middot; {counts.available || 0} available</div>}
        </div>
        <button onClick={fetchAll} style={{ height: "32px", padding: "0 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(240,240,248,0.6)", fontSize: "12px", fontWeight: 500, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "all 150ms ease" }}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.09)";e.currentTarget.style.color="rgba(240,240,248,0.9)"}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.color="rgba(240,240,248,0.6)"}}
        >
          <IcoRefresh />{!isMobile && "Refresh"}
        </button>
        {!isMobile && (
          <button onClick={() => setShowAddType(true)} style={{ height: "32px", padding: "0 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(240,240,248,0.6)", fontSize: "12px", fontWeight: 500, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "all 150ms ease" }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.09)";e.currentTarget.style.color="rgba(240,240,248,0.9)"}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.color="rgba(240,240,248,0.6)"}}
          >
            <IcoPlus /> Add Type
          </button>
        )}
        <button
          onClick={() => { setEditRoom(null); setRoomForm({ room_number: "", floor: "", room_type_id: "", status: "available", notes: "" }); setShowAddRoom(true) }}
          style={{ height: "32px", padding: "0 14px", background: "var(--accent)", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px", fontWeight: 600, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 0 18px rgba(108,92,231,0.3)", transition: "all 150ms ease", letterSpacing: "-0.1px" }}
          onMouseEnter={e=>{e.currentTarget.style.background="#7d6ff0";e.currentTarget.style.boxShadow="0 0 24px rgba(108,92,231,0.45)"}}
          onMouseLeave={e=>{e.currentTarget.style.background="var(--accent)";e.currentTarget.style.boxShadow="0 0 18px rgba(108,92,231,0.3)"}}
        >
          <IcoPlus /> Add Room
        </button>
      </div>

      <div style={{ padding: isMobile ? "12px" : "28px", maxWidth: "1400px", margin: "0 auto" }}>

        {/* Room type chips */}
        {roomTypes.length > 0 && (
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", marginBottom: "18px", paddingBottom: "4px", flexWrap: "nowrap", WebkitOverflowScrolling: "touch" }}>
            {roomTypes.map((t) => (
              <div key={t.id} style={{
                flexShrink: 0,
                background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px", padding: "10px 14px",
                minWidth: isMobile ? "120px" : "130px",
              }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "3px" }}>{t.name}</div>
                <div style={{ fontFamily: '"DM Mono",monospace', fontSize: "12px", color: "var(--accent-light)", fontWeight: 600 }}>{fmt(t.base_price)}</div>
                <div style={{ fontSize: "10px", color: "rgba(240,240,248,0.35)", marginTop: "2px" }}>{t.capacity} guests</div>
              </div>
            ))}
          </div>
        )}

        {/* Filter + view toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", gap: "8px", flexWrap: isMobile ? "wrap" : "nowrap" }}>
          <div style={{ display: "flex", gap: "3px", overflowX: "auto", flexWrap: "nowrap", WebkitOverflowScrolling: "touch", paddingBottom: "2px", flex: 1, minWidth: 0, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "3px" }}>
            {STATUS_LIST.map((s) => (
              <button key={s} onClick={() => setFilter(s)} style={{
                flexShrink: 0, height: "28px", padding: "0 10px",
                borderRadius: "7px", border: "none",
                fontSize: "11px", fontWeight: 500, fontFamily: '"DM Sans",sans-serif',
                cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
                transition: "all 150ms ease",
                background: filter === s ? "var(--bg-elevated)" : "transparent",
                color: filter === s ? "var(--text-primary)" : "rgba(240,240,248,0.45)",
              }}>
                {s === "all" ? "All" : (STATUS_META[s]?.label || s)}
                <span style={{ background: filter === s ? "rgba(108,92,231,0.2)" : "rgba(255,255,255,0.07)", color: filter === s ? "var(--accent-light)" : "rgba(240,240,248,0.35)", borderRadius: "99px", fontSize: "9px", fontWeight: 700, padding: "1px 5px" }}>
                  {counts[s] || 0}
                </span>
              </button>
            ))}
          </div>

          <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "9px", padding: "3px", gap: "2px", flexShrink: 0 }}>
            {(["grid", "list"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} style={{
                height: "26px", padding: "0 10px", borderRadius: "6px", border: "none",
                cursor: "pointer",
                background: view === v ? "var(--bg-elevated)" : "transparent",
                color: view === v ? "var(--text-primary)" : "rgba(240,240,248,0.4)",
                fontSize: "12px", fontWeight: 500, transition: "all 150ms ease",
                display: "flex", alignItems: "center", gap: "5px",
                fontFamily: '"DM Sans",sans-serif',
              }}>
                {v === "grid" ? <IcoGrid /> : <IcoList />}
                {!isMobile && (v === "grid" ? "Grid" : "List")}
              </button>
            ))}
          </div>
        </div>

        {/* Empty */}
        {filtered.length === 0 && (
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "60px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "13px", color: "rgba(240,240,248,0.35)", marginBottom: "8px" }}>
              {filter === "all" ? "No rooms added yet" : "No rooms with this status"}
            </div>
            {filter === "all" && (
              <button onClick={() => setShowAddRoom(true)} style={{ marginTop: "12px", height: "32px", padding: "0 14px", background: "var(--accent)", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px", fontWeight: 600, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <IcoPlus /> Add Room
              </button>
            )}
          </div>
        )}

        {/* ── Grid view ── */}
        {view === "grid" && filtered.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(auto-fill,minmax(165px,1fr))", gap: isMobile ? "10px" : "14px" }}>
            {filtered.map((room) => {
              const meta = STATUS_META[room.status] || STATUS_META.blocked
              const nextLabel = NEXT_STATUS[room.status] ? (STATUS_META[NEXT_STATUS[room.status]]?.label || "Next") : "Next"
              return (
                <div key={room.id} style={{
                  background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "12px", padding: isMobile ? "12px" : "15px",
                  position: "relative", overflow: "hidden",
                  transition: "border-color 150ms ease, transform 150ms ease",
                }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.13)";e.currentTarget.style.transform="translateY(-1px)"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.07)";e.currentTarget.style.transform="translateY(0)"}}
                >
                  {/* Top accent */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2.5px", background: meta.color, borderRadius: "12px 12px 0 0", opacity: 0.8 }} />

                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px", gap: "4px" }}>
                    <div style={{ fontFamily: '"DM Mono",monospace', fontSize: isMobile ? "18px" : "22px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.5px", lineHeight: 1 }}>
                      {room.room_number}
                    </div>
                    <StatusPill status={room.status} small />
                  </div>

                  <div style={{ fontSize: "11px", color: "rgba(240,240,248,0.45)", marginBottom: "3px" }}>
                    {room.room_type?.name || "No type"}
                  </div>
                  {room.room_type?.base_price ? (
                    <div style={{ fontFamily: '"DM Mono",monospace', fontSize: "11px", color: "var(--accent-light)", fontWeight: 600 }}>
                      {fmt(room.room_type.base_price)}<span style={{ color: "rgba(240,240,248,0.3)", fontFamily: '"DM Sans",sans-serif', fontWeight: 400 }}>/night</span>
                    </div>
                  ) : null}
                  {room.floor ? <div style={{ fontSize: "10px", color: "rgba(240,240,248,0.3)", marginTop: "2px" }}>Floor {room.floor}</div> : null}

                  <div style={{ display: "flex", gap: "5px", marginTop: "11px" }}>
                    <button
                      onClick={() => openEdit(room)}
                      style={{ flex: 1, height: "28px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "7px", color: "rgba(240,240,248,0.55)", fontSize: "11px", fontWeight: 500, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", transition: "all 130ms ease" }}
                      onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.08)";e.currentTarget.style.color="rgba(240,240,248,0.9)"}}
                      onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.color="rgba(240,240,248,0.55)"}}
                    >
                      <IcoEdit /> Edit
                    </button>
                    <button
                      onClick={() => cycleStatus(room)}
                      style={{ flex: 1, height: "28px", background: meta.bg, border: "1px solid " + meta.border, borderRadius: "7px", color: meta.color, fontSize: "11px", fontWeight: 600, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", transition: "all 130ms ease" }}
                      onMouseEnter={e=>{e.currentTarget.style.opacity="0.75"}}
                      onMouseLeave={e=>{e.currentTarget.style.opacity="1"}}
                    >
                      {isMobile ? <IcoArrow /> : nextLabel}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── List view ── */}
        {view === "list" && filtered.length > 0 && (
          <div style={{ background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: isMobile ? "520px" : undefined }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.025)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    {["Room","Type","Floor","Rate / Night","Status","Actions"].map((h) => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "rgba(240,240,248,0.35)", textTransform: "uppercase", letterSpacing: "0.55px", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((room) => {
                    const meta = STATUS_META[room.status] || STATUS_META.blocked
                    const nextLabel = NEXT_STATUS[room.status] ? (STATUS_META[NEXT_STATUS[room.status]]?.label || "Next") : "Next"
                    return (
                      <tr key={room.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 120ms ease" }}
                        onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.025)"}}
                        onMouseLeave={e=>{e.currentTarget.style.background="transparent"}}
                      >
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontFamily: '"DM Mono",monospace', fontSize: "15px", fontWeight: 700, color: "var(--accent-light)" }}>{room.room_number}</span>
                        </td>
                        <td style={{ padding: "12px 16px", color: "rgba(240,240,248,0.55)", fontSize: "12px" }}>{room.room_type?.name || "—"}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontFamily: '"DM Mono",monospace', color: "rgba(240,240,248,0.55)", fontSize: "12px" }}>{room.floor ?? "—"}</span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontFamily: '"DM Mono",monospace', color: "var(--text-primary)", fontSize: "13px", fontWeight: 600 }}>
                            {room.room_type?.base_price ? fmt(room.room_type.base_price) : "—"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}><StatusPill status={room.status} /></td>
                        <td style={{ padding: "12px 10px" }}>
                          <div style={{ display: "flex", gap: "5px" }}>
                            <button onClick={() => openEdit(room)} style={{ height: "26px", padding: "0 9px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "rgba(240,240,248,0.55)", fontSize: "11px", fontWeight: 600, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", transition: "all 130ms ease" }}
                              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.09)"}}
                              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)"}}
                            >
                              <IcoEdit /> Edit
                            </button>
                            <button onClick={() => cycleStatus(room)} style={{ height: "26px", padding: "0 9px", background: meta.bg, border: "1px solid " + meta.border, borderRadius: "6px", color: meta.color, fontSize: "11px", fontWeight: 600, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap", transition: "all 130ms ease" }}
                              onMouseEnter={e=>{e.currentTarget.style.opacity="0.75"}}
                              onMouseLeave={e=>{e.currentTarget.style.opacity="1"}}
                            >
                              <IcoArrow /> {nextLabel}
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

      {/* ── Add / Edit Room Modal ── */}
      {showAddRoom && (
        <Modal title={editRoom ? "Edit Room " + editRoom.room_number : "Add New Room"} onClose={() => { setShowAddRoom(false); setEditRoom(null) }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Room Number *</label>
                <input className="form-input" style={{ fontFamily: '"DM Mono",monospace' }} placeholder="e.g. 101"
                  value={roomForm.room_number} onChange={(e) => setRoomForm((p) => ({ ...p, room_number: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Floor</label>
                <input className="form-input" style={{ fontFamily: '"DM Mono",monospace' }} type="number" placeholder="e.g. 1"
                  value={roomForm.floor} onChange={(e) => setRoomForm((p) => ({ ...p, floor: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Room Type</label>
                <select className="form-select" value={roomForm.room_type_id} onChange={(e) => setRoomForm((p) => ({ ...p, room_type_id: e.target.value }))}>
                  <option value="">No type</option>
                  {roomTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={roomForm.status} onChange={(e) => setRoomForm((p) => ({ ...p, status: e.target.value }))}>
                  {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" placeholder="Optional notes..."
                value={roomForm.notes} onChange={(e) => setRoomForm((p) => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => { setShowAddRoom(false); setEditRoom(null) }}>Cancel</button>
            <button className="btn btn-primary" onClick={saveRoom} disabled={saving}>{saving ? "Saving..." : editRoom ? "Save Changes" : "Add Room"}</button>
          </div>
        </Modal>
      )}

      {/* ── Add Room Type Modal ── */}
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
                <input className="form-input" style={{ fontFamily: '"DM Mono",monospace' }} type="number" placeholder="e.g. 2500"
                  value={typeForm.base_price} onChange={(e) => setTypeForm((p) => ({ ...p, base_price: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Capacity (guests)</label>
                <input className="form-input" style={{ fontFamily: '"DM Mono",monospace' }} type="number" placeholder="e.g. 2"
                  value={typeForm.capacity} onChange={(e) => setTypeForm((p) => ({ ...p, capacity: e.target.value }))} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowAddType(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveType} disabled={saving}>{saving ? "Saving..." : "Add Type"}</button>
          </div>
        </Modal>
      )}

    </div>
  )
}
