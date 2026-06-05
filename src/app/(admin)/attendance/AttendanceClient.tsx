"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })

const fmtDateShort = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

const toDateStr = (d: Date) => d.toISOString().split("T")[0]

const STATUSES = ["present", "absent", "half_day", "late", "leave"]

const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  present:  { label: "Present",  color: "#00b894", bg: "rgba(0,184,148,0.12)",   border: "rgba(0,184,148,0.28)"   },
  absent:   { label: "Absent",   color: "#e17055", bg: "rgba(225,112,85,0.12)",  border: "rgba(225,112,85,0.28)"  },
  half_day: { label: "Half Day", color: "#fdcb6e", bg: "rgba(253,203,110,0.12)", border: "rgba(253,203,110,0.28)" },
  late:     { label: "Late",     color: "#fdcb6e", bg: "rgba(253,203,110,0.12)", border: "rgba(253,203,110,0.28)" },
  leave:    { label: "On Leave", color: "#74b9ff", bg: "rgba(116,185,255,0.12)", border: "rgba(116,185,255,0.28)" },
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
function Avatar({ name, size = 38 }: { name: string; size?: number }) {
  const [from, to] = avatarColor(name)
  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, " + from + ", " + to + ")",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36 + "px", fontWeight: 700, color: "#fff", flexShrink: 0,
    }}>{initials}</div>
  )
}

// ── SVG Icons ──────────────────────────────────────────────────────────────────
const IcoRefresh = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M11.5 2A6 6 0 106.5 1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
    <path d="M6.5 1L9 3.5M6.5 1L4 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoCheck = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M3.5 6.5l2.5 2.5 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoLeft = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

interface Staff {
  id: string
  name?: string | null
  full_name?: string | null
  role?: string | null
  is_active?: boolean | null
}

interface AttendanceRecord {
  id?: string
  staff_id: string
  date: string
  status: string
  notes?: string | null
}

export default function AttendanceClient() {
  const db = createClient() as any

  const [staff, setStaff]               = useState<Staff[]>([])
  const [isMobile, setIsMobile]         = useState(false)
  const [attendance, setAttendance]     = useState<Record<string, AttendanceRecord>>({})
  const [loading, setLoading]           = useState(true)
  const [saving, setSaving]             = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(toDateStr(new Date()))
  const [bulkMarking, setBulkMarking]   = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => { fetchAll() }, [selectedDate])

  async function fetchAll() {
    setLoading(true)
    try {
      const [{ data: staffData }, { data: attData }] = await Promise.all([
        db.from("staff").select("id, name, full_name, role, is_active").eq("is_active", true).order("name"),
        db.from("attendance").select("id, staff_id, date, status, notes").eq("date", selectedDate),
      ])
      setStaff((staffData as Staff[]) || [])
      const map: Record<string, AttendanceRecord> = {}
      for (const rec of (attData as AttendanceRecord[]) || []) {
        map[rec.staff_id] = rec
      }
      setAttendance(map)
    } catch { toast.error("Failed to load attendance") }
    finally { setLoading(false) }
  }

  async function markStatus(staffId: string, status: string) {
    setSaving(staffId)
    try {
      const existing = attendance[staffId]
      if (existing?.id) {
        const { error } = await db.from("attendance").update({ status }).eq("id", existing.id)
        if (error) throw error
      } else {
        const { error } = await db.from("attendance").insert({ staff_id: staffId, date: selectedDate, status })
        if (error) throw error
      }
      setAttendance((prev) => ({
        ...prev,
        [staffId]: { ...prev[staffId], staff_id: staffId, date: selectedDate, status },
      }))
      const sName = staffName(staff.find((s) => s.id === staffId))
      toast.success(sName + " marked " + (STATUS_META[status]?.label || status))
    } catch { toast.error("Failed to mark attendance") }
    finally { setSaving(null) }
  }

  async function markAllPresent() {
    if (staff.length === 0) return
    setBulkMarking(true)
    try {
      const toInsert: any[] = []
      const toUpdate: { id: string; status: string }[] = []
      for (const s of staff) {
        const existing = attendance[s.id]
        if (existing?.id) { toUpdate.push({ id: existing.id, status: "present" }) }
        else { toInsert.push({ staff_id: s.id, date: selectedDate, status: "present" }) }
      }
      if (toInsert.length > 0) {
        const { error } = await db.from("attendance").insert(toInsert)
        if (error) throw error
      }
      for (const upd of toUpdate) {
        await db.from("attendance").update({ status: upd.status }).eq("id", upd.id)
      }
      const updated: Record<string, AttendanceRecord> = { ...attendance }
      for (const s of staff) {
        updated[s.id] = { ...updated[s.id], staff_id: s.id, date: selectedDate, status: "present" }
      }
      setAttendance(updated)
      toast.success("All " + staff.length + " staff marked present")
    } catch { toast.error("Failed to bulk mark attendance") }
    finally { setBulkMarking(false) }
  }

  function shiftDate(delta: number) {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + delta)
    setSelectedDate(toDateStr(d))
  }

  const staffName = (s?: Staff | null) => s?.name || s?.full_name || "Unknown"
  const isToday = selectedDate === toDateStr(new Date())

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = Object.values(attendance).filter((a) => a.status === s).length
    return acc
  }, {} as Record<string, number>)
  const unmarked = Math.max(0, staff.length - Object.keys(attendance).length)

  const p   = isMobile ? "12px" : "28px"
  const gap = isMobile ? "10px" : "14px"

  if (loading) return (
    <div style={{ padding: p, overflowX: "hidden", width: "100%", boxSizing: "border-box" }}>
      <div className="skeleton" style={{ height: "56px", borderRadius: "0", marginBottom: "16px" }} />
      <div className="skeleton" style={{ height: "90px", borderRadius: "12px", marginBottom: "16px" }} />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(280px,1fr))", gap }}>
        {[1,2,3,4,5,6].map((i) => <div key={i} className="skeleton" style={{ height: "130px", borderRadius: "12px" }} />)}
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
          <div style={{ fontSize: isMobile ? "15px" : "16px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>Attendance</div>
          {!isMobile && <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>{staff.length} active staff</div>}
        </div>
        <button onClick={fetchAll}
          style={{ height: "32px", padding: "0 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(240,240,248,0.6)", fontSize: "12px", fontWeight: 500, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "all 150ms ease" }}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.09)";e.currentTarget.style.color="rgba(240,240,248,0.9)"}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.color="rgba(240,240,248,0.6)"}}
        >
          <IcoRefresh />{!isMobile && "Refresh"}
        </button>
        <button
          onClick={markAllPresent} disabled={bulkMarking}
          style={{ height: "32px", padding: "0 14px", background: "var(--accent)", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px", fontWeight: 600, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 0 18px rgba(108,92,231,0.3)", transition: "all 150ms ease", letterSpacing: "-0.1px", opacity: bulkMarking ? 0.7 : 1 }}
          onMouseEnter={e=>{e.currentTarget.style.background="#7d6ff0"}}
          onMouseLeave={e=>{e.currentTarget.style.background="var(--accent)"}}
        >
          <IcoCheck />{isMobile ? "" : bulkMarking ? "Marking..." : "All Present"}
        </button>
      </div>

      <div style={{ padding: p, maxWidth: "1400px", margin: "0 auto" }}>

        {/* ── Date Navigator ── */}
        <div style={{
          background: "var(--bg-surface)", border: "1px solid var(--border)",
          borderRadius: "12px", padding: isMobile ? "12px" : "16px 20px",
          marginBottom: gap,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "space-between", marginBottom: isMobile ? "10px" : "0" }}>
            <button
              onClick={() => shiftDate(-1)}
              style={{ width: "32px", height: "32px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(240,240,248,0.6)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 150ms ease" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.09)"}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)"}}
            >
              <IcoLeft />
            </button>

            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: isMobile ? "13px" : "15px", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>
                {isMobile ? fmtDateShort(selectedDate) : fmtDate(selectedDate)}
              </div>
              {isToday && (
                <span style={{ display: "inline-block", marginTop: "4px", fontSize: "10px", fontWeight: 600, color: "#00b894", background: "rgba(0,184,148,0.1)", border: "1px solid rgba(0,184,148,0.25)", borderRadius: "99px", padding: "1px 8px" }}>
                  Today
                </span>
              )}
            </div>

            <button
              onClick={() => shiftDate(1)} disabled={isToday}
              style={{ width: "32px", height: "32px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: isToday ? "rgba(240,240,248,0.2)" : "rgba(240,240,248,0.6)", cursor: isToday ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 150ms ease" }}
              onMouseEnter={e=>{if(!isToday)e.currentTarget.style.background="rgba(255,255,255,0.09)"}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)"}}
            >
              <IcoRight />
            </button>
          </div>

          <div style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "center", marginTop: isMobile ? "0" : "10px" }}>
            <input
              type="date" value={selectedDate} max={toDateStr(new Date())}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontFamily: '"DM Mono",monospace', color: "var(--text-primary)", outline: "none", cursor: "pointer", flex: isMobile ? 1 : "none" }}
            />
            {!isToday && (
              <button
                onClick={() => setSelectedDate(toDateStr(new Date()))}
                style={{ height: "32px", padding: "0 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(240,240,248,0.6)", fontSize: "12px", fontWeight: 500, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", transition: "all 150ms ease", whiteSpace: "nowrap" }}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.09)"}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)"}}
              >
                Today
              </button>
            )}
          </div>
        </div>

        {/* ── Summary Strip ── */}
        <div style={{ display: "flex", gap: "8px", marginBottom: gap, overflowX: "auto", flexWrap: "nowrap", WebkitOverflowScrolling: "touch", paddingBottom: "4px" }}>
          {[
            { key: "present",  label: "Present",  val: counts.present  || 0, color: "#00b894" },
            { key: "absent",   label: "Absent",   val: counts.absent   || 0, color: "#e17055" },
            { key: "half_day", label: "Half Day", val: counts.half_day || 0, color: "#fdcb6e" },
            { key: "late",     label: "Late",     val: counts.late     || 0, color: "#fdcb6e" },
            { key: "leave",    label: "Leave",    val: counts.leave    || 0, color: "#74b9ff" },
            { key: "unmarked", label: "Unmarked", val: unmarked,             color: "rgba(240,240,248,0.3)" },
            { key: "total",    label: "Total",    val: staff.length,         color: "var(--text-primary)" },
          ].map((item) => (
            <div key={item.key} style={{
              flexShrink: 0,
              background: "var(--bg-surface)", border: "1px solid var(--border)",
              borderRadius: "12px", padding: isMobile ? "10px 12px" : "12px 18px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
              minWidth: isMobile ? "66px" : "82px",
            }}>
              <div style={{ fontFamily: '"DM Mono",monospace', fontSize: isMobile ? "18px" : "22px", fontWeight: 700, color: item.color, lineHeight: 1 }}>
                {item.val}
              </div>
              <div style={{ fontSize: "9.5px", fontWeight: 600, color: "rgba(240,240,248,0.35)", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center" }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Staff Grid ── */}
        {staff.length === 0 ? (
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "60px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "13px", color: "rgba(240,240,248,0.35)" }}>No active staff — add staff members to track attendance</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(280px,1fr))", gap }}>
            {staff.map((s) => {
              const rec           = attendance[s.id]
              const currentStatus = rec?.status || null
              const isSaving      = saving === s.id
              const name          = staffName(s)
              const meta          = currentStatus ? STATUS_META[currentStatus] : null

              return (
                <div key={s.id} style={{
                  background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "12px", padding: isMobile ? "13px 14px" : "16px 18px",
                  position: "relative", overflow: "hidden",
                  transition: "border-color 150ms ease",
                }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.13)"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"}}
                >
                  {/* Top accent bar based on status */}
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: "2.5px",
                    background: meta ? meta.color : "rgba(255,255,255,0.06)",
                    borderRadius: "12px 12px 0 0",
                  }} />

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <Avatar name={name} size={isMobile ? 34 : 38} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: isMobile ? "13px" : "14px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {name}
                      </div>
                      <div style={{ fontSize: "11px", color: "rgba(240,240,248,0.4)", textTransform: "capitalize", marginTop: "1px" }}>
                        {(s.role || "other").replace("_", " ")}
                      </div>
                    </div>
                    <span style={{
                      flexShrink: 0,
                      fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "99px",
                      color: meta ? meta.color : "rgba(240,240,248,0.3)",
                      background: meta ? meta.bg : "rgba(255,255,255,0.05)",
                      border: "1px solid " + (meta ? meta.border : "rgba(255,255,255,0.08)"),
                      whiteSpace: "nowrap",
                    }}>
                      {meta ? meta.label : "Unmarked"}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                    {STATUSES.map((status) => {
                      const sm = STATUS_META[status]
                      const isActive = currentStatus === status
                      return (
                        <button
                          key={status}
                          disabled={isSaving}
                          onClick={() => markStatus(s.id, status)}
                          style={{
                            padding: isMobile ? "4px 8px" : "5px 10px",
                            borderRadius: "7px",
                            fontSize: isMobile ? "10px" : "11px",
                            fontWeight: 600,
                            cursor: isSaving ? "not-allowed" : "pointer",
                            border: "1px solid " + (isActive ? sm.color : "rgba(255,255,255,0.08)"),
                            background: isActive ? sm.bg : "transparent",
                            color: isActive ? sm.color : "rgba(240,240,248,0.4)",
                            transition: "all 150ms ease",
                            opacity: isSaving ? 0.5 : 1,
                            fontFamily: '"DM Sans",sans-serif',
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive && !isSaving) {
                              e.currentTarget.style.background = sm.bg
                              e.currentTarget.style.color = sm.color
                              e.currentTarget.style.borderColor = sm.color
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive && !isSaving) {
                              e.currentTarget.style.background = "transparent"
                              e.currentTarget.style.color = "rgba(240,240,248,0.4)"
                              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"
                            }
                          }}
                        >
                          {sm.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
