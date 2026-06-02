#!/bin/bash
# HotelOS — Fix TS errors in BookingsClient.tsx
# Run: bash hotelos_fix_ts.sh
cd ~/Downloads/hotel-management-project

python3 << 'PYEOF'
import os, glob

# Find the file
candidates = [
    'src/app/(admin)/bookings/BookingsClient.tsx',
    'src/app/bookings/BookingsClient.tsx',
]
target = None
for c in candidates:
    if os.path.exists(c):
        target = c
        break

if not target:
    for root, dirs, files in os.walk('src'):
        for f in files:
            if f == 'BookingsClient.tsx':
                target = os.path.join(root, f)
                break

if not target:
    print("❌ BookingsClient.tsx not found")
    exit(1)

print(f"Fixing: {target}")
content = open(target).read()

# ── Fix 1: Inline IIFE for room price preview ────────────────────────────
# Replace the IIFE pattern with a proper helper component call
OLD1 = '''          {roomId && checkIn && checkOut && checkOut>checkIn && (()=>{
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
          })()}'''

NEW1 = '''          <BookingPriceSummary roomId={roomId} checkIn={checkIn} checkOut={checkOut} allRooms={allRooms}/>'''

# ── Fix 2: Inline IIFE for view booking modal ───────────────────────────
OLD2 = '''      {modal==="view" && viewing && (()=>{
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
      })()}'''

NEW2 = '''      {modal==="view" && viewing && (
        <ViewBookingModal
          booking={viewing}
          onClose={()=>{ setModal(null); setViewing(null) }}
          onUpdateStatus={updateStatus}
        />
      )}'''

# Apply replacements
if OLD1 in content:
    content = content.replace(OLD1, NEW1)
    print("✅ Fixed IIFE #1 (price preview)")
else:
    print("⚠️  IIFE #1 not found — may already be fixed or whitespace differs")

if OLD2 in content:
    content = content.replace(OLD2, NEW2)
    print("✅ Fixed IIFE #2 (view modal)")
else:
    print("⚠️  IIFE #2 not found — may already be fixed or whitespace differs")

# ── Inject the two helper components before the main export ─────────────
HELPERS = '''
/* ─── BookingPriceSummary ───────────────────── */
function BookingPriceSummary({ roomId, checkIn, checkOut, allRooms }: {
  roomId: string; checkIn: string; checkOut: string; allRooms: any[]
}) {
  if (!roomId || !checkIn || !checkOut || checkOut <= checkIn) return null
  const room = allRooms.find(r => r.id === roomId)
  const rt   = room?.room_type_id as any
  if (!rt) return null
  const n     = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
  const total = rt.base_price * n
  const S2: React.CSSProperties = { color: "var(--text-muted)" }
  return (
    <div style={{ padding:"12px 14px",borderRadius:10,background:"rgba(108,92,231,0.08)",border:"1px solid rgba(108,92,231,0.2)",marginBottom:14 }}>
      <div style={{ fontSize:12,color:"#a29bfe",fontWeight:500 }}>{n} night{n!==1?"s":""} · {rt.name}</div>
      <div style={{ fontSize:18,fontWeight:600,color:"var(--text-primary)",marginTop:2 }}>
        {new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(total)}
      </div>
      <div style={{ fontSize:11,...S2,marginTop:2 }}>
        +{new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Math.round(total*0.12))} GST (12%)
      </div>
    </div>
  )
}

/* ─── ViewBookingModal ──────────────────────── */
function ViewBookingModal({ booking: b, onClose, onUpdateStatus }: {
  booking: any; onClose: ()=>void; onUpdateStatus: (id:string, s:BStatus)=>void
}) {
  const cfg = STATUS_CFG[b.status as BStatus] || STATUS_CFG.pending
  const n   = Math.max(1, Math.ceil((new Date(b.check_out_date).getTime() - new Date(b.check_in_date).getTime()) / 86400000))
  const rt  = b.room?.room_type_id as any
  const S2: React.CSSProperties = { color: "var(--text-muted)" }
  const fmtD = (d: string) => new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})
  return (
    <Modal title={"Booking " + b.booking_number} onClose={onClose}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",borderRadius:12,background:cfg.bg,border:"1px solid "+cfg.border,marginBottom:20 }}>
        <span style={{ fontFamily:"DM Mono,monospace",fontSize:14,fontWeight:600,color:cfg.text }}>{b.booking_number}</span>
        <span className={"pill "+cfg.pill}>{cfg.label}</span>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16 }}>
        {([
          ["Guest",     b.guest?.full_name||"—"],
          ["Phone",     b.guest?.phone||"—"],
          ["Room",      "Room "+(b.room?.room_number||"—")+(rt?" · "+rt.name:"")],
          ["Nights",    n+" night"+(n!==1?"s":"")],
          ["Check-in",  fmtD(b.check_in_date)],
          ["Check-out", fmtD(b.check_out_date)],
          ["Adults",    String(b.adults||1)],
          ["Amount",    b.total_amount ? new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(b.total_amount) : "—"],
        ] as [string,string][]).map(([label,val])=>(
          <div key={label} style={{ padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize:10,fontWeight:600,letterSpacing:"0.6px",textTransform:"uppercase",...S2,marginBottom:4 }}>{label}</div>
            <div style={{ fontSize:13,color:"var(--text-primary)" }}>{val}</div>
          </div>
        ))}
      </div>
      {b.notes && <div style={{ padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",marginBottom:16,fontSize:13,...S2 }}>{b.notes}</div>}
      <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
        {b.status==="pending"    && <button onClick={()=>onUpdateStatus(b.id,"confirmed")}    style={{ flex:1,padding:"9px 0",borderRadius:10,border:"none",background:"#74b9ff",color:"#fff",fontWeight:500,cursor:"pointer",fontSize:13 }}>Confirm</button>}
        {b.status==="confirmed"  && <button onClick={()=>onUpdateStatus(b.id,"checked_in")}  style={{ flex:1,padding:"9px 0",borderRadius:10,border:"none",background:"#00b894",color:"#fff",fontWeight:500,cursor:"pointer",fontSize:13 }}>Check In</button>}
        {b.status==="checked_in" && <button onClick={()=>onUpdateStatus(b.id,"checked_out")} style={{ flex:1,padding:"9px 0",borderRadius:10,border:"none",background:"#74b9ff",color:"#fff",fontWeight:500,cursor:"pointer",fontSize:13 }}>Check Out</button>}
        {(b.status==="pending"||b.status==="confirmed") && <button onClick={()=>onUpdateStatus(b.id,"cancelled")} style={{ flex:1,padding:"9px 0",borderRadius:10,border:"1px solid rgba(225,112,85,0.3)",background:"rgba(225,112,85,0.1)",color:"#e17055",fontWeight:500,cursor:"pointer",fontSize:13 }}>Cancel</button>}
      </div>
    </Modal>
  )
}

'''

# Insert helpers just before "export function BookingsClient"
EXPORT_LINE = 'export function BookingsClient('
if EXPORT_LINE in content:
    content = content.replace(EXPORT_LINE, HELPERS + EXPORT_LINE)
    print("✅ Helper components injected")
else:
    print("⚠️  Could not find export line to inject helpers")

with open(target, 'w') as f:
    f.write(content)

print(f"✅ {target} patched")
PYEOF

echo ""
echo "Running TypeScript check..."
pnpm tsc --noEmit 2>&1 | grep "error TS" | sed 's/.*error TS/TS/' | sort | uniq -c | sort -rn | head -20
TOTAL=$(pnpm tsc --noEmit 2>&1 | grep "error TS" | wc -l | tr -d ' ')
echo ""
echo "Total TS errors: $TOTAL"
[ "$TOTAL" = "0" ] && echo "✅ All clear!" || echo "⚠️  Remaining errors above — paste them and I'll fix"
