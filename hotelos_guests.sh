#!/bin/bash
# HotelOS — Guests Page Redesign
# Run: bash hotelos_guests.sh
cd ~/Downloads/hotel-management-project

python3 << 'PYEOF'
import os

for d in ['src/app/(admin)/guests', 'src/app/guests']:
    if os.path.exists(d):
        guests_dir = d; break
else:
    guests_dir = 'src/app/(admin)/guests'
    os.makedirs(guests_dir, exist_ok=True)

server = '''\
import { createClient } from "@/lib/supabase/server"
import { GuestsClient } from "./GuestsClient"

export default async function GuestsPage() {
  const supabase = await createClient()
  const hotelId  = process.env.NEXT_PUBLIC_HOTEL_ID!

  const { data: guests } = await supabase
    .from("guests")
    .select("*, bookings(id, status, check_in_date, check_out_date, booking_number)")
    .eq("hotel_id", hotelId)
    .order("created_at", { ascending: false })

  return <GuestsClient guests={guests || []} hotelId={hotelId} />
}
'''

client = '''\
"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Booking { id:string; status:string; check_in_date:string; check_out_date:string; booking_number:string }
interface Guest {
  id:string; full_name:string; phone:string; email?:string
  id_type?:string; id_number?:string; address?:string
  nationality?:string; notes?:string; created_at:string
  bookings?: Booking[]
}
interface Props { guests: Guest[]; hotelId: string }

const S: React.CSSProperties = { color:"var(--text-muted)" }
const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})

function Modal({ title, onClose, children }: { title:string; onClose:()=>void; children:React.ReactNode }) {
  return (
    <div style={{ position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)" }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"#13131f",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,padding:28,width:520,maxWidth:"92vw",maxHeight:"88vh",overflowY:"auto" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22 }}>
          <h2 style={{ fontSize:16,fontWeight:600,margin:0 }}>{title}</h2>
          <button onClick={onClose} style={{ background:"none",border:"none",color:"rgba(255,255,255,0.4)",fontSize:22,cursor:"pointer",lineHeight:1,padding:4 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function FInput({ label, ...p }: { label:string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:11,fontWeight:600,letterSpacing:"0.6px",textTransform:"uppercase",...S,display:"block",marginBottom:6 }}>{label}</label>
      <input {...p} style={{ width:"100%",padding:"10px 12px",fontSize:13,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"var(--text-primary)",outline:"none" }}/>
    </div>
  )
}
function FSelect({ label, children, ...p }: { label:string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:11,fontWeight:600,letterSpacing:"0.6px",textTransform:"uppercase",...S,display:"block",marginBottom:6 }}>{label}</label>
      <select {...p} style={{ width:"100%",padding:"10px 12px",fontSize:13,background:"rgba(20,20,32,0.95)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"var(--text-primary)",outline:"none" }}>
        {children}
      </select>
    </div>
  )
}

const BOOKING_PILL: Record<string,string> = {
  checked_in:"pill-green",confirmed:"pill-blue",pending:"pill-amber",
  checked_out:"pill-gray",cancelled:"pill-red",no_show:"pill-red",
}

const INIT = { full_name:"",phone:"",email:"",id_type:"aadhaar",id_number:"",address:"",nationality:"Indian",notes:"" }

export function GuestsClient({ guests: initialGuests, hotelId }: Props) {
  const supabase = createClient()
  const [guests,  setGuests]  = useState<Guest[]>(initialGuests)
  const [search,  setSearch]  = useState("")
  const [modal,   setModal]   = useState<"add"|"view"|null>(null)
  const [viewing, setViewing] = useState<Guest|null>(null)
  const [form,    setForm]    = useState(INIT)

  const f = (k: keyof typeof INIT) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  /* Search */
  const filtered = guests.filter(g =>
    g.full_name.toLowerCase().includes(search.toLowerCase()) ||
    g.phone.includes(search) ||
    (g.email||"").toLowerCase().includes(search.toLowerCase())
  )

  /* Add guest */
  const handleAdd = async () => {
    if (!form.full_name || !form.phone) { toast.error("Name and phone required"); return }
    const { data, error } = await supabase.from("guests").insert({
      hotel_id: hotelId,
      full_name: form.full_name, phone: form.phone,
      email: form.email||null, id_type: form.id_type||null,
      id_number: form.id_number||null, address: form.address||null,
      nationality: form.nationality||null, notes: form.notes||null,
    }).select("*, bookings(id,status,check_in_date,check_out_date,booking_number)").single()
    if (error) { toast.error(error.message); return }
    setGuests(prev => [data as Guest, ...prev])
    toast.success(`Guest "${form.full_name}" added`)
    setForm(INIT); setModal(null)
  }

  /* Initials avatar */
  const initials = (name: string) => name.split(" ").map(p=>p[0]).join("").toUpperCase().slice(0,2)
  const avatarColor = (name: string) => {
    const colors = ["#6c5ce7","#00b894","#74b9ff","#fdcb6e","#e17055","#a29bfe","#fd79a8"]
    return colors[name.charCodeAt(0) % colors.length]
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:22,fontWeight:600,letterSpacing:-0.5,margin:0 }}>Guests</h1>
          <p style={{ fontSize:13,marginTop:3,...S }}>{guests.length} total guests registered</p>
        </div>
        <button onClick={()=>{ setForm(INIT); setModal("add") }} style={{ fontSize:12,padding:"7px 16px",borderRadius:10,border:"none",background:"#6c5ce7",color:"#fff",fontWeight:500,cursor:"pointer" }}>
          + Add Guest
        </button>
      </div>

      {/* Search */}
      <div style={{ position:"relative",marginBottom:20,maxWidth:400 }}>
        <svg style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",opacity:0.4 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input
          placeholder="Search by name, phone, or email..."
          value={search} onChange={e=>setSearch(e.target.value)}
          style={{ width:"100%",padding:"10px 12px 10px 36px",fontSize:13,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,color:"var(--text-primary)",outline:"none" }}
        />
      </div>

      {/* Table */}
      <div className="card-surface" style={{ overflow:"hidden" }}>
        <table className="data-table">
          <thead>
            <tr><th>Guest</th><th>Phone</th><th>ID</th><th>Nationality</th><th>Stays</th><th>Last Visit</th><th>Action</th></tr>
          </thead>
          <tbody>
            {filtered.map(g => {
              const stays = g.bookings?.length || 0
              const lastStay = g.bookings?.sort((a,b)=>b.check_in_date.localeCompare(a.check_in_date))[0]
              const activeBooking = g.bookings?.find(b=>b.status==="checked_in")
              return (
                <tr key={g.id} style={{ cursor:"pointer" }} onClick={()=>{ setViewing(g); setModal("view") }}>
                  <td>
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <div style={{ width:34,height:34,borderRadius:10,background:avatarColor(g.full_name),display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff",flexShrink:0 }}>
                        {initials(g.full_name)}
                      </div>
                      <div>
                        <div style={{ fontWeight:500,color:"var(--text-primary)",fontSize:13 }}>{g.full_name}</div>
                        <div style={{ fontSize:11,...S }}>{g.email||"No email"}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily:"DM Mono,monospace",fontSize:12 }}>{g.phone}</td>
                  <td style={{ fontSize:12 }}>
                    {g.id_type ? (
                      <div>
                        <div style={{ fontSize:11,...S,textTransform:"capitalize" }}>{g.id_type}</div>
                        <div style={{ fontFamily:"DM Mono,monospace",fontSize:11 }}>{g.id_number||"—"}</div>
                      </div>
                    ) : <span style={{ ...S,fontSize:12 }}>—</span>}
                  </td>
                  <td style={{ fontSize:12 }}>{g.nationality||"—"}</td>
                  <td>
                    <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                      <span style={{ fontSize:13,fontWeight:600,color:"var(--text-primary)" }}>{stays}</span>
                      {activeBooking && <span className="pill pill-green" style={{ fontSize:10 }}>In-house</span>}
                    </div>
                  </td>
                  <td style={{ fontSize:12,...S }}>{lastStay ? fmt(lastStay.check_in_date) : "Never"}</td>
                  <td onClick={e=>e.stopPropagation()}>
                    <button onClick={()=>{ setViewing(g); setModal("view") }}
                      style={{ fontSize:12,padding:"4px 12px",borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.7)",cursor:"pointer" }}>
                      View
                    </button>
                  </td>
                </tr>
              )
            })}
            {filtered.length===0 && (
              <tr><td colSpan={7}>
                <div className="empty-state">
                  <div style={{ fontSize:32,marginBottom:8 }}>👤</div>
                  <div>{guests.length===0?"No guests yet — add your first guest":"No guests match your search"}</div>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── ADD GUEST MODAL ── */}
      {modal==="add" && (
        <Modal title="Add Guest" onClose={()=>setModal(null)}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px" }}>
            <div style={{ gridColumn:"1/-1" }}><FInput label="Full Name *" placeholder="Rahul Sharma" value={form.full_name} onChange={f("full_name")}/></div>
            <FInput label="Phone *" placeholder="+91 98765 43210" value={form.phone} onChange={f("phone")}/>
            <FInput label="Email" type="email" placeholder="rahul@email.com" value={form.email} onChange={f("email")}/>
            <FSelect label="ID Type" value={form.id_type} onChange={f("id_type")}>
              <option value="aadhaar">Aadhaar</option>
              <option value="passport">Passport</option>
              <option value="driving_license">Driving License</option>
              <option value="voter_id">Voter ID</option>
              <option value="pan">PAN Card</option>
            </FSelect>
            <FInput label="ID Number" placeholder="XXXX XXXX XXXX" value={form.id_number} onChange={f("id_number")}/>
            <FInput label="Nationality" placeholder="Indian" value={form.nationality} onChange={f("nationality")}/>
            <div style={{ gridColumn:"1/-1" }}><FInput label="Address" placeholder="123 MG Road, Bengaluru" value={form.address} onChange={f("address")}/></div>
            <div style={{ gridColumn:"1/-1" }}><FInput label="Notes" placeholder="VIP guest, allergic to nuts..." value={form.notes} onChange={f("notes")}/></div>
          </div>
          <div style={{ display:"flex",gap:10,marginTop:6 }}>
            <button onClick={()=>setModal(null)} style={{ flex:1,padding:"10px 0",borderRadius:10,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"rgba(255,255,255,0.6)",cursor:"pointer",fontSize:13 }}>Cancel</button>
            <button onClick={handleAdd} style={{ flex:1,padding:"10px 0",borderRadius:10,border:"none",background:"#6c5ce7",color:"#fff",fontWeight:500,cursor:"pointer",fontSize:13 }}>Add Guest</button>
          </div>
        </Modal>
      )}

      {/* ── VIEW GUEST MODAL ── */}
      {modal==="view" && viewing && (
        <Modal title="Guest Profile" onClose={()=>{ setModal(null); setViewing(null) }}>
          <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:22,padding:"16px 18px",borderRadius:14,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ width:48,height:48,borderRadius:14,background:avatarColor(viewing.full_name),display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:"#fff",flexShrink:0 }}>
              {initials(viewing.full_name)}
            </div>
            <div>
              <div style={{ fontSize:16,fontWeight:600 }}>{viewing.full_name}</div>
              <div style={{ fontSize:12,marginTop:2,...S }}>{viewing.email||"No email"} · {viewing.phone}</div>
            </div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18 }}>
            {[
              ["ID Type", viewing.id_type||"—"],
              ["ID Number", viewing.id_number||"—"],
              ["Nationality", viewing.nationality||"—"],
              ["Total Stays", String(viewing.bookings?.length||0)],
              ["Member Since", fmt(viewing.created_at)],
              ["Address", viewing.address||"—"],
            ].map(([label,val])=>(
              <div key={label} style={{ padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize:10,fontWeight:600,letterSpacing:"0.6px",textTransform:"uppercase",...S,marginBottom:4 }}>{label}</div>
                <div style={{ fontSize:13,color:"var(--text-primary)" }}>{val}</div>
              </div>
            ))}
          </div>
          {viewing.notes && (
            <div style={{ padding:"12px 14px",borderRadius:10,background:"rgba(253,203,110,0.06)",border:"1px solid rgba(253,203,110,0.15)",marginBottom:18 }}>
              <div style={{ fontSize:10,fontWeight:600,letterSpacing:"0.6px",textTransform:"uppercase",color:"#fdcb6e",marginBottom:4 }}>Notes</div>
              <div style={{ fontSize:13,color:"rgba(255,255,255,0.7)" }}>{viewing.notes}</div>
            </div>
          )}
          {/* Booking history */}
          {viewing.bookings && viewing.bookings.length > 0 && (
            <div>
              <div style={{ fontSize:11,fontWeight:600,letterSpacing:"0.6px",textTransform:"uppercase",...S,marginBottom:10 }}>Booking History</div>
              <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                {viewing.bookings.slice(0,5).map(b=>(
                  <div key={b.id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)" }}>
                    <div>
                      <span style={{ fontFamily:"DM Mono,monospace",fontSize:12,color:"#a29bfe" }}>{b.booking_number}</span>
                      <div style={{ fontSize:11,...S,marginTop:2 }}>{fmt(b.check_in_date)} → {fmt(b.check_out_date)}</div>
                    </div>
                    <span className={`pill ${BOOKING_PILL[b.status]||"pill-gray"}`}>{b.status.replace("_"," ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}
'''

with open(os.path.join(guests_dir,'page.tsx'),'w') as f: f.write(server)
print("✅ guests/page.tsx written")
with open(os.path.join(guests_dir,'GuestsClient.tsx'),'w') as f: f.write(client)
print("✅ guests/GuestsClient.tsx written")
PYEOF

echo "✅ Guests page done"
