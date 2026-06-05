"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

const ROLES = ["all", "admin", "manager", "receptionist", "housekeeping", "maintenance", "other"]

const ROLE_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  admin:        { label: "Admin",        color: "#a29bfe", bg: "rgba(162,155,254,0.12)", border: "rgba(162,155,254,0.28)" },
  manager:      { label: "Manager",      color: "#74b9ff", bg: "rgba(116,185,255,0.12)", border: "rgba(116,185,255,0.28)" },
  receptionist: { label: "Receptionist", color: "#00b894", bg: "rgba(0,184,148,0.12)",   border: "rgba(0,184,148,0.28)"   },
  housekeeping: { label: "Housekeeping", color: "#fdcb6e", bg: "rgba(253,203,110,0.12)", border: "rgba(253,203,110,0.28)" },
  maintenance:  { label: "Maintenance",  color: "#e17055", bg: "rgba(225,112,85,0.12)",  border: "rgba(225,112,85,0.28)"  },
  other:        { label: "Other",        color: "rgba(240,240,248,0.4)", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.12)" },
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
function Avatar({ name, size = 36 }: { name: string; size?: number }) {
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
  email?: string | null
  phone?: string | null
  role?: string | null
  employee_code?: string | null
  join_date?: string | null
  is_active?: boolean | null
  address?: string | null
  created_at?: string | null
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

const BLANK = {
  name: "", email: "", phone: "", role: "receptionist",
  employee_code: "", join_date: "", address: "",
}

// ── SVG Icons ──────────────────────────────────────────────────────────────────
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
const IcoSearch = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)
const IcoX = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
  </svg>
)
const IcoChevron = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M4 3l4 3-4 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoPhone = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <path d="M2 1h2.5l1 2.5-1.5 1a7 7 0 003.5 3.5l1-1.5L11 7.5V10a1 1 0 01-1 1A9 9 0 011 2a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoBadge = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <rect x="1" y="1" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M3.5 5.5h4M3.5 7.5h2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <circle cx="5.5" cy="3.5" r="1" fill="currentColor"/>
  </svg>
)
const IcoCal = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <rect x="1" y="2" width="9" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M3.5 1v2M7.5 1v2M1 5h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
)
const IcoPin = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <circle cx="5.5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M5.5 10C5.5 10 1.5 6.8 1.5 4.5a4 4 0 018 0C9.5 6.8 5.5 10 5.5 10z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

function RolePill({ role }: { role?: string | null }) {
  const m = ROLE_META[role || "other"] || ROLE_META.other
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      fontSize: "10px", fontWeight: 600, letterSpacing: "0.02em",
      padding: "3px 9px", borderRadius: "99px",
      color: m.color, background: m.bg, border: "1px solid " + m.border,
      whiteSpace: "nowrap",
    }}>
      {m.label}
    </span>
  )
}

export default function StaffClient() {
  const db = createClient() as any

  const [staff, setStaff]             = useState<Staff[]>([])
  const [isMobile, setIsMobile]       = useState(false)
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState("all")
  const [search, setSearch]           = useState("")
  const [showAdd, setShowAdd]         = useState(false)
  const [viewStaff, setViewStaff]     = useState<Staff | null>(null)
  const [saving, setSaving]           = useState(false)
  const [togglingId, setTogglingId]   = useState<string | null>(null)
  const [form, setForm]               = useState(BLANK)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => { fetchStaff() }, [])

  async function fetchStaff() {
    setLoading(true)
    try {
      const { data } = await db
        .from("staff")
        .select("id, name, full_name, email, phone, role, employee_code, join_date, is_active, address, created_at")
        .order("created_at", { ascending: false })
      setStaff((data as Staff[]) || [])
    } catch { toast.error("Failed to load staff") }
    finally { setLoading(false) }
  }

  async function toggleActive(member: Staff) {
    setTogglingId(member.id)
    try {
      const { error } = await db.from("staff").update({ is_active: !member.is_active }).eq("id", member.id)
      if (error) throw error
      const newVal = !member.is_active
      toast.success(staffName(member) + " marked " + (newVal ? "active" : "inactive"))
      setStaff((prev) => prev.map((s) => s.id === member.id ? { ...s, is_active: newVal } : s))
      if (viewStaff?.id === member.id) setViewStaff({ ...viewStaff, is_active: newVal })
    } catch { toast.error("Failed to update status") }
    finally { setTogglingId(null) }
  }

  async function saveStaff() {
    if (!form.name.trim()) { toast.error("Name is required"); return }
    if (!form.phone.trim()) { toast.error("Phone is required"); return }
    setSaving(true)
    try {
      const { error } = await db.from("staff").insert({
        name: form.name.trim(), full_name: form.name.trim(),
        email: form.email || null, phone: form.phone.trim(),
        role: form.role, employee_code: form.employee_code || null,
        join_date: form.join_date || null, address: form.address || null,
        is_active: true,
      })
      if (error) throw error
      toast.success("Staff member added")
      setShowAdd(false); setForm(BLANK); fetchStaff()
    } catch { toast.error("Failed to add staff member") }
    finally { setSaving(false) }
  }

  const staffName = (s: Staff) => s.name || s.full_name || "Unknown"

  const counts = ROLES.reduce((acc, r) => {
    acc[r] = r === "all" ? staff.length : staff.filter((s) => s.role === r).length
    return acc
  }, {} as Record<string, number>)

  const filtered = staff.filter((s) => {
    if (filter !== "all" && s.role !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        staffName(s).toLowerCase().includes(q) ||
        (s.phone || "").includes(q) ||
        (s.employee_code || "").toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q)
      )
    }
    return true
  })

  const p = isMobile ? "12px" : "28px"

  if (loading) return (
    <div style={{ padding: p, overflowX: "hidden", width: "100%", boxSizing: "border-box" }}>
      <div className="skeleton" style={{ height: "56px", borderRadius: "0", marginBottom: "16px" }} />
      <div className="skeleton" style={{ height: "500px", borderRadius: "12px" }} />
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
          <div style={{ fontSize: isMobile ? "15px" : "16px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>Staff</div>
          {!isMobile && <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>{staff.length} members &middot; {staff.filter((s) => s.is_active).length} active</div>}
        </div>
        <button onClick={fetchStaff}
          style={{ height: "32px", padding: "0 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(240,240,248,0.6)", fontSize: "12px", fontWeight: 500, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "all 150ms ease" }}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.09)";e.currentTarget.style.color="rgba(240,240,248,0.9)"}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.color="rgba(240,240,248,0.6)"}}
        >
          <IcoRefresh />{!isMobile && "Refresh"}
        </button>
        <button
          onClick={() => { setForm(BLANK); setShowAdd(true) }}
          style={{ height: "32px", padding: "0 14px", background: "var(--accent)", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px", fontWeight: 600, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 0 18px rgba(108,92,231,0.3)", transition: "all 150ms ease", letterSpacing: "-0.1px" }}
          onMouseEnter={e=>{e.currentTarget.style.background="#7d6ff0";e.currentTarget.style.boxShadow="0 0 24px rgba(108,92,231,0.45)"}}
          onMouseLeave={e=>{e.currentTarget.style.background="var(--accent)";e.currentTarget.style.boxShadow="0 0 18px rgba(108,92,231,0.3)"}}
        >
          <IcoPlus />{!isMobile && "Add Staff"}
        </button>
      </div>

      <div style={{ padding: p, maxWidth: "1400px", margin: "0 auto" }}>

        {/* Filter tabs */}
        <div style={{ marginBottom: "14px", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div style={{ display: "flex", gap: "3px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "3px", width: "fit-content", minWidth: "100%" }}>
            {ROLES.map((r) => (
              <button key={r} onClick={() => setFilter(r)} style={{
                flexShrink: 0, height: "28px", padding: "0 11px",
                borderRadius: "7px", border: "none",
                fontSize: "11px", fontWeight: 500, fontFamily: '"DM Sans",sans-serif',
                cursor: "pointer", display: "flex", alignItems: "center", gap: "5px",
                transition: "all 150ms ease",
                background: filter === r ? "var(--bg-elevated)" : "transparent",
                color: filter === r ? "var(--text-primary)" : "rgba(240,240,248,0.45)",
              }}>
                {r === "all" ? "All Staff" : ROLE_META[r]?.label || r}
                <span style={{ background: filter === r ? "rgba(108,92,231,0.2)" : "rgba(255,255,255,0.07)", color: filter === r ? "var(--accent-light)" : "rgba(240,240,248,0.35)", borderRadius: "99px", fontSize: "9px", fontWeight: 700, padding: "1px 5px" }}>
                  {counts[r] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", marginBottom: "16px", maxWidth: isMobile ? "100%" : "360px" }}>
          <span style={{ position: "absolute", left: "11px", color: "rgba(240,240,248,0.3)", display: "flex" }}><IcoSearch /></span>
          <input
            style={{ width: "100%", height: "36px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "9px", padding: "0 36px 0 34px", fontSize: "13px", fontFamily: '"DM Sans",sans-serif', color: "var(--text-primary)", outline: "none", transition: "border-color 150ms ease" }}
            placeholder="Search by name, phone or code..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            onFocus={e=>{e.currentTarget.style.borderColor="rgba(108,92,231,0.5)"}}
            onBlur={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"}}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: "10px", background: "none", border: "none", color: "rgba(240,240,248,0.35)", cursor: "pointer", display: "flex", alignItems: "center", padding: "2px" }}>
              <IcoX />
            </button>
          )}
        </div>

        {/* Empty */}
        {filtered.length === 0 && (
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "60px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "13px", color: "rgba(240,240,248,0.35)", marginBottom: "8px" }}>
              {search ? "No staff match your search" : filter !== "all" ? "No staff with this role" : "Add your first staff member"}
            </div>
            {!search && filter === "all" && (
              <button onClick={() => setShowAdd(true)} style={{ marginTop: "12px", height: "32px", padding: "0 14px", background: "var(--accent)", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px", fontWeight: 600, fontFamily: '"DM Sans",sans-serif', cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <IcoPlus /> Add Staff
              </button>
            )}
          </div>
        )}

        {/* Mobile Cards */}
        {filtered.length > 0 && isMobile && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filtered.map((s) => {
              const name = staffName(s)
              return (
                <div key={s.id}
                  onClick={() => setViewStaff(s)}
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "13px 14px", cursor: "pointer", transition: "border-color 150ms ease" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.13)"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)"}}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <Avatar name={name} size={36} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                      {s.email && <div style={{ fontSize: "11px", color: "rgba(240,240,248,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.email}</div>}
                    </div>
                    <RolePill role={s.role} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                      {s.phone && <span style={{ fontFamily: '"DM Mono",monospace', fontSize: "12px", color: "rgba(240,240,248,0.5)" }}>{s.phone}</span>}
                      {s.employee_code && <span style={{ fontFamily: '"DM Mono",monospace', fontSize: "12px", color: "rgba(240,240,248,0.35)" }}>{s.employee_code}</span>}
                    </div>
                    <span style={{
                      fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "99px",
                      color: s.is_active ? "#00b894" : "rgba(240,240,248,0.35)",
                      background: s.is_active ? "rgba(0,184,148,0.1)" : "rgba(255,255,255,0.05)",
                      border: "1px solid " + (s.is_active ? "rgba(0,184,148,0.25)" : "rgba(255,255,255,0.08)"),
                    }}>
                      {s.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Desktop Table */}
        {filtered.length > 0 && !isMobile && (
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.025)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    {["Staff Member","Role","Phone","Employee Code","Joined","Status","Actions"].map((h) => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "rgba(240,240,248,0.35)", textTransform: "uppercase", letterSpacing: "0.55px", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => {
                    const name = staffName(s)
                    return (
                      <tr key={s.id}
                        onClick={() => setViewStaff(s)}
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", transition: "background 120ms ease" }}
                        onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.025)"}}
                        onMouseLeave={e=>{e.currentTarget.style.background="transparent"}}
                      >
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <Avatar name={name} size={30} />
                            <div>
                              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{name}</div>
                              {s.email && <div style={{ fontSize: "11px", color: "rgba(240,240,248,0.4)", marginTop: "1px" }}>{s.email}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px" }}><RolePill role={s.role} /></td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontFamily: '"DM Mono",monospace', fontSize: "12px", color: "rgba(240,240,248,0.55)" }}>{s.phone || "—"}</span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontFamily: '"DM Mono",monospace', fontSize: "12px", color: "rgba(240,240,248,0.45)", letterSpacing: "0.5px" }}>{s.employee_code || "—"}</span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontFamily: '"DM Mono",monospace', fontSize: "12px", color: "rgba(240,240,248,0.4)" }}>{s.join_date ? fmtDate(s.join_date) : "—"}</span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{
                            fontSize: "10px", fontWeight: 600, padding: "3px 9px", borderRadius: "99px",
                            color: s.is_active ? "#00b894" : "rgba(240,240,248,0.35)",
                            background: s.is_active ? "rgba(0,184,148,0.1)" : "rgba(255,255,255,0.05)",
                            border: "1px solid " + (s.is_active ? "rgba(0,184,148,0.25)" : "rgba(255,255,255,0.08)"),
                          }}>
                            {s.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 10px" }} onClick={(e) => e.stopPropagation()}>
                          <button
                            disabled={togglingId === s.id}
                            onClick={() => toggleActive(s)}
                            style={{
                              height: "26px", padding: "0 10px",
                              background: s.is_active ? "rgba(225,112,85,0.1)" : "rgba(0,184,148,0.1)",
                              border: "1px solid " + (s.is_active ? "rgba(225,112,85,0.25)" : "rgba(0,184,148,0.25)"),
                              borderRadius: "6px",
                              color: s.is_active ? "#e17055" : "#00b894",
                              fontSize: "11px", fontWeight: 600, fontFamily: '"DM Sans",sans-serif',
                              cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
                              transition: "all 130ms ease", whiteSpace: "nowrap",
                              opacity: togglingId === s.id ? 0.6 : 1,
                            }}
                          >
                            {togglingId === s.id ? "..." : s.is_active ? "Deactivate" : "Activate"}
                          </button>
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

      {/* Staff Profile Modal */}
      {viewStaff && (
        <Modal title="Staff Profile" wide onClose={() => setViewStaff(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <Avatar name={staffName(viewStaff)} size={52} />
                <div>
                  <div style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>{staffName(viewStaff)}</div>
                  {viewStaff.email && <div style={{ fontSize: "12px", color: "rgba(240,240,248,0.4)", marginTop: "2px" }}>{viewStaff.email}</div>}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <RolePill role={viewStaff.role} />
                <span style={{
                  fontSize: "10px", fontWeight: 600, padding: "3px 9px", borderRadius: "99px",
                  color: viewStaff.is_active ? "#00b894" : "rgba(240,240,248,0.35)",
                  background: viewStaff.is_active ? "rgba(0,184,148,0.1)" : "rgba(255,255,255,0.05)",
                  border: "1px solid " + (viewStaff.is_active ? "rgba(0,184,148,0.25)" : "rgba(255,255,255,0.08)"),
                }}>
                  {viewStaff.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div style={{ height: "1px", background: "rgba(255,255,255,0.07)" }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                { Ico: IcoPhone, label: "Phone",         value: viewStaff.phone,         mono: true  },
                { Ico: IcoBadge, label: "Employee Code", value: viewStaff.employee_code, mono: true  },
                { Ico: IcoCal,   label: "Joined",        value: viewStaff.join_date ? fmtDate(viewStaff.join_date) : null, mono: false },
                { Ico: IcoPin,   label: "Address",       value: viewStaff.address,       mono: false },
              ].filter((item) => item.value).map((item) => {
                const { Ico } = item
                return (
                  <div key={item.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "12px 14px", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "5px" }}>
                      <span style={{ color: "rgba(240,240,248,0.35)" }}><Ico /></span>
                      <span style={{ fontSize: "9.5px", fontWeight: 600, color: "rgba(240,240,248,0.35)", textTransform: "uppercase", letterSpacing: "0.55px" }}>{item.label}</span>
                    </div>
                    <div style={{ fontFamily: item.mono ? '"DM Mono",monospace' : "inherit", fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>{item.value}</div>
                  </div>
                )
              })}
            </div>

            <button
              disabled={togglingId === viewStaff.id}
              onClick={() => toggleActive(viewStaff)}
              style={{
                height: "34px", padding: "0 16px",
                background: viewStaff.is_active ? "rgba(225,112,85,0.12)" : "rgba(0,184,148,0.12)",
                border: "1px solid " + (viewStaff.is_active ? "rgba(225,112,85,0.3)" : "rgba(0,184,148,0.3)"),
                borderRadius: "8px",
                color: viewStaff.is_active ? "#e17055" : "#00b894",
                fontSize: "13px", fontWeight: 600, fontFamily: '"DM Sans",sans-serif',
                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px",
                transition: "all 150ms ease",
                opacity: togglingId === viewStaff.id ? 0.6 : 1,
              }}
            >
              {togglingId === viewStaff.id ? "Updating..." : viewStaff.is_active ? "Deactivate Staff" : "Activate Staff"}
            </button>
          </div>
        </Modal>
      )}

      {/* Add Staff Modal */}
      {showAdd && (
        <Modal title="Add Staff Member" wide onClose={() => setShowAdd(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" placeholder="e.g. Amit Kumar"
                  value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className="form-input" style={{ fontFamily: '"DM Mono",monospace' }} placeholder="e.g. 9876543210" type="tel"
                  value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" placeholder="e.g. amit@hotel.com" type="email"
                  value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
                  {Object.entries(ROLE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Employee Code</label>
                <input className="form-input" style={{ fontFamily: '"DM Mono",monospace' }} placeholder="e.g. EMP001"
                  value={form.employee_code} onChange={(e) => setForm((p) => ({ ...p, employee_code: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Join Date</label>
                <input className="form-input" type="date"
                  value={form.join_date} onChange={(e) => setForm((p) => ({ ...p, join_date: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" placeholder="City, State"
                value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveStaff} disabled={saving}>{saving ? "Saving..." : "Add Staff Member"}</button>
          </div>
        </Modal>
      )}

    </div>
  )
}
