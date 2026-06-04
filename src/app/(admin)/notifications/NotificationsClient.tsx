"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  Bell, CalendarCheck, DollarSign, Settings,
  Users, CheckCheck, RefreshCw, Circle
} from "lucide-react"

const fmtTime = (d: string) => {
  const date = new Date(d)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return diffMins + "m ago"
  if (diffHours < 24) return diffHours + "h ago"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return diffDays + "d ago"
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })

const NOTIF_TYPES: Record<string, { color: string; bg: string; border: string; icon: any }> = {
  booking:  { color: "var(--blue)",   bg: "var(--blue-bg)",   border: "var(--blue-border)",   icon: CalendarCheck },
  payment:  { color: "var(--green)",  bg: "var(--green-bg)",  border: "var(--green-border)",  icon: DollarSign    },
  staff:    { color: "var(--amber)",  bg: "var(--amber-bg)",  border: "var(--amber-border)",  icon: Users         },
  system:   { color: "var(--purple)", bg: "var(--purple-bg)", border: "var(--purple-border)", icon: Settings      },
  general:  { color: "var(--blue)",   bg: "var(--blue-bg)",   border: "var(--blue-border)",   icon: Bell          },
}

interface Notification {
  id: string
  title?: string | null
  message?: string | null
  type?: string | null
  is_read?: boolean | null
  created_at: string
}

function groupByDate(notifs: Notification[]): { label: string; items: Notification[] }[] {
  const today = new Date().toISOString().split("T")[0]
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]
  const groups: Record<string, Notification[]> = { today: [], week: [], older: [] }
  for (const n of notifs) {
    const d = n.created_at.split("T")[0]
    if (d === today) groups.today.push(n)
    else if (d >= weekAgo) groups.week.push(n)
    else groups.older.push(n)
  }
  const result: { label: string; items: Notification[] }[] = []
  if (groups.today.length > 0) result.push({ label: "Today", items: groups.today })
  if (groups.week.length > 0) result.push({ label: "This Week", items: groups.week })
  if (groups.older.length > 0) result.push({ label: "Older", items: groups.older })
  return result
}

export default function NotificationsClient() {
  const db = createClient() as any

  const [notifs, setNotifs] = useState<Notification[]>([])

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  useEffect(() => { fetchNotifs() }, [])

  async function fetchNotifs() {
    setLoading(true)
    try {
      const { data } = await db
        .from("notifications")
        .select("id, title, message, type, is_read, created_at")
        .order("created_at", { ascending: false })
        .limit(100)
      setNotifs((data as Notification[]) || [])
    } catch { toast.error("Failed to load notifications") }
    finally { setLoading(false) }
  }

  async function markRead(id: string) {
    const { error } = await db.from("notifications").update({ is_read: true }).eq("id", id)
    if (!error) {
      setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
    }
  }

  async function markAllRead() {
    setMarkingAll(true)
    try {
      const unreadIds = notifs.filter((n) => !n.is_read).map((n) => n.id)
      if (unreadIds.length === 0) { toast.success("All caught up!"); return }
      const { error } = await db.from("notifications").update({ is_read: true }).in("id", unreadIds)
      if (error) throw error
      setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })))
      toast.success("All notifications marked as read")
    } catch { toast.error("Failed to mark all as read") }
    finally { setMarkingAll(false) }
  }

  const unreadCount = notifs.filter((n) => !n.is_read).length
  const displayed = filter === "unread" ? notifs.filter((n) => !n.is_read) : notifs
  const groups = groupByDate(displayed)

  if (loading) return (
    <div style={{ padding: isMobile ? "12px" : "28px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {[1,2,3,4,5,6].map((i) => (
          <div key={i} className="skeleton" style={{ height: "72px", borderRadius: "14px" }} />
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ padding: isMobile ? "12px" : "28px", maxWidth: "860px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isMobile ? "16px" : "24px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 className="page-title" style={{ fontSize: isMobile ? "18px" : undefined }}>Notifications</h1>
          <p className="page-sub">
            {unreadCount > 0 ? unreadCount + " unread" : "All caught up"} &middot; {notifs.length} total
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchNotifs}>
            <RefreshCw size={13} /> Refresh
          </button>
          {unreadCount > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={markAllRead} disabled={markingAll}>
              <CheckCheck size={13} /> {markingAll ? "Marking..." : "Mark All Read"}
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs" style={{ marginBottom: "24px", display: "inline-flex" }}>
        <button className={"filter-tab" + (filter === "all" ? " active" : "")} onClick={() => setFilter("all")}>
          All <span className="tab-count">{notifs.length}</span>
        </button>
        <button className={"filter-tab" + (filter === "unread" ? " active" : "")} onClick={() => setFilter("unread")}>
          Unread <span className="tab-count">{unreadCount}</span>
        </button>
      </div>

      {/* Empty */}
      {groups.length === 0 && (
        <div className="card-surface">
          <div className="empty-state">
            <Bell size={40} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
            <div className="empty-state-title">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </div>
            <div className="empty-state-sub">
              {filter === "unread" ? "You are all caught up" : "Notifications will appear here as activity happens"}
            </div>
            {filter === "unread" && (
              <button className="btn btn-secondary btn-sm" style={{ marginTop: "20px" }} onClick={() => setFilter("all")}>
                View all notifications
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grouped Notifications */}
      {groups.map((group) => (
        <div key={group.label} style={{ marginBottom: "28px" }}>
          <div className="section-label" style={{ marginBottom: "12px", paddingLeft: "4px" }}>
            {group.label}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {group.items.map((n) => {
              const typeKey = (n.type || "general").toLowerCase()
              const meta = NOTIF_TYPES[typeKey] || NOTIF_TYPES.general
              const Icon = meta.icon
              const isUnread = !n.is_read
              return (
                <div
                  key={n.id}
                  onClick={() => { if (isUnread) markRead(n.id) }}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: "14px",
                    padding: "16px 18px",
                    borderRadius: "14px",
                    background: isUnread ? "rgba(108,92,231,0.05)" : "var(--bg-surface)",
                    border: "1px solid " + (isUnread ? "rgba(108,92,231,0.15)" : "var(--border)"),
                    cursor: isUnread ? "pointer" : "default",
                    transition: "all 150ms ease",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    if (isUnread) {
                      e.currentTarget.style.background = "rgba(108,92,231,0.09)"
                      e.currentTarget.style.borderColor = "rgba(108,92,231,0.25)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isUnread) {
                      e.currentTarget.style.background = "rgba(108,92,231,0.05)"
                      e.currentTarget.style.borderColor = "rgba(108,92,231,0.15)"
                    }
                  }}
                >
                  {/* Unread left accent */}
                  {isUnread && (
                    <div style={{
                      position: "absolute", left: 0, top: 0, bottom: 0,
                      width: "3px", background: "var(--accent)", borderRadius: "14px 0 0 14px",
                    }} />
                  )}

                  {/* Icon */}
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "11px",
                    background: meta.bg, border: "1px solid " + meta.border,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginLeft: isUnread ? "6px" : "0",
                  }}>
                    <Icon size={17} color={meta.color} strokeWidth={2.5} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <div style={{
                        fontSize: "13px", fontWeight: isUnread ? 600 : 500,
                        color: isUnread ? "var(--text-primary)" : "var(--text-secondary)",
                        lineHeight: 1.4,
                      }}>
                        {n.title || "Notification"}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                        {isUnread && (
                          <div style={{
                            width: "7px", height: "7px", borderRadius: "50%",
                            background: "var(--accent)", flexShrink: 0,
                          }} />
                        )}
                        <span style={{
                          fontFamily: '"DM Mono", monospace', fontSize: "11px",
                          color: "var(--text-muted)", whiteSpace: "nowrap",
                        }}>
                          {fmtTime(n.created_at)}
                        </span>
                      </div>
                    </div>
                    {n.message && (
                      <div style={{
                        fontSize: "12px", color: "var(--text-muted)",
                        marginTop: "4px", lineHeight: 1.5,
                      }}>
                        {n.message}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
                      <span style={{
                        fontSize: "10px", fontWeight: 600, color: meta.color,
                        background: meta.bg, borderRadius: "99px",
                        padding: "1px 8px", textTransform: "capitalize",
                      }}>
                        {typeKey}
                      </span>
                      {isUnread && (
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          Click to mark as read
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

    </div>
  )
}
