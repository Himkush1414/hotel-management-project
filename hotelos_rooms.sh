#!/bin/bash
# HotelOS — Rooms Page Redesign
# Run: bash hotelos_rooms.sh
cd ~/Downloads/hotel-management-project

python3 << 'PYEOF'
import os

# ── Find rooms dir ──────────────────────────────────────────────
for d in ['src/app/(admin)/rooms', 'src/app/rooms']:
    if os.path.exists(d):
        rooms_dir = d
        break
else:
    rooms_dir = 'src/app/(admin)/rooms'
    os.makedirs(rooms_dir, exist_ok=True)

# ── Server page ─────────────────────────────────────────────────
server = '''\
import { createClient } from "@/lib/supabase/server"
import { RoomsClient } from "./RoomsClient"

export default async function RoomsPage() {
  const supabase = await createClient()
  const hotelId  = process.env.NEXT_PUBLIC_HOTEL_ID!

  const [{ data: rooms }, { data: roomTypes }] = await Promise.all([
    supabase
      .from("rooms")
      .select("*, room_type_id:room_type_ids(id, name, base_price, max_occupancy)")
      .eq("hotel_id", hotelId)
      .order("room_number"),
    supabase
      .from("room_type_ids")
      .select("*")
      .eq("hotel_id", hotelId)
      .order("name"),
  ])

  return <RoomsClient rooms={rooms || []} roomTypes={roomTypes || []} hotelId={hotelId} />
}
'''

# ── Client component ────────────────────────────────────────────
client = '''\
"use client"

import { useState, useTransition } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

/* ─── Types ─────────────────────────────── */
interface RoomType { id: string; name: string; base_price: number; max_occupancy: number; description?: string }
interface Room {
  id: string; room_number: string; floor?: number
  status: "available"|"occupied"|"cleaning"|"maintenance"|"blocked"
  room_type_id: RoomType | null
}
interface Props { rooms: Room[]; roomTypes: RoomType[]; hotelId: string }

/* ─── Status config ─────────────────────── */
const STATUS_CFG = {
  available:   { bg:"rgba(0,184,148,0.15)",   border:"rgba(0,184,148,0.3)",   text:"#00b894", label:"Available" },
  occupied:    { bg:"rgba(108,92,231,0.2)",    border:"rgba(108,92,231,0.4)",  text:"#a29bfe", label:"Occupied" },
  cleaning:    { bg:"rgba(253,203,110,0.15)",  border:"rgba(253,203,110,0.3)", text:"#fdcb6e", label:"Cleaning" },
  maintenance: { bg:"rgba(225,112,85,0.15)",   border:"rgba(225,112,85,0.3)",  text:"#e17055", label:"Maintenance" },
  blocked:     { bg:"rgba(255,255,255,0.06)",  border:"rgba(255,255,255,0.1)", text:"rgba(255,255,255,0.35)", label:"Blocked" },
} as const

const STATUSES = ["available","occupied","cleaning","maintenance","blocked"] as const

/* ─── Helpers ───────────────────────────── */
const S: React.CSSProperties = { color:"var(--text-muted)" }
const fmt = (n: number) => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n)

/* ─── Modal shell ───────────────────────── */
function Modal({ title, onClose, children }: { title:string; onClose:()=>void; children:React.ReactNode }) {
  return (
    <div style={{ position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)" }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"#13131f",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,padding:28,width:480,maxWidth:"90vw",maxHeight:"85vh",overflowY:"auto" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22 }}>
          <h2 style={{ fontSize:16,fontWeight:600,margin:0 }}>{title}</h2>
          <button onClick={onClose} style={{ background:"none",border:"none",color:"rgba(255,255,255,0.4)",fontSize:20,cursor:"pointer",lineHeight:1,padding:4 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ─── Input ─────────────────────────────── */
function FInput({ label, ...p }: { label:string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:11,fontWeight:600,letterSpacing:"0.6px",textTransform:"uppercase",...S,display:"block",marginBottom:6 }}>{label}</label>
      <input {...p} style={{ width:"100%",padding:"10px 12px",fontSize:13,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"var(--text-primary)",outline:"none",...(p.style||{}) }}/>
    </div>
  )
}
function FSelect({ label, children, ...p }: { label:string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:11,fontWeight:600,letterSpacing:"0.6px",textTransform:"uppercase",...S,display:"block",marginBottom:6 }}>{label}</label>
      <select {...p} style={{ width:"100%",padding:"10px 12px",fontSize:13,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"var(--text-primary)",outline:"none" }}>
        {children}
      </select>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
export function RoomsClient({ rooms: initialRooms, roomTypes: initialRoomTypes, hotelId }: Props) {
  const supabase = createClient()
  const [rooms,     setRooms]     = useState<Room[]>(initialRooms)
  const [roomTypes, setRoomTypes] = useState<RoomType[]>(initialRoomTypes)
  const [filter,    setFilter]    = useState<string>("all")
  const [view,      setView]      = useState<"grid"|"list">("grid")
  const [modal,     setModal]     = useState<"addRoom"|"addType"|"editRoom"|null>(null)
  const [editing,   setEditing]   = useState<Room|null>(null)
  const [isPending, startTransition] = useTransition()

  /* ── Add Room Type ── */
  const [typeName,  setTypeName]  = useState("")
  const [typePrice, setTypePrice] = useState("")
  const [typeOcc,   setTypeOcc]   = useState("2")
  const [typeDesc,  setTypeDesc]  = useState("")

  const handleAddType = async () => {
    if (!typeName || !typePrice) { toast.error("Name and price required"); return }
    const { data, error } = await supabase.from("room_type_ids").insert({
      hotel_id: hotelId, name: typeName,
      base_price: parseFloat(typePrice),
      max_occupancy: parseInt(typeOcc),
      description: typeDesc || null,
    }).select().single()
    if (error) { toast.error(error.message); return }
    setRoomTypes(prev => [...prev, data as RoomType])
    toast.success(`Room type "${typeName}" added`)
    setTypeName(""); setTypePrice(""); setTypeOcc("2"); setTypeDesc("")
    setModal(null)
  }

  /* ── Add / Edit Room ── */
  const [roomNum,    setRoomNum]    = useState("")
  const [roomFloor,  setRoomFloor]  = useState("1")
  const [roomTypeId, setRoomTypeId] = useState("")
  const [roomStatus, setRoomStatus] = useState<typeof STATUSES[number]>("available")

  const openAddRoom = () => {
    setRoomNum(""); setRoomFloor("1"); setRoomTypeId(roomTypes[0]?.id||""); setRoomStatus("available")
    setEditing(null); setModal("addRoom")
  }
  const openEditRoom = (r: Room) => {
    setRoomNum(r.room_number); setRoomFloor(String(r.floor||1))
    setRoomTypeId((r.room_type_id as any)?.id || ""); setRoomStatus(r.status)
    setEditing(r); setModal("addRoom")
  }

  const handleSaveRoom = async () => {
    if (!roomNum) { toast.error("Room number required"); return }
    const payload: any = {
      hotel_id: hotelId, room_number: roomNum,
      floor: parseInt(roomFloor), status: roomStatus,
      room_type_id: roomTypeId || null,
    }
    if (editing) {
      const { error } = await supabase.from("rooms").update(payload).eq("id", editing.id)
      if (error) { toast.error(error.message); return }
      const { data } = await supabase.from("rooms").select("*, room_type_id:room_type_ids(id,name,base_price,max_occupancy)").eq("id", editing.id).single()
      setRooms(prev => prev.map(r => r.id === editing.id ? (data as Room) : r))
      toast.success(`Room ${roomNum} updated`)
    } else {
      const { data, error } = await supabase.from("rooms").insert(payload).select("*, room_type_id:room_type_ids(id,name,base_price,max_occupancy)").single()
      if (error) { toast.error(error.message); return }
      setRooms(prev => [...prev, data as Room])
      toast.success(`Room ${roomNum} added`)
    }
    setModal(null)
  }

  /* ── Change room status inline ── */
  const cycleStatus = async (room: Room) => {
    const order: typeof STATUSES[number][] = ["available","cleaning","maintenance","blocked"]
    if (room.status === "occupied") { toast.error("Cannot change occupied room status here"); return }
    const next = order[(order.indexOf(room.status as any)+1) % order.length]
    const { error } = await supabase.from("rooms").update({ status: next }).eq("id", room.id)
    if (error) { toast.error(error.message); return }
    setRooms(prev => prev.map(r => r.id===room.id ? {...r, status: next} : r))
    toast.success(`Room ${room.room_number} → ${next}`)
  }

  /* ── Derived ── */
  const filtered = filter === "all" ? rooms : rooms.filter(r => r.status === filter)
  const stats = STATUSES.reduce((acc, s) => ({ ...acc, [s]: rooms.filter(r=>r.status===s).length }), {} as Record<string,number>)

  return (
    <div>
      {/* Page header */}
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:22,fontWeight:600,letterSpacing:-0.5,margin:0 }}>Rooms</h1>
          <p style={{ fontSize:13,marginTop:3,...S }}>{rooms.length} rooms · {stats.occupied||0} occupied · {stats.available||0} available</p>
        </div>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={()=>setModal("addType")} style={{ fontSize:12,padding:"7px 16px",borderRadius:10,border:"1px solid rgba(255,255,255,0.12)",background:"transparent",color:"rgba(255,255,255,0.7)",cursor:"pointer" }}>
            + Room Type
          </button>
          <button onClick={openAddRoom} style={{ fontSize:12,padding:"7px 16px",borderRadius:10,border:"none",background:"#6c5ce7",color:"#fff",fontWeight:500,cursor:"pointer" }}>
            + Add Room
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:24 }}>
        {STATUSES.map(s => {
          const cfg = STATUS_CFG[s]
          return (
            <button key={s} onClick={()=>setFilter(filter===s?"all":s)}
              style={{ padding:"12px 14px",borderRadius:14,border:`1px solid ${filter===s?cfg.border:"rgba(255,255,255,0.07)"}`,
                background:filter===s?cfg.bg:"rgba(255,255,255,0.03)",cursor:"pointer",textAlign:"left",transition:"all 0.15s" }}>
              <div style={{ fontSize:22,fontWeight:600,color:cfg.text,letterSpacing:-1 }}>{stats[s]||0}</div>
              <div style={{ fontSize:11,marginTop:3,...S }}>{cfg.label}</div>
            </button>
          )
        })}
      </div>

      {/* Room types row */}
      {roomTypes.length > 0 && (
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:11,fontWeight:600,letterSpacing:"0.8px",textTransform:"uppercase",...S,marginBottom:10 }}>Room Types</div>
          <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
            {roomTypes.map(rt => (
              <div key={rt.id} style={{ padding:"10px 16px",borderRadius:12,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.04)",display:"flex",alignItems:"center",gap:14 }}>
                <div>
                  <div style={{ fontSize:13,fontWeight:500,color:"var(--text-primary)" }}>{rt.name}</div>
                  <div style={{ fontSize:11,...S,marginTop:2 }}>Max {rt.max_occupancy} guests · {fmt(rt.base_price)}/night</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View toggle + filter info */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
        <div style={{ fontSize:13,...S }}>
          {filter==="all" ? `All ${rooms.length} rooms` : `${filtered.length} ${filter} rooms`}
        </div>
        <div style={{ display:"flex",gap:4,background:"rgba(255,255,255,0.04)",borderRadius:10,padding:3 }}>
          {(["grid","list"] as const).map(v => (
            <button key={v} onClick={()=>setView(v)} style={{
              padding:"5px 12px",borderRadius:8,border:"none",fontSize:12,fontWeight:500,cursor:"pointer",
              background: view===v?"rgba(108,92,231,0.25)":"transparent",
              color: view===v?"#a29bfe":"rgba(255,255,255,0.4)",
            }}>{v==="grid"?"⊞ Grid":"≡ List"}</button>
          ))}
        </div>
      </div>

      {/* GRID VIEW */}
      {view === "grid" && (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12 }}>
          {filtered.map(room => {
            const cfg = STATUS_CFG[room.status]
            const rt = room.room_type_id as any
            return (
              <div key={room.id}
                style={{ border:`1px solid ${cfg.border}`,background:cfg.bg,borderRadius:16,padding:16,cursor:"pointer",transition:"all 0.15s",position:"relative" }}
                onMouseEnter={e=>(e.currentTarget.style.transform="translateY(-2px)")}
                onMouseLeave={e=>(e.currentTarget.style.transform="translateY(0)")}>
                <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12 }}>
                  <div style={{ fontSize:20,fontWeight:700,letterSpacing:-1,color:cfg.text }}>{room.room_number}</div>
                  <span style={{ fontSize:9,fontWeight:600,padding:"3px 7px",borderRadius:99,background:"rgba(0,0,0,0.2)",color:cfg.text,letterSpacing:"0.3px" }}>
                    {cfg.label.toUpperCase()}
                  </span>
                </div>
                {rt && <div style={{ fontSize:12,color:"rgba(255,255,255,0.6)",marginBottom:4 }}>{rt.name}</div>}
                {rt && <div style={{ fontSize:11,...S }}>{fmt(rt.base_price)}/night</div>}
                {!rt && <div style={{ fontSize:11,...S }}>No type assigned</div>}
                <div style={{ display:"flex",gap:6,marginTop:14 }}>
                  <button onClick={()=>openEditRoom(room)}
                    style={{ flex:1,fontSize:11,padding:"5px 0",borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.6)",cursor:"pointer" }}>
                    Edit
                  </button>
                  {room.status !== "occupied" && (
                    <button onClick={()=>cycleStatus(room)}
                      style={{ flex:1,fontSize:11,padding:"5px 0",borderRadius:8,border:`1px solid ${cfg.border}`,background:"rgba(0,0,0,0.15)",color:cfg.text,cursor:"pointer" }}>
                      Status ↻
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="empty-state" style={{ gridColumn:"1/-1",padding:"60px 0" }}>
              <div style={{ fontSize:32,marginBottom:8 }}>🛏</div>
              <div>{rooms.length===0?"No rooms added yet — click \"+ Add Room\" to start":"No rooms match this filter"}</div>
            </div>
          )}
        </div>
      )}

      {/* LIST VIEW */}
      {view === "list" && (
        <div className="card-surface" style={{ overflow:"hidden" }}>
          <table className="data-table">
            <thead><tr><th>Room</th><th>Type</th><th>Floor</th><th>Rate/Night</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(room => {
                const cfg = STATUS_CFG[room.status]
                const rt = room.room_type_id as any
                return (
                  <tr key={room.id}>
                    <td><span style={{ fontWeight:600,fontSize:15,color:"var(--text-primary)" }}>{room.room_number}</span></td>
                    <td>{rt?.name || <span style={{ ...S,fontSize:12 }}>—</span>}</td>
                    <td style={{ fontSize:12,...S }}>{room.floor||"—"}</td>
                    <td style={{ fontFamily:"DM Mono,monospace",fontSize:12 }}>{rt ? fmt(rt.base_price) : "—"}</td>
                    <td><span style={{ fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:99,background:cfg.bg,color:cfg.text,border:`1px solid ${cfg.border}` }}>{cfg.label}</span></td>
                    <td>
                      <div style={{ display:"flex",gap:6 }}>
                        <button onClick={()=>openEditRoom(room)} style={{ fontSize:12,padding:"4px 12px",borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.7)",cursor:"pointer" }}>Edit</button>
                        {room.status!=="occupied"&&<button onClick={()=>cycleStatus(room)} style={{ fontSize:12,padding:"4px 12px",borderRadius:8,border:`1px solid ${cfg.border}`,background:cfg.bg,color:cfg.text,cursor:"pointer" }}>↻</button>}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length===0&&<tr><td colSpan={6}><div className="empty-state">No rooms found</div></td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MODAL: Add Room Type ── */}
      {modal === "addType" && (
        <Modal title="Add Room Type" onClose={()=>setModal(null)}>
          <FInput label="Type Name" placeholder="e.g. Deluxe Suite" value={typeName} onChange={e=>setTypeName(e.target.value)}/>
          <FInput label="Base Price (₹/night)" type="number" placeholder="2500" value={typePrice} onChange={e=>setTypePrice(e.target.value)}/>
          <FInput label="Max Occupancy" type="number" min="1" max="10" value={typeOcc} onChange={e=>setTypeOcc(e.target.value)}/>
          <FInput label="Description (optional)" placeholder="Spacious room with city view" value={typeDesc} onChange={e=>setTypeDesc(e.target.value)}/>
          <div style={{ display:"flex",gap:10,marginTop:6 }}>
            <button onClick={()=>setModal(null)} style={{ flex:1,padding:"10px 0",borderRadius:10,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"rgba(255,255,255,0.6)",cursor:"pointer",fontSize:13 }}>Cancel</button>
            <button onClick={handleAddType} style={{ flex:1,padding:"10px 0",borderRadius:10,border:"none",background:"#6c5ce7",color:"#fff",fontWeight:500,cursor:"pointer",fontSize:13 }}>Add Type</button>
          </div>
        </Modal>
      )}

      {/* ── MODAL: Add / Edit Room ── */}
      {modal === "addRoom" && (
        <Modal title={editing?"Edit Room":"Add Room"} onClose={()=>setModal(null)}>
          <FInput label="Room Number" placeholder="101" value={roomNum} onChange={e=>setRoomNum(e.target.value)}/>
          <FInput label="Floor" type="number" min="1" value={roomFloor} onChange={e=>setRoomFloor(e.target.value)}/>
          {roomTypes.length > 0 ? (
            <FSelect label="Room Type" value={roomTypeId} onChange={e=>setRoomTypeId(e.target.value)}>
              <option value="">— No type —</option>
              {roomTypes.map(rt=><option key={rt.id} value={rt.id}>{rt.name} · {fmt(rt.base_price)}/night</option>)}
            </FSelect>
          ) : (
            <div style={{ padding:"10px 14px",borderRadius:10,background:"rgba(253,203,110,0.08)",border:"1px solid rgba(253,203,110,0.2)",marginBottom:14,fontSize:12,color:"#fdcb6e" }}>
              Add a room type first before adding rooms
            </div>
          )}
          <FSelect label="Status" value={roomStatus} onChange={e=>setRoomStatus(e.target.value as any)}>
            {STATUSES.map(s=><option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
          </FSelect>
          <div style={{ display:"flex",gap:10,marginTop:6 }}>
            <button onClick={()=>setModal(null)} style={{ flex:1,padding:"10px 0",borderRadius:10,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"rgba(255,255,255,0.6)",cursor:"pointer",fontSize:13 }}>Cancel</button>
            <button onClick={handleSaveRoom} style={{ flex:1,padding:"10px 0",borderRadius:10,border:"none",background:"#6c5ce7",color:"#fff",fontWeight:500,cursor:"pointer",fontSize:13 }}>{editing?"Save Changes":"Add Room"}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
'''

with open(os.path.join(rooms_dir, 'page.tsx'), 'w') as f:
    f.write(server)
print("✅ rooms/page.tsx written")

with open(os.path.join(rooms_dir, 'RoomsClient.tsx'), 'w') as f:
    f.write(client)
print("✅ rooms/RoomsClient.tsx written")
PYEOF

echo "✅ Rooms page done"
