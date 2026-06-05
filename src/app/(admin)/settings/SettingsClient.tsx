"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

// ── Custom SVG Icons ──────────────────────────────────────────────────────────

const IcoRefresh = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M11.5 2.5A5.5 5.5 0 1 1 6.5 1H9M9 1L11 3M9 1l2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IcoSave = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 2.5A.5.5 0 0 1 2.5 2h7.086a.5.5 0 0 1 .353.146l1.915 1.915A.5.5 0 0 1 12 4.414V11.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <rect x="4.5" y="2" width="5" height="3.5" rx="0.5" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="3.5" y="8" width="7" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.4"/>
  </svg>
)

const IcoHotel = () => (
  <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
    <rect x="2" y="5" width="15" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.7"/>
    <path d="M6 17V9M13 17V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M6 9h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M5 5L9.5 2L14 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="7.5" y="12" width="4" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.4"/>
  </svg>
)

const IcoPercent = () => (
  <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
    <circle cx="6" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.7"/>
    <circle cx="13" cy="13" r="2.5" stroke="currentColor" strokeWidth="1.7"/>
    <path d="M15.5 3.5L3.5 15.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
  </svg>
)

const IcoClock = () => (
  <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
    <circle cx="9.5" cy="9.5" r="7" stroke="currentColor" strokeWidth="1.7"/>
    <path d="M9.5 5.5V9.5L12 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IcoCurrency = () => (
  <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
    <circle cx="9.5" cy="9.5" r="7" stroke="currentColor" strokeWidth="1.7"/>
    <path d="M9.5 4.5V14.5M7 6.5a2.5 2.5 0 0 1 5 0c0 1.38-1.12 2.5-2.5 2.5S7 10.38 7 11.75A2.5 2.5 0 0 0 9.5 14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const IcoAlert = () => (
  <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
    <path d="M9.5 2L17.5 16H1.5L9.5 2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
    <path d="M9.5 8V11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
    <circle cx="9.5" cy="13.5" r="0.8" fill="currentColor"/>
  </svg>
)

const IcoAlertSm = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M6.5 1.5L12 11.5H1L6.5 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M6.5 5.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="6.5" cy="9.5" r="0.6" fill="currentColor"/>
  </svg>
)

const IcoPercentSm = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="4.5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="9.5" cy="9.5" r="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M11.5 2.5L2.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

// ── Types ─────────────────────────────────────────────────────────────────────

interface HotelSettings {
  id?: string
  name?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  gst_number?: string | null
  gst_percentage?: number | null
  tax_name?: string | null
  check_in_time?: string | null
  check_out_time?: string | null
  currency?: string | null
  currency_symbol?: string | null
}

// ── Section Card ──────────────────────────────────────────────────────────────

function SectionCard({
  title, description, Icon, iconColor, iconBg, children
}: {
  title: string
  description: string
  Icon: () => React.ReactElement
  iconColor: string
  iconBg: string
  children: React.ReactNode
}) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: "16px", padding: "24px", marginBottom: "16px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "20px" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "11px",
          background: iconBg, display: "flex", alignItems: "center",
          justifyContent: "center", flexShrink: 0, color: iconColor,
        }}>
          <Icon />
        </div>
        <div>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.2px" }}>
            {title}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
            {description}
          </div>
        </div>
      </div>
      <div style={{ height: "1px", background: "var(--border)", marginBottom: "20px" }} />
      {children}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SettingsClient() {
  const db = createClient() as any

  const [settings,      setSettings]      = useState<HotelSettings>({})
  const [loading,       setLoading]       = useState(true)
  const [saving,        setSaving]        = useState(false)
  const [confirmReset,  setConfirmReset]  = useState(false)
  const [confirmText,   setConfirmText]   = useState("")

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => { fetchSettings() }, [])

  async function fetchSettings() {
    setLoading(true)
    try {
      const { data } = await db
        .from("hotel_settings")
        .select("*")
        .limit(1)
        .single()
      if (data) setSettings(data as HotelSettings)
    } catch {
      // table may not exist yet or no row — start with empty
    } finally {
      setLoading(false)
    }
  }

  async function saveSettings() {
    if (!settings.name?.trim()) { toast.error("Hotel name is required"); return }
    setSaving(true)
    try {
      if (settings.id) {
        const { error } = await db.from("hotel_settings").update(settings).eq("id", settings.id)
        if (error) throw error
      } else {
        const { data, error } = await db.from("hotel_settings").insert(settings).select().single()
        if (error) throw error
        if (data) setSettings(data as HotelSettings)
      }
      toast.success("Settings saved successfully")
    } catch { toast.error("Failed to save settings") }
    finally   { setSaving(false) }
  }

  function set(key: keyof HotelSettings, value: string | number | null) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const p = isMobile ? "12px" : "28px"

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ overflowX: "hidden", width: "100%", boxSizing: "border-box" }}>
      <div style={{
        position: "sticky", top: 0, height: "56px",
        background: "rgba(10,10,15,0.88)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.065)",
        zIndex: 50, display: "flex", alignItems: "center",
        padding: isMobile ? "0 14px" : "0 28px", gap: "8px",
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>Settings</div>
        </div>
      </div>
      <div style={{ padding: p, maxWidth: "760px", margin: "0 auto" }}>
        {[1,2,3,4].map((i) => (
          <div key={i} className="skeleton" style={{ height: "200px", borderRadius: "16px", marginBottom: "16px" }} />
        ))}
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
            Settings
          </div>
          {!isMobile && (
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>
              Manage your hotel configuration
            </div>
          )}
        </div>

        {/* Reload ghost button */}
        <button
          onClick={fetchSettings}
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
          <IcoRefresh />{!isMobile && "Reload"}
        </button>

        {/* Save All Changes primary button */}
        <button
          onClick={saveSettings}
          disabled={saving}
          style={{
            height: "32px", padding: "0 14px",
            background: saving ? "rgba(108,92,231,0.5)" : "var(--accent)",
            border: "none", borderRadius: "8px", color: "#fff",
            fontSize: "12px", fontWeight: 600,
            fontFamily: '"DM Sans",sans-serif',
            cursor: saving ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: "6px",
            boxShadow: "0 0 18px rgba(108,92,231,0.3)",
            transition: "all 150ms ease", letterSpacing: "-0.1px",
          }}
          onMouseEnter={e => { if (!saving) { e.currentTarget.style.background = "#7d6ff0"; e.currentTarget.style.boxShadow = "0 0 24px rgba(108,92,231,0.45)" } }}
          onMouseLeave={e => { if (!saving) { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 18px rgba(108,92,231,0.3)" } }}
        >
          <IcoSave />
          {!isMobile && (saving ? "Saving..." : "Save All Changes")}
          {isMobile && (saving ? "..." : "Save")}
        </button>
      </div>

      {/* ── Page content ────────────────────────────────────────────────── */}
      <div style={{ padding: p, maxWidth: "760px", margin: "0 auto" }}>

        {/* Hotel Profile */}
        <SectionCard
          title="Hotel Profile"
          description="Basic information about your property"
          Icon={IcoHotel}
          iconColor="var(--accent-light)"
          iconBg="var(--accent-glow)"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Hotel Name *</label>
              <input className="form-input" placeholder="e.g. The Grand Palace Hotel"
                value={settings.name || ""}
                onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea className="form-textarea" placeholder="Full property address..."
                value={settings.address || ""}
                onChange={(e) => set("address", e.target.value)} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" style={{ fontFamily: '"DM Mono", monospace' }}
                  placeholder="e.g. +91 98765 43210" type="tel"
                  value={settings.phone || ""}
                  onChange={(e) => set("phone", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" placeholder="e.g. info@hotel.com" type="email"
                  value={settings.email || ""}
                  onChange={(e) => set("email", e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Website</label>
              <input className="form-input" style={{ fontFamily: '"DM Mono", monospace' }}
                placeholder="e.g. https://www.yourhotel.com"
                value={settings.website || ""}
                onChange={(e) => set("website", e.target.value)} />
            </div>
          </div>
        </SectionCard>

        {/* Tax & GST */}
        <SectionCard
          title="Tax & GST Settings"
          description="Configure tax rates applied to invoices"
          Icon={IcoPercent}
          iconColor="var(--green)"
          iconBg="rgba(0,184,148,0.08)"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Tax Name</label>
                <input className="form-input" placeholder="e.g. GST"
                  value={settings.tax_name || ""}
                  onChange={(e) => set("tax_name", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Tax Rate (%)</label>
                <input className="form-input" style={{ fontFamily: '"DM Mono", monospace' }}
                  type="number" min="0" max="100" step="0.01" placeholder="e.g. 18"
                  value={settings.gst_percentage ?? ""}
                  onChange={(e) => set("gst_percentage", parseFloat(e.target.value) || null)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">GST Number</label>
              <input className="form-input" style={{ fontFamily: '"DM Mono", monospace', letterSpacing: "0.5px" }}
                placeholder="e.g. 29AABCT1332L1ZN" maxLength={15}
                value={settings.gst_number || ""}
                onChange={(e) => set("gst_number", e.target.value.toUpperCase())} />
            </div>
            {(settings.gst_percentage ?? 0) > 0 && (
              <div style={{
                background: "rgba(0,184,148,0.08)", border: "1px solid rgba(0,184,148,0.18)",
                borderRadius: "10px", padding: "12px 14px",
                display: "flex", alignItems: "center", gap: "10px",
                color: "var(--green)",
              }}>
                <IcoPercentSm />
                <span style={{ fontSize: "13px", fontWeight: 500 }}>
                  {settings.gst_percentage}% {settings.tax_name || "tax"} will be applied to all invoices
                </span>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Check-in & Check-out Times */}
        <SectionCard
          title="Check-in & Check-out Times"
          description="Default times for guest arrivals and departures"
          Icon={IcoClock}
          iconColor="var(--blue)"
          iconBg="rgba(116,185,255,0.08)"
        >
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Check-in Time</label>
              <input className="form-input" style={{ fontFamily: '"DM Mono", monospace' }}
                type="time"
                value={settings.check_in_time || "14:00"}
                onChange={(e) => set("check_in_time", e.target.value)} />
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                Default: 2:00 PM
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Check-out Time</label>
              <input className="form-input" style={{ fontFamily: '"DM Mono", monospace' }}
                type="time"
                value={settings.check_out_time || "11:00"}
                onChange={(e) => set("check_out_time", e.target.value)} />
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                Default: 11:00 AM
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Currency */}
        <SectionCard
          title="Currency"
          description="Currency used across all invoices and reports"
          Icon={IcoCurrency}
          iconColor="var(--amber)"
          iconBg="rgba(253,203,110,0.08)"
        >
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Currency Code</label>
              <select className="form-select"
                value={settings.currency || "INR"}
                onChange={(e) => set("currency", e.target.value)}>
                <option value="INR">INR — Indian Rupee</option>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="AED">AED — UAE Dirham</option>
                <option value="SGD">SGD — Singapore Dollar</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Currency Symbol</label>
              <input className="form-input" style={{ fontFamily: '"DM Mono", monospace', fontSize: "16px" }}
                placeholder="e.g. ₹"
                value={settings.currency_symbol || ""}
                onChange={(e) => set("currency_symbol", e.target.value)} />
            </div>
          </div>
        </SectionCard>

        {/* Bottom save button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
          <button
            onClick={saveSettings}
            disabled={saving}
            style={{
              height: "38px", padding: "0 24px",
              background: saving ? "rgba(108,92,231,0.5)" : "var(--accent)",
              border: "none", borderRadius: "10px", color: "#fff",
              fontSize: "13px", fontWeight: 600,
              fontFamily: '"DM Sans",sans-serif',
              cursor: saving ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: "7px",
              boxShadow: "0 0 18px rgba(108,92,231,0.3)",
              transition: "all 150ms ease",
            }}
            onMouseEnter={e => { if (!saving) { e.currentTarget.style.background = "#7d6ff0"; e.currentTarget.style.boxShadow = "0 0 24px rgba(108,92,231,0.45)" } }}
            onMouseLeave={e => { if (!saving) { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 18px rgba(108,92,231,0.3)" } }}
          >
            <IcoSave />
            {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>

        {/* Danger Zone */}
        <div style={{
          background: "rgba(225,112,85,0.04)",
          border: "1px solid rgba(225,112,85,0.18)",
          borderRadius: "16px", padding: "24px", marginBottom: "28px",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "20px" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "11px",
              background: "rgba(225,112,85,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, color: "var(--red)",
            }}>
              <IcoAlert />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--red)", letterSpacing: "-0.2px" }}>
                Danger Zone
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                Irreversible actions. Proceed with extreme caution.
              </div>
            </div>
          </div>

          <div style={{ height: "1px", background: "rgba(225,112,85,0.15)", marginBottom: "20px" }} />

          {/* Reset action row */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: "12px",
            padding: "16px", borderRadius: "10px",
            background: "rgba(225,112,85,0.04)",
            border: "1px solid rgba(225,112,85,0.1)",
          }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                Reset All Settings
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                Clear all hotel settings and return to defaults. This cannot be undone.
              </div>
            </div>

            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                style={{
                  height: "30px", padding: "0 12px",
                  background: "rgba(225,112,85,0.1)",
                  border: "1px solid rgba(225,112,85,0.3)",
                  borderRadius: "8px", color: "var(--red)",
                  fontSize: "12px", fontWeight: 600,
                  fontFamily: '"DM Sans",sans-serif',
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
                  transition: "all 150ms ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(225,112,85,0.18)" }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(225,112,85,0.1)" }}
              >
                <IcoAlertSm /> Reset Settings
              </button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                <div style={{ fontSize: "12px", color: "var(--red)", fontWeight: 500 }}>
                  Type RESET to confirm:
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    className="form-input"
                    style={{
                      fontFamily: '"DM Mono", monospace',
                      width: "120px", padding: "6px 10px", fontSize: "13px",
                    }}
                    placeholder="RESET"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                  />
                  <button
                    disabled={confirmText !== "RESET"}
                    onClick={async () => {
                      try {
                        if (settings.id) {
                          await db.from("hotel_settings").delete().eq("id", settings.id)
                        }
                        setSettings({})
                        setConfirmReset(false)
                        setConfirmText("")
                        toast.success("Settings reset")
                      } catch { toast.error("Failed to reset") }
                    }}
                    style={{
                      height: "30px", padding: "0 12px",
                      background: confirmText === "RESET" ? "rgba(225,112,85,0.15)" : "rgba(255,255,255,0.04)",
                      border: "1px solid " + (confirmText === "RESET" ? "rgba(225,112,85,0.4)" : "rgba(255,255,255,0.08)"),
                      borderRadius: "8px",
                      color: confirmText === "RESET" ? "var(--red)" : "var(--text-muted)",
                      fontSize: "12px", fontWeight: 600,
                      fontFamily: '"DM Sans",sans-serif',
                      cursor: confirmText === "RESET" ? "pointer" : "not-allowed",
                      display: "flex", alignItems: "center", gap: "6px",
                      transition: "all 150ms ease",
                    }}
                  >
                    Confirm Reset
                  </button>
                  <button
                    onClick={() => { setConfirmReset(false); setConfirmText("") }}
                    style={{
                      height: "30px", padding: "0 12px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px", color: "var(--text-muted)",
                      fontSize: "12px", fontWeight: 500,
                      fontFamily: '"DM Sans",sans-serif',
                      cursor: "pointer", transition: "all 150ms ease",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)" }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
