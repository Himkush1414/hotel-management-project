"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Users, Plus, RefreshCw, Search, X, Phone, Calendar, Shield } from "lucide-react"

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

const ROLES = ["all", "admin", "manager", "receptionist", "housekeeping", "maintenance", "other"]

const ROLE_META: Record<string, { label: string; pill: string; color: string; bg: string }> = {
  admin:        { label: "Admin",        pill: "pill-purple", color: "var(--purple)", bg: "var(--purple-bg)" },
  manager:      { label: "Manager",      pill: "pill-blue",   color: "var(--blue)",   bg: "var(--blue-bg)"   },
  receptionist: { label: "Receptionist", pill: "pill-green",  color: "var(--green)",  bg: "var(--green-bg)"  },
  housekeeping: { label: "Housekeeping", pill: "pill-amber",  color: "var(--amber)",  bg: "var(--amber-bg)"  },
  maintenance:  { label: "Maintenance",  pill: "pill-red",    color: "var(--red)",    bg: "var(--red-bg)"    },
  other:        { label: "Other",        pill: "pill-gray",   color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.07)" },
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

export default function StaffClient() {
  const db = createClient() as any

  const [staff, setStaff] = useState<Staff[]>([])

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [viewStaff, setViewStaff] = useState<Staff | null>(null)
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [form, setForm] = useState(BLANK)

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
      const { error } = await db
        .from("staff")
        .update({ is_active: !member.is_active })
        .eq("id", member.id)
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
        name: form.name.trim(),
        full_name: form.name.trim(),
        email: form.email || null,
        phone: form.phone.trim(),
        role: form.role,
        employee_code: form.employee_code || null,
        join_date: form.join_date || null,
        address: form.address || null,
        is_active: true,
      })
      if (error) throw error
      toast.success("Staff member added")
      setShowAdd(false)
      setForm(BLANK)
      fetchStaff()
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

  if (loading) return (
    <div style={{ padding: isMobile ? "12px" : "28px", overflowX: "hidden", width: "100%", boxSizing: "border-box" }}>
      <div className="skeleton" style={{ height: "48px", borderRadius: "12px", marginBottom: "16px" }} />
      <div className="skeleton" style={{ height: "500px", borderRadius: "16px" }} />
    </div>
  )

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
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: isMobile ? "16px" : "24px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 className="page-title" style={{ fontSize: isMobile ? "18px" : undefined }}>Staff</h1>
          <p className="page-sub">{staff.length} members &middot; {staff.filter((s) => s.is_active).length} active</p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchStaff}><RefreshCw size={13} /> Refresh</button>
          <button className="btn btn-primary btn-sm" onClick={() => { setForm(BLANK); setShowAdd(true) }}>
            <Plus size={13} /> Add Staff
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "6px", overflowX: "auto", flexWrap: "nowrap", WebkitOverflowScrolling: "touch", paddingBottom: "4px", marginBottom: "12px" }}>
        {ROLES.map((r) => (
          <button key={r} className={"filter-tab" + (filter === r ? " active" : "")} onClick={() => setFilter(r)}
            style={{ flexShrink: 0 }}>
            {r === "all" ? "All Staff" : ROLE_META[r]?.label || r}
            <span className="tab-count">{counts[r] || 0}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="search-wrap" style={{ marginBottom: "16px", maxWidth: isMobile ? "100%" : "360px" }}>
        <Search size={15} className="search-icon" />
        <input className="search-input" placeholder="Search by name, phone or code..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
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
            <Users size={40} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
            <div className="empty-state-title">No staff found</div>
            <div className="empty-state-sub">
              {search ? "No staff match your search" : filter !== "all" ? "No staff with this role" : "Add your first staff member"}
            </div>
            {!search && filter === "all" && (
              <button className="btn btn-primary btn-sm" style={{ marginTop: "20px" }} onClick={() => setShowAdd(true)}>
                <Plus size={13} /> Add Staff
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Cards */}
      {filtered.length > 0 && isMobile && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map((s) => {
            const roleMeta = ROLE_META[s.role || "other"] || ROLE_META.other
            const name = staffName(s)
            return (
              <div key={s.id} className="card-surface" style={{ padding: "14px" }}
                onClick={() => setViewStaff(s)}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                  <Avatar name={name} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                    {s.email && (
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.email}</div>
                    )}
                  </div>
                  <span className={"pill " + roleMeta.pill} style={{ fontSize: "10px", flexShrink: 0 }}>{roleMeta.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", gap: "12px" }}>
                    {s.phone && (
                      <div style={{ fontFamily: '"DM Mono", monospace', fontSize: "12px", color: "var(--text-secondary)" }}>{s.phone}</div>
                    )}
                    {s.employee_code && (
                      <div style={{ fontFamily: '"DM Mono", monospace', fontSize: "12px", color: "var(--text-muted)" }}>{s.employee_code}</div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <span className={"pill " + (s.is_active ? "pill-green" : "pill-gray")} style={{ fontSize: "10px" }}>
                      {s.is_active ? "Active" : "Inactive"}
                    </span>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: "10px", padding: "4px 8px", opacity: togglingId === s.id ? 0.6 : 1 }}
                      disabled={togglingId === s.id}
                      onClick={(e) => { e.stopPropagation(); toggleActive(s) }}
                    >
                      {s.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Desktop Table */}
      {filtered.length > 0 && !isMobile && (
        <div className="card-surface" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Employee Code</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const roleMeta = ROLE_META[s.role || "other"] || ROLE_META.other
                  const name = staffName(s)
                  return (
                    <tr key={s.id} style={{ cursor: "pointer" }} onClick={() => setViewStaff(s)}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <Avatar name={name} size={32} />
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{name}</div>
                            {s.email && (
                              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{s.email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td><span className={"pill " + roleMeta.pill}>{roleMeta.label}</span></td>
                      <td>
                        <span style={{ fontFamily: '"DM Mono", monospace', fontSize: "12px", color: "var(--text-secondary)" }}>
                          {s.phone || "—"}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: '"DM Mono", monospace', fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.5px" }}>
                          {s.employee_code || "—"}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: '"DM Mono", monospace', fontSize: "12px", color: "var(--text-muted)" }}>
                          {s.join_date ? fmtDate(s.join_date) : "—"}
                        </span>
                      </td>
                      <td>
                        <span className={"pill " + (s.is_active ? "pill-green" : "pill-gray")}>
                          {s.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: "11px", opacity: togglingId === s.id ? 0.6 : 1 }}
                          disabled={togglingId === s.id}
                          onClick={() => toggleActive(s)}
                        >
                          {s.is_active ? "Deactivate" : "Activate"}
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

      {/* Staff Profile Modal */}
      {viewStaff && (
        <Modal title="Staff Profile" wide onClose={() => setViewStaff(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <Avatar name={staffName(viewStaff)} size={56} />
                <div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
                    {staffName(viewStaff)}
                  </div>
                  {viewStaff.email && (
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>{viewStaff.email}</div>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <span className={"pill " + (ROLE_META[viewStaff.role || "other"]?.pill || "pill-gray")} style={{ fontSize: "12px", padding: "4px 14px" }}>
                  {ROLE_META[viewStaff.role || "other"]?.label || viewStaff.role}
                </span>
                <span className={"pill " + (viewStaff.is_active ? "pill-green" : "pill-gray")}>
                  {viewStaff.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div style={{ height: "1px", background: "var(--border)" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { icon: Phone,    label: "Phone",         value: viewStaff.phone,         mono: true  },
                { icon: Shield,   label: "Employee Code", value: viewStaff.employee_code, mono: true  },
                { icon: Calendar, label: "Joined",        value: viewStaff.join_date ? fmtDate(viewStaff.join_date) : null, mono: false },
                { icon: Users,    label: "Address",       value: viewStaff.address,       mono: false },
              ].filter((item) => item.value).map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "12px 14px", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <Icon size={12} style={{ color: "var(--text-muted)" }} />
                      <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {item.label}
                      </span>
                    </div>
                    <div style={{ fontFamily: item.mono ? '"DM Mono", monospace' : "inherit", fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                      {item.value}
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className={"btn btn-sm " + (viewStaff.is_active ? "btn-danger" : "btn-primary")}
                disabled={togglingId === viewStaff.id}
                onClick={() => toggleActive(viewStaff)}
              >
                {togglingId === viewStaff.id ? "Updating..." : viewStaff.is_active ? "Deactivate Staff" : "Activate Staff"}
              </button>
            </div>
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
                <input className="form-input" style={{ fontFamily: '"DM Mono", monospace' }}
                  placeholder="e.g. 9876543210" type="tel"
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
                <select className="form-select" value={form.role}
                  onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
                  {Object.entries(ROLE_META).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Employee Code</label>
                <input className="form-input" style={{ fontFamily: '"DM Mono", monospace' }}
                  placeholder="e.g. EMP001"
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
            <button className="btn btn-primary" onClick={saveStaff} disabled={saving}>
              {saving ? "Saving..." : "Add Staff Member"}
            </button>
          </div>
        </Modal>
      )}

    </div>
  )
}
