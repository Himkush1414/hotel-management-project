#!/bin/bash
# HotelOS — Bookings Page Redesign
# Run: bash hotelos_bookings.sh
cd ~/Downloads/hotel-management-project

python3 << 'PYEOF'
import os

for d in ['src/app/(admin)/bookings','src/app/bookings']:
    if os.path.exists(d):
        bk_dir = d; break
else:
    bk_dir = 'src/app/(admin)/bookings'
    os.makedirs(bk_dir, exist_ok=True)

server = '''\
import { createClient } from "@/lib/supabase/server"
import { BookingsClient } from "./BookingsClient"

export default async function BookingsPage() {
  const supabase = await createClient()
  const hotelId  = process.env.NEXT_PUBLIC_HOTEL_ID!

  const [{ data: bookings }, { data: guests }, { data: rooms }] = await Promise.all([
    supabase.from("bookings")
      .select(`*, guest:guests(id,full_name,phone,email), room:rooms(id,room_number,room_type_id:room_type_ids(name,base_price))`)
      .eq("hotel_id", hotelId)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("guests").select("id,full_name,phone").eq("hotel_id", hotelId).order("full_name"),
    supabase.from("rooms").select("id,room_number,status,room_type_id:room_type_ids(id,name,base_price)").eq("hotel_id", hotelId).order("room_number"),
  ])

  return <BookingsClient bookings={bookings||[]} guests={guests||[]} rooms={rooms||[]} hotelId={hotelId}/>
}
'''

client = '''\
"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const STATUS_LIST = ["pending","confirmed","checked_in","checked_out","cancelled","no_show"] as const
type BStatus = typeof STATUS_LIST[number]

const STATUS_CFG: Record<BStatus, { label:string; pill:string; bg:string; border:string; text:string }> = {
  pending:     { label:"Pending",     pill:"pill-amber",  bg:"rgba(253,203,110,0.12)", border:"rgba(253,203,110,0.25)", text:"#fdcb6e" },
  confirmed:   { label:"Confirmed",   pill:"pill-blue",   bg:"rgba(116,185,255,0.12)", border:"rgba(116,185,255,0.25)", text:"#74b9ff" },
  checked_in:  { label:"Checked In",  pill:"pill-green",  bg:"rgba(0,184,148,0.12)",   border:"rgba(0,184,148,0.25)",   text:"#00b894" },
  checked_out: { label:"Checked Out", pill:"pill-gray",   bg:"rgba(255,255,255,0.06)", border:"rgba(255,255,255,0.12)", text:"rgba(255,255,255,0.4)" },
  cancelled:   { label:"Cancelled",   pill:"pill-red",    bg:"rgba(225,112,85,0.12)",  border:"rgba(225,112,85,0.25)",  text:"#e17055" },
  no_show:     { label:"No Show",     pill:"pill-red",    bg:"rgba(225,112,85,0.12)",  border:"rgba(225,112,85,0.25)",  text:"#e17055" },
}

const S: React.CSSProperties = { color:"var(--text-muted)" }
const fmt   = (d:string) => new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short"})
const fmtFull = (d:string) => new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})
const nights  = (a:string,b:string) => Math.max(1, Math.ceil((new Date(b).getTime()-new Date(a).getTime())/86400000))

function Modal({ title, onClose, children }: { title:string; onClose:()=>void; children:React.ReactNode }) {
  return (
    <div style={{ position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.75)",backdropFilter:"blur(4px)" }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"#13131f",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,padding:28,width:560,maxWidth:"92vw",maxHeight:"88vh",overflowY:"auto" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22 }}>
          <h2 style={{ fontSize:16,fontWeight:600,margin:0 }}>{title}</h2>
          <button onClick={onClose} style={{ background:"none",border:"none",color:"rgba(255,255,255,0.4)",fontSize:22,cursor:"pointer",lineHeight:1,padding:4 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function FInput({label,...p}:{label:string}&React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div style={{marginBottom:14}}>
      <label style={{fontSize:11,fontWeight:600,letterSpacing:"0.6px",textTransform:"uppercase",...S,display:"block",marginBottom:6}}>{label}</label>
      <input {...p} style={{width:"100%",padding:"10px 12px",fontSize:13,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"var(--text-primary)",outline:"none"}}/>
    </div>
  )
}
function FSelect({label,children,...p}:{label:string}&React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div style={{marginBottom:14}}>
      <label style={{fontSize:11,fontWeight:600,letterSpacing:"0.6px",textTransform:"uppercase",...S,display:"block",marginBottom:6}}>{label}</label>
      <select {...p} style={{width:"100%",padding:"10px 12px",fontSize:13,background:"rgba(20,20,32,0.95)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"var(--text-primary)",outline:"none"}}>
        {children}
      </select>
    </div>
  )
}

export function BookingsClient({ bookings: init, guests, rooms: allRooms, hotelId }: {
  bookings: any[]; guests: any[]; rooms: any[]; hotelId: string
}) {
  const supabase = createClient()
  const [bookings, setBookings] = useState<any[]>(init)
  const [filter,   setFilter]   = useState<BStatus|"all">("all")
  const [search,   setSearch]   = useState("")
  const [modal,    setModal]    = useState<"add"|"view"|null>(null)
  const [viewing,  setViewing]  = useState<any|null>(null)

  /* New booking form */
  const today = new Date().toISOString().split("T")[0]
  const [guestId,   setGuestId]   = useState("")
  const [roomId,    setRoomId]    = useState("")
  const [checkIn,   setCheckIn]   = useState(today)
  const [checkOut,  setCheckOut]  = useState(today)
  const [adults,    setAdults]    = useState("1")
  const [children_, setChildren]  = useState("0")
  const [notes,     setNotes]     = useState("")

  /* Filtered rooms (available only for new booking) */
  const availRooms = allRooms.filter(r=>r.status==="available")

  /* Stats */
  const stats = STATUS_LIST.reduce((a,s)=>({...a,[s]:bookings.filter(b=>b.status===s).length}),{} as Record<string,number>)

  /* Filtered list */
  const filtered = bookings.filter(b => {
    const matchStatus = filter==="all" || b.status===filter
    const name   = b.guest?.full_name?.toLowerCase()||""
    const phone  = b.guest?.phone||""
    const num    = b.booking_number||""
    const matchQ = !search || name.includes(search.toLowerCase()) || phone.includes(search) || num.includes(search)
    return matchStatus && matchQ
  })

  /* Create booking */
  const handleCreate = async () => {
    if (!guestId||!roomId||!checkIn||!checkOut) { toast.error("Fill all required fields"); return }
    if (checkOut <= checkIn) { toast.error("Check-out must be after check-in"); return }
    const room = allRooms.find(r=>r.id===roomId)
    const rt   = room?.room_type_id
    const n    = nights(checkIn, checkOut)
    const total = rt ? rt.base_price * n : 0
    const bn    = "BK" + Date.now().toString().slice(-8)

    const { data: booking, error: bErr } = await supabase.from("bookings").insert({
      hotel_id: hotelId, guest_id: guestId, room_id: roomId,
      booking_number: bn, status: "confirmed",
      check_in_date: checkIn, check_out_date: checkOut,
      adults: parseInt(adults), children: parseInt(children_),
      notes: notes||null, total_amount: total,
    }).select("*, guest:guests(id,full_name,phone), room:rooms(id,room_number,room_type_id:room_type_ids(name,base_price))").single()

    if (bErr) { toast.error(bErr.message); return }

    // Create invoice
    if (total > 0) {
      await supabase.from("invoices").insert({
        hotel_id: hotelId, booking_id: booking.id, guest_id: guestId,
        total_amount: total, tax_amount: Math.round(total*0.12),
        discount_amount: 0, payment_status: "pending",
        invoice_number: "INV" + Date.now().toString().slice(-8),
      } as any)
    }

    setBookings(prev => [booking, ...prev])
    toast.success(`Booking ${bn} created`)
    setModal(null); setGuestId(""); setRoomId(""); setNotes("")
  }

  /* Update status */
  const updateStatus = async (id:string, status: BStatus) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id)
    if (error) { toast.error(error.message); return }

    // If checking in → mark room occupied
    if (status === "checked_in") {
      const bk = bookings.find(b=>b.id===id)
      if (bk?.room?.id) await supabase.from("rooms").update({ status:"occupied" }).eq("id", bk.room.id)
    }
    // If checking out → mark room cleaning
    if (status === "checked_out") {
      const bk = bookings.find(b=>b.id===id)
      if (bk?.room?.id) await supabase.from("rooms").update({ status:"cleaning" }).eq("id", bk.room.id)
    }

    setBookings(prev => prev.map(b => b.id===id ? {...b, status} : b))
    if (viewing?.id===id) setViewing((p:any) => ({...p, status}))
    toast.success(`Booking status → ${status.replace("_"," ")}`)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:22,fontWeight:600,letterSpacing:-0.5,margin:0 }}>Bookings</h1>
          <p style={{ fontSize:13,marginTop:3,...S }}>{bookings.length} total · {stats.checked_in||0} in-house · {stats.confirmed||0} confirmed</p>
        </div>
        <button onClick={()=>setModal("add")} style={{ fontSize:12,padding:"7px 16px",borderRadius:10,border:"none",background:"#6c5ce7",color:"#fff",fontWeight:500,cursor:"pointer" }}>
          + New Booking
        </button>
      </div>

      {/* Status filter pills */}
      <div style={{ display:"flex",gap:8,marginBottom:20,flexWrap:"wrap" }}>
        {([["all","All",bookings.length], ...STATUS_LIST.map(s=>[s,STATUS_CFG[s].label,stats[s]||0])] as [string,string,number][]).map(([val,label,count])=>(
          <button key={val} onClick={()=>setFilter(val as any)}
            style={{
              fontSize:12,fontWeight:500,padding:"6px 14px",borderRadius:99,cursor:"pointer",transition:"all 0.15s",border:"1px solid",
              borderColor: filter===val ? (val==="all"?"rgba(108,92,231,0.5)": STATUS_CFG[val as BStatus]?.border||"rgba(108,92,231,0.5)") : "rgba(255,255,255,0.08)",
              background:  filter===val ? (val==="all"?"rgba(108,92,231,0.15)": STATUS_CFG[val as BStatus]?.bg||"rgba(108,92,231,0.15)") : "transparent",
              color:       filter===val ? (val==="all"?"#a29bfe": STATUS_CFG[val as BStatus]?.text||"#a29bfe") : "rgba(255,255,255,0.45)",
            }}>
            {label} <span style={{ opacity:0.7, marginLeft:4 }}>{count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position:"relative",marginBottom:16,maxWidth:400 }}>
        <svg style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",opacity:0.4 }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input placeholder="Search guest, phone, or booking #..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{ width:"100%",padding:"9px 12px 9px 34px",fontSize:13,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"var(--text-primary)",outline:"none" }}/>
      </div>

      {/* Table */}
      <div className="card-surface" style={{ overflow:"hidden" }}>
        <table className="data-table">
          <thead><tr><th>Booking</th><th>Guest</th><th>Room</th><th>Check-in</th><th>Check-out</th><th>Nights</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(b => {
              const cfg = STATUS_CFG[b.status as BStatus] || STATUS_CFG.pending
              const n   = nights(b.check_in_date, b.check_out_date)
              const rt  = (b.room as any)?.room_type_id
              return (
                <tr key={b.id} style={{ cursor:"pointer" }} onClick={()=>{ setViewing(b); setModal("view") }}>
                  <td><span style={{ fontFamily:"DM Mono,monospace",fontSize:12,background:"rgba(108,92,231,0.1)",padding:"2px 8px",borderRadius:6,color:"#a29bfe" }}>{b.booking_number}</span></td>
                  <td>
                    <div style={{ fontWeight:500,color:"var(--text-primary)",fontSize:13 }}>{b.guest?.full_name||"—"}</div>
                    <div style={{ fontSize:11,...S }}>{b.guest?.phone||""}</div>
                  </td>
                  <td><span style={{ fontFamily:"DM Mono,monospace",fontSize:12,background:"rgba(255,255,255,0.06)",padding:"2px 8px",borderRadius:6 }}>{b.room?.room_number||"—"}</span>
                    {rt && <div style={{ fontSize:10,...S,marginTop:2 }}>{rt.name}</div>}
                  </td>
                  <td style={{ fontSize:12 }}>{fmt(b.check_in_date)}</td>
                  <td style={{ fontSize:12 }}>{fmt(b.check_out_date)}</td>
                  <td style={{ fontFamily:"DM Mono,monospace",fontSize:12 }}>{n}N</td>
                  <td style={{ fontFamily:"DM Mono,monospace",fontSize:12,color:"var(--text-primary)" }}>
                    {b.total_amount ? new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(b.total_amount) : "—"}
                  </td>
                  <td><span className={`pill ${cfg.pill}`}>{cfg.label}</span></td>
                  <td onClick={e=>e.stopPropagation()}>
                    <div style={{ display:"flex",gap:5 }}>
                      {b.status==="confirmed" && (
                        <button onClick={()=>updateStatus(b.id,"checked_in")}
                          style={{ fontSize:11,padding:"4px 10px",borderRadius:7,border:"1px solid rgba(0,184,148,0.3)",background:"rgba(0,184,148,0.1)",color:"#00b894",cursor:"pointer" }}>
                          Check In
                        </button>
                      )}
                      {b.status==="checked_in" && (
                        <button onClick={()=>updateStatus(b.id,"checked_out")}
                          style={{ fontSize:11,padding:"4px 10px",borderRadius:7,border:"1px solid rgba(116,185,255,0.3)",background:"rgba(116,185,255,0.1)",color:"#74b9ff",cursor:"pointer" }}>
                          Check Out
                        </button>
                      )}
                      {b.status==="pending" && (
                        <button onClick={()=>updateStatus(b.id,"confirmed")}
                          style={{ fontSize:11,padding:"4px 10px",borderRadius:7,border:"1px solid rgba(253,203,110,0.3)",background:"rgba(253,203,110,0.1)",color:"#fdcb6e",cursor:"pointer" }}>
                          Confirm
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length===0 && (
              <tr><td colSpan={9}>
                <div className="empty-state">
                  <div style={{ fontSize:32,marginBottom:8 }}>📋</div>
                  <div>{bookings.length===0?"No bookings yet — create the first one":"No bookings match this filter"}</div>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── ADD BOOKING MODAL ── */}
      {modal==="add" && (
        <Modal title="New Booking" onClose={()=>setModal(null)}>
          <FSelect label="Guest *" value={guestId} onChange={e=>setGuestId(e.target.value)}>
            <option value="">Select guest...</option>
            {guests.map(g=><option key={g.id} value={g.id}>{g.full_name} · {g.phone}</option>)}
          </FSelect>
          <FSelect label="Room *" value={roomId} onChange={e=>setRoomId(e.target.value)}>
            <option value="">Select available room...</option>
            {availRooms.map(r=>{
              const rt = r.room_type_id as any
              return <option key={r.id} value={r.id}>Room {r.room_number}{rt?` — ${rt.name} · ₹${rt.base_price}/night`:""}</option>
            })}
          </FSelect>
          {availRooms.length===0 && <div style={{ fontSize:12,color:"#fdcb6e",marginBottom:14,padding:"8px 12px",borderRadius:8,background:"rgba(253,203,110,0.08)",border:"1px solid rgba(253,203,110,0.2)" }}>No available rooms. Mark a room as available first.</div>}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px" }}>
            <FInput label="Check-in Date *" type="date" value={checkIn} onChange={e=>setCheckIn(e.target.value)}/>
            <FInput label="Check-out Date *" type="date" value={checkOut} onChange={e=>setCheckOut(e.target.value)}/>
            <FInput label="Adults" type="number" min="1" value={adults} onChange={e=>setAdults(e.target.value)}/>
            <FInput label="Children" type="number" min="0" value={children_} onChange={e=>setChildren(e.target.value)}/>
          </div>
          {roomId && checkIn && checkOut && checkOut>checkIn && (()=>{
            const room = allRooms.find(r=>r.id===roomId)
            const rt   = room?.room_type_id as any
            const n    = nights(checkIn,checkOut)
            const total = rt ? rt.base_price * n : 0
            return rt ? (
              <div style={{ padding:"12px 14px",borderRadius:10,background:"rgba(108,92,231,0.08)",border:"1px solid rgba(108,92,231,0.2)",marginBottom:14 }}>
                <div style={{ fontSize:12,color:"#a29bfe",fontWeight:500 }}>{n} night{n!==1?"s":""} · {rt.name}</div>
                <div style={{ fontSize:18,fontWeight:600,color:"var(--text-primary)",marginTop:2 }}>
                  {new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(total)}
                </div>
                <div style={{ fontSize:11,...S,marginTop:2 }}>+{new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Math.round(total*0.12))} GST (12%)</div>
              </div>
            ) : null
          })()}
          <FInput label="Notes (optional)" placeholder="Special requests, early check-in..." value={notes} onChange={e=>setNotes(e.target.value)}/>
          <div style={{ display:"flex",gap:10,marginTop:6 }}>
            <button onClick={()=>setModal(null)} style={{ flex:1,padding:"10px 0",borderRadius:10,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"rgba(255,255,255,0.6)",cursor:"pointer",fontSize:13 }}>Cancel</button>
            <button onClick={handleCreate} style={{ flex:1,padding:"10px 0",borderRadius:10,border:"none",background:"#6c5ce7",color:"#fff",fontWeight:500,cursor:"pointer",fontSize:13 }}>Create Booking</button>
          </div>
        </Modal>
      )}

      {/* ── VIEW BOOKING MODAL ── */}
      {modal==="view" && viewing && (()=>{
        const cfg = STATUS_CFG[viewing.status as BStatus]||STATUS_CFG.pending
        const n   = nights(viewing.check_in_date, viewing.check_out_date)
        const rt  = viewing.room?.room_type_id as any
        return (
          <Modal title={`Booking ${viewing.booking_number}`} onClose={()=>{ setModal(null); setViewing(null) }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",borderRadius:12,background:cfg.bg,border:`1px solid ${cfg.border}`,marginBottom:20 }}>
              <span style={{ fontFamily:"DM Mono,monospace",fontSize:14,fontWeight:600,color:cfg.text }}>{viewing.booking_number}</span>
              <span className={`pill ${cfg.pill}`}>{cfg.label}</span>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16 }}>
              {[
                ["Guest",     viewing.guest?.full_name||"—"],
                ["Phone",     viewing.guest?.phone||"—"],
                ["Room",      `Room ${viewing.room?.room_number||"—"}${rt?` · ${rt.name}`:""}` ],
                ["Nights",    `${n} night${n!==1?"s":""}`],
                ["Check-in",  fmtFull(viewing.check_in_date)],
                ["Check-out", fmtFull(viewing.check_out_date)],
                ["Adults",    String(viewing.adults||1)],
                ["Amount",    viewing.total_amount ? new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(viewing.total_amount) : "—"],
              ].map(([label,val])=>(
                <div key={label} style={{ padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize:10,fontWeight:600,letterSpacing:"0.6px",textTransform:"uppercase",...S,marginBottom:4 }}>{label}</div>
                  <div style={{ fontSize:13,color:"var(--text-primary)" }}>{val}</div>
                </div>
              ))}
            </div>
            {viewing.notes && <div style={{ padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",marginBottom:16,fontSize:13,...S }}>{viewing.notes}</div>}
            <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
              {viewing.status==="pending"    && <button onClick={()=>updateStatus(viewing.id,"confirmed")}   style={{ flex:1,padding:"9px 0",borderRadius:10,border:"none",background:"#74b9ff",color:"#fff",fontWeight:500,cursor:"pointer",fontSize:13 }}>Confirm</button>}
              {viewing.status==="confirmed"  && <button onClick={()=>updateStatus(viewing.id,"checked_in")} style={{ flex:1,padding:"9px 0",borderRadius:10,border:"none",background:"#00b894",color:"#fff",fontWeight:500,cursor:"pointer",fontSize:13 }}>Check In</button>}
              {viewing.status==="checked_in" && <button onClick={()=>updateStatus(viewing.id,"checked_out")} style={{ flex:1,padding:"9px 0",borderRadius:10,border:"none",background:"#74b9ff",color:"#fff",fontWeight:500,cursor:"pointer",fontSize:13 }}>Check Out</button>}
              {["pending","confirmed"].includes(viewing.status) && <button onClick={()=>updateStatus(viewing.id,"cancelled")} style={{ flex:1,padding:"9px 0",borderRadius:10,border:"1px solid rgba(225,112,85,0.3)",background:"rgba(225,112,85,0.1)",color:"#e17055",fontWeight:500,cursor:"pointer",fontSize:13 }}>Cancel</button>}
            </div>
          </Modal>
        )
      })()}
    </div>
  )
}
'''

with open(os.path.join(bk_dir,'page.tsx'),'w') as f: f.write(server)
print("✅ bookings/page.tsx written")
with open(os.path.join(bk_dir,'BookingsClient.tsx'),'w') as f: f.write(client)
print("✅ bookings/BookingsClient.tsx written")
PYEOF

echo "✅ Bookings page done"
