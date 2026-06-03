"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { ClipboardList, RefreshCw, CheckCircle, XCircle, Clock, Calendar, Users, ChevronLeft, ChevronRight } from "lucide-react"

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })

const toDateStr = (d: Date) => d.toISOString().split("T")[0]

const STATUSES = ["present", "absent", "half_day", "late", "leave"]

const STATUS_META: Record<string, { label: string; pill: string; color: string; bg: string; icon: any }> = {
  present:  { label: "Present",  pill: "pill-green",  color: "var(--green)",  bg: "var(--green-bg)",  icon: CheckCircle },
  absent:   { label: "Absent",   pill: "pill-red",    color: "var(--red)",    bg: "var(--red-bg)",    icon: XCircle     },
  half_day: { label: "Half Day", pill: "pill-amber",  color: "var(--amber)",  bg: "var(--amber-bg)",  icon: Clock       },
  late:     { label: "Late",     pill: "pill-amber",  color: "var(--amber)",  bg: "var(--amber-bg)",  icon: Clock       },
  leave:    { label: "On Leave", pill: "pill-blue",   color: "var(--blue)",   bg: "var(--blue-bg)",   icon: Calendar    },
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

  const [staff, setStaff] = useState<Staff[]>([])
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(toDateStr(new Date()))
  const [bulkMarking, setBulkMarking] = useState(false)

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
      toast.success(staffName(staff.find((s) => s.id === staffId)) + " marked " + STATUS_META[status]?.label)
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
        if (existing?.id) {
          toUpdate.push({ id: existing.id, status: "present" })
        } else {
          toInsert.push({ staff_id: s.id, date: selectedDate, status: "present" })
        }
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
  const unmarked = staff.length - Object.keys(attendance).length

  if (loading) return (
    <div style={{ padding: "28px" }}>
      <div className="skeleton" style={{ height: "72px", borderRadius: "16px", marginBottom: "16px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
        {[1,2,3,4,5,6].map((i) => (
          <div key={i} className="skeleton" style={{ height: "120px", borderRadius: "16px" }} />
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-sub">{staff.length} active staff</p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchAll}><RefreshCw size={13} /> Refresh</button>
          <button className="btn btn-primary btn-sm" onClick={markAllPresent} disabled={bulkMarking}>
            <CheckCircle size={13} /> {bulkMarking ? "Marking..." : "Mark All Present"}
          </button>
        </div>
      </div>

      {/* Date Navigator */}
      <div className="card-surface animate-fade-in" style={{ padding: "16px 20px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button className="btn btn-secondary btn-sm" style={{ width: "32px", height: "32px", padding: 0 }} onClick={() => shiftDate(-1)}>
            <ChevronLeft size={16} />
          </button>
          <div style={{ textAlign: "center", minWidth: "260px" }}>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>
              {fmtDate(selectedDate)}
            </div>
            {isToday && (
              <span className="pill pill-green" style={{ fontSize: "10px", padding: "1px 8px", marginTop: "2px" }}>Today</span>
            )}
          </div>
          <button className="btn btn-secondary btn-sm" style={{ width: "32px", height: "32px", padding: 0 }} onClick={() => shiftDate(1)} disabled={isToday}>
            <ChevronRight size={16} />
          </button>
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <input
            type="date"
            value={selectedDate}
            max={toDateStr(new Date())}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px", padding: "7px 12px", fontSize: "13px",
              fontFamily: '"DM Mono", monospace', color: "var(--text-primary)",
              outline: "none", cursor: "pointer",
            }}
          />
          {!isToday && (
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDate(toDateStr(new Date()))}>
              Today
            </button>
          )}
        </div>
      </div>

      {/* Summary Strip */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", overflowX: "auto", paddingBottom: "4px" }}>
        {[
          { key: "present",  label: "Present",  val: counts.present  || 0 },
          { key: "absent",   label: "Absent",   val: counts.absent   || 0 },
          { key: "half_day", label: "Half Day", val: counts.half_day || 0 },
          { key: "late",     label: "Late",     val: counts.late     || 0 },
          { key: "leave",    label: "On Leave", val: counts.leave    || 0 },
          { key: "unmarked", label: "Unmarked", val: unmarked >= 0 ? unmarked : 0 },
        ].map((item) => {
          const meta = STATUS_META[item.key]
          return (
            <div key={item.key} style={{
              flexShrink: 0, background: "var(--bg-surface)", border: "1px solid var(--border)",
              borderRadius: "12px", padding: "12px 20px", display: "flex", flexDirection: "column",
              alignItems: "center", gap: "4px", minWidth: "90px",
            }}>
              <div style={{
                fontFamily: '"DM Mono", monospace', fontSize: "22px", fontWeight: 700,
                color: meta?.color || "var(--text-muted)", lineHeight: 1,
              }}>{item.val}</div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {item.label}
              </div>
            </div>
          )
        })}
        <div style={{
          flexShrink: 0, background: "var(--bg-surface)", border: "1px solid var(--border)",
          borderRadius: "12px", padding: "12px 20px", display: "flex", flexDirection: "column",
          alignItems: "center", gap: "4px", minWidth: "90px",
        }}>
          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>
            {staff.length}
          </div>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total</div>
        </div>
      </div>

      {/* Staff Grid */}
      {staff.length === 0 ? (
        <div className="card-surface">
          <div className="empty-state">
            <Users size={40} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
            <div className="empty-state-title">No active staff</div>
            <div className="empty-state-sub">Add staff members to track attendance</div>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
          {staff.map((s) => {
            const rec = attendance[s.id]
            const currentStatus = rec?.status || null
            const isSaving = saving === s.id
            const name = staffName(s)
            const roleLower = (s.role || "other").toLowerCase()

            return (
              <div key={s.id} className="card-surface animate-fade-in" style={{ padding: "18px", position: "relative", overflow: "hidden" }}>
                {/* Status accent line */}
                {currentStatus && (
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: "3px",
                    background: STATUS_META[currentStatus]?.color || "transparent",
                    borderRadius: "16px 16px 0 0",
                  }} />
                )}

                {/* Staff Info */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                  <Avatar name={name} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {name}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "capitalize", marginTop: "2px" }}>
                      {roleLower.replace("_", " ")}
                    </div>
                  </div>
                  {currentStatus && (
                    <span className={"pill " + (STATUS_META[currentStatus]?.pill || "pill-gray")} style={{ fontSize: "10px", padding: "2px 8px", flexShrink: 0 }}>
                      {STATUS_META[currentStatus]?.label}
                    </span>
                  )}
                  {!currentStatus && (
                    <span className="pill pill-gray" style={{ fontSize: "10px", padding: "2px 8px", flexShrink: 0 }}>
                      Unmarked
                    </span>
                  )}
                </div>

                {/* Status Buttons */}
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                  {STATUSES.map((status) => {
                    const meta = STATUS_META[status]
                    const isActive = currentStatus === status
                    return (
                      <button
                        key={status}
                        disabled={isSaving}
                        onClick={() => markStatus(s.id, status)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: "8px",
                          fontSize: "11px",
                          fontWeight: 600,
                          cursor: isSaving ? "not-allowed" : "pointer",
                          border: "1px solid " + (isActive ? meta.color : "rgba(255,255,255,0.08)"),
                          background: isActive ? meta.bg : "transparent",
                          color: isActive ? meta.color : "var(--text-muted)",
                          transition: "all 150ms ease",
                          opacity: isSaving ? 0.5 : 1,
                          fontFamily: '"DM Sans", sans-serif',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive && !isSaving) {
                            e.currentTarget.style.background = meta.bg
                            e.currentTarget.style.color = meta.color
                            e.currentTarget.style.borderColor = meta.color
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive && !isSaving) {
                            e.currentTarget.style.background = "transparent"
                            e.currentTarget.style.color = "var(--text-muted)"
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"
                          }
                        }}
                      >
                        {meta.label}
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
  )
}
