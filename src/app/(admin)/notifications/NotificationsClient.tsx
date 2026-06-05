"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

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

// ── Custom SVG Icons ──────────────────────────────────────────────────────────

const IcoRefresh = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M11.5 2.5A5.5 5.5 0 1 1 6.5 1H9M9 1L11 3M9 1l2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IcoCheckAll = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M1 7.5l3.5 3.5L13 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.5 7.5l3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IcoBell = () => (
  <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
    <rect width="38" height="38" rx="11" fill="rgba(108,92,231,0.08)"/>
    <path d="M19 10a6 6 0 0 1 6 6v3l1.5 2.5H11.5L13 19v-3a6 6 0 0 1 6-6Z" stroke="var(--accent)" strokeWidth="1.6" strokeLinejoin="round"/>
    <path d="M17 25.5a2 2 0 0 0 4 0" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)

const IcoBellEmpty = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <path d="M20 10a7 7 0 0 1 7 7v4l2 3H11l2-3v-4a7 7 0 0 1 7-7Z" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M17.5 27a2.5 2.5 0 0 0 5 0" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const IcoCalendar = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
    <rect x="2" y="3.5" width="13" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M5.5 2v3M11.5 2v3M2 7.5h13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <rect x="5" y="10" width="2" height="2" rx="0.5" fill="currentColor"/>
    <rect x="7.5" y="10" width="2" height="2" rx="0.5" fill="currentColor"/>
    <rect x="10" y="10" width="2" height="2" rx="0.5" fill="currentColor"/>
  </svg>
)

const IcoDollar = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
    <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M8.5 5v7M6.5 6.5a2 2 0 0 1 4 0c0 1.1-.9 2-2 2s2 .9 2 2a2 2 0 0 1-4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const IcoUsers = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
    <circle cx="6.5" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M1.5 14c0-2.761 2.239-4 5-4s5 1.239 5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <circle cx="12.5" cy="6" r="2" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M14.5 14c.5-.8.5-1.8 0-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)

const IcoSettings = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
    <circle cx="8.5" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M8.5 2v1.5M8.5 13.5V15M2 8.5h1.5M13.5 8.5H15M3.6 3.6l1.1 1.1M12.3 12.3l1.1 1.1M3.6 13.4l1.1-1.1M12.3 4.7l1.1-1.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)

const IcoBellSmall = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
    <path d="M8.5 3a5 5 0 0 1 5 5v2.5l1 1.5H3.5l1-1.5V8a5 5 0 0 1 5-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    <path d="M7 14a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)

// ── Type config (no lucide icons) ─────────────────────────────────────────────

const NOTIF_TYPES: Record<string, {
  color: string; bg: string; border: string
  Icon: () => React.ReactElement
}> = {
  booking: {
    color: "var(--blue)",   bg: "rgba(116,185,255,0.08)",  border: "rgba(116,185,255,0.18)",
    Icon: IcoCalendar,
  },
  payment: {
    color: "var(--green)",  bg: "rgba(0,184,148,0.08)",    border: "rgba(0,184,148,0.18)",
    Icon: IcoDollar,
  },
  staff: {
    color: "var(--amber)",  bg: "rgba(253,203,110,0.08)",  border: "rgba(253,203,110,0.18)",
    Icon: IcoUsers,
  },
  system: {
    color: "var(--purple)", bg: "rgba(162,155,254,0.08)",  border: "rgba(162,155,254,0.18)",
    Icon: IcoSettings,
  },
  general: {
    color: "var(--blue)",   bg: "rgba(116,185,255,0.08)",  border: "rgba(116,185,255,0.18)",
    Icon: IcoBellSmall,
  },
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Notification {
  id: string
  title?: string | null
  message?: string | null
  type?: string | null
  is_read?: boolean | null
  created_at: string
}

// ── Group helper ──────────────────────────────────────────────────────────────

function groupByDate(notifs: Notification[]): { label: string; items: Notification[] }[] {
  const today   = new Date().toISOString().split("T")[0]
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]
  const groups: Record<string, Notification[]> = { today: [], week: [], older: [] }
  for (const n of notifs) {
    const d = n.created_at.split("T")[0]
    if (d === today)       groups.today.push(n)
    else if (d >= weekAgo) groups.week.push(n)
    else                   groups.older.push(n)
  }
  const result: { label: string; items: Notification[] }[] = []
  if (groups.today.length > 0) result.push({ label: "Today",     items: groups.today })
  if (groups.week.length  > 0) result.push({ label: "This Week", items: groups.week  })
  if (groups.older.length > 0) result.push({ label: "Older",     items: groups.older })
  return result
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function NotificationsClient() {
  const db = createClient() as any

  const [notifs,     setNotifs]     = useState<Notification[]>([])
  const [loading,    setLoading]    = useState(true)
  const [markingAll, setMarkingAll] = useState(false)
  const [filter,     setFilter]     = useState<"all" | "unread">("all")

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

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
    finally  { setLoading(false) }
  }

  async function markRead(id: string) {
    const { error } = await db.from("notifications").update({ is_read: true }).eq("id", id)
    if (!error) setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
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
    finally  { setMarkingAll(false) }
  }

  const unreadCount = notifs.filter((n) => !n.is_read).length
  const displayed   = filter === "unread" ? notifs.filter((n) => !n.is_read) : notifs
  const groups      = groupByDate(displayed)
  const p           = isMobile ? "12px" : "28px"

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ overflowX: "hidden", width: "100%", boxSizing: "border-box" }}>
      {/* Topbar skeleton */}
      <div style={{
        position: "sticky", top: 0, height: "56px",
        background: "rgba(10,10,15,0.88)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.065)",
        zIndex: 50, display: "flex", alignItems: "center",
        padding: isMobile ? "0 14px" : "0 28px", gap: "8px",
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>Notifications</div>
        </div>
      </div>
      <div style={{ padding: p, maxWidth: "860px", margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="skeleton" style={{ height: "74px", borderRadius: "14px" }} />
          ))}
        </div>
      </div>
    </div>
  )

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <div style={{ overflowX: "hidden", width: "100%", boxSizing: "border-box" }}>

      {/* ── Sticky Topbar ───────────────────────────────────────────────── */}
      <div style={{
        position: "sticky", top: 0, height: "56px",
        background: "rgba(10,10,15,0.88)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.065)",
        zIndex: 50, display: "flex", alignItems: "center",
        padding: isMobile ? "0 14px" : "0 28px",
        gap: "8px", flexShrink: 0,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: isMobile ? "15px" : "16px", fontWeight: 600,
            color: "var(--text-primary)", letterSpacing: "-0.3px",
          }}>
            Notifications
          </div>
          {!isMobile && (
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>
              {unreadCount > 0 ? unreadCount + " unread" : "All caught up"} &middot; {notifs.length} total
            </div>
          )}
        </div>

        {/* Refresh */}
        <button
          onClick={fetchNotifs}
          style={{
            height: "32px", padding: "0 12px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px", color: "rgba(240,240,248,0.6)",
            fontSize: "12px", fontWeight: 500,
            fontFamily: '"DM Sans",sans-serif',
            cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
            transition: "all 150ms ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.color = "rgba(240,240,248,0.9)" }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(240,240,248,0.6)" }}
        >
          <IcoRefresh />{!isMobile && "Refresh"}
        </button>

        {/* Mark All Read */}
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={markingAll}
            style={{
              height: "32px", padding: "0 14px",
              background: "var(--accent)", border: "none",
              borderRadius: "8px", color: "#fff",
              fontSize: "12px", fontWeight: 600,
              fontFamily: '"DM Sans",sans-serif',
              cursor: markingAll ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: "6px",
              boxShadow: "0 0 18px rgba(108,92,231,0.3)",
              transition: "all 150ms ease", letterSpacing: "-0.1px",
              opacity: markingAll ? 0.7 : 1,
            }}
            onMouseEnter={e => { if (!markingAll) { e.currentTarget.style.background = "#7d6ff0"; e.currentTarget.style.boxShadow = "0 0 24px rgba(108,92,231,0.45)" } }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 18px rgba(108,92,231,0.3)" }}
          >
            <IcoCheckAll />
            {!isMobile && (markingAll ? "Marking..." : "Mark All Read")}
            {isMobile && unreadCount > 0 && (
              <span style={{
                background: "rgba(255,255,255,0.25)", borderRadius: "99px",
                padding: "0 5px", fontSize: "10px", fontWeight: 700,
              }}>
                {unreadCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* ── Page content ────────────────────────────────────────────────── */}
      <div style={{ padding: p, maxWidth: "860px", margin: "0 auto" }}>

        {/* Filter tabs */}
        <div style={{
          display: "flex", gap: "3px", overflowX: "auto", flexWrap: "nowrap",
          WebkitOverflowScrolling: "touch", marginBottom: "24px",
        }}>
          {(["all", "unread"] as const).map((f) => {
            const isActive = filter === f
            const count    = f === "all" ? notifs.length : unreadCount
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  flexShrink: 0, height: "32px", padding: "0 14px",
                  borderRadius: "8px", border: "none",
                  background: isActive ? "var(--accent)" : "rgba(255,255,255,0.05)",
                  color: isActive ? "#fff" : "var(--text-muted)",
                  fontSize: "12px", fontWeight: isActive ? 600 : 500,
                  fontFamily: '"DM Sans",sans-serif',
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
                  transition: "all 150ms ease",
                  boxShadow: isActive ? "0 0 14px rgba(108,92,231,0.25)" : "none",
                }}
              >
                {f === "all" ? "All" : "Unread"}
                <span style={{
                  background: isActive ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)",
                  borderRadius: "99px", padding: "1px 7px",
                  fontSize: "10px", fontWeight: 700,
                  color: isActive ? "#fff" : "var(--text-muted)",
                }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Empty state */}
        {groups.length === 0 && (
          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: "16px", padding: "56px 24px",
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: "10px", textAlign: "center",
          }}>
            <IcoBellEmpty />
            <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginTop: "6px" }}>
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "280px", lineHeight: 1.5 }}>
              {filter === "unread"
                ? "You are all caught up"
                : "Notifications will appear here as activity happens"}
            </div>
            {filter === "unread" && (
              <button
                onClick={() => setFilter("all")}
                style={{
                  marginTop: "16px", height: "32px", padding: "0 16px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px", color: "var(--text-secondary)",
                  fontSize: "12px", fontWeight: 500,
                  fontFamily: '"DM Sans",sans-serif', cursor: "pointer",
                }}
              >
                View all notifications
              </button>
            )}
          </div>
        )}

        {/* Grouped notifications */}
        {groups.map((group) => (
          <div key={group.label} style={{ marginBottom: "28px" }}>

            {/* Group label */}
            <div style={{
              fontSize: "10px", fontWeight: 700,
              color: "var(--text-muted)", letterSpacing: "0.08em",
              textTransform: "uppercase", marginBottom: "10px", paddingLeft: "4px",
            }}>
              {group.label}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {group.items.map((n) => {
                const typeKey = (n.type || "general").toLowerCase()
                const meta    = NOTIF_TYPES[typeKey] || NOTIF_TYPES.general
                const Icon    = meta.Icon
                const isUnread = !n.is_read
                return (
                  <div
                    key={n.id}
                    onClick={() => { if (isUnread) markRead(n.id) }}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: "14px",
                      padding: "15px 18px",
                      borderRadius: "14px",
                      background: isUnread ? "rgba(108,92,231,0.05)" : "var(--bg-surface)",
                      border: "1px solid " + (isUnread ? "rgba(108,92,231,0.15)" : "var(--border)"),
                      cursor: isUnread ? "pointer" : "default",
                      transition: "all 150ms ease",
                      position: "relative", overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      if (isUnread) {
                        e.currentTarget.style.background  = "rgba(108,92,231,0.09)"
                        e.currentTarget.style.borderColor = "rgba(108,92,231,0.25)"
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isUnread) {
                        e.currentTarget.style.background  = "rgba(108,92,231,0.05)"
                        e.currentTarget.style.borderColor = "rgba(108,92,231,0.15)"
                      }
                    }}
                  >
                    {/* Unread left accent bar */}
                    {isUnread && (
                      <div style={{
                        position: "absolute", left: 0, top: 0, bottom: 0,
                        width: "3px", background: "var(--accent)",
                        borderRadius: "14px 0 0 14px",
                      }} />
                    )}

                    {/* Type icon */}
                    <div style={{
                      width: "38px", height: "38px", borderRadius: "11px",
                      background: meta.bg, border: "1px solid " + meta.border,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, color: meta.color,
                      marginLeft: isUnread ? "6px" : "0",
                    }}>
                      <Icon />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: "flex", alignItems: "flex-start",
                        justifyContent: "space-between", gap: "12px",
                      }}>
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
                            fontFamily: '"DM Mono", monospace',
                            fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap",
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
                          padding: "2px 8px", textTransform: "capitalize",
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
    </div>
  )
}
