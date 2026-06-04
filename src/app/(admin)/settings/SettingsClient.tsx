"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  Hotel, Phone, Mail, MapPin, Percent,
  Clock, DollarSign, Save, AlertTriangle,
  Globe, FileText, RefreshCw
} from "lucide-react"

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

function SectionCard({
  title, description, icon: Icon, iconColor, iconBg, children
}: {
  title: string
  description: string
  icon: any
  iconColor: string
  iconBg: string
  children: React.ReactNode
}) {
  return (
    <div className="card-surface animate-fade-in" style={{ padding: "24px", marginBottom: "16px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "24px" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "11px",
          background: iconBg, display: "flex", alignItems: "center",
          justifyContent: "center", flexShrink: 0,
        }}>
          <Icon size={19} color={iconColor} strokeWidth={2.5} />
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

export default function SettingsClient() {
  const db = createClient() as any

  const [settings, setSettings] = useState<HotelSettings>({})

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmText, setConfirmText] = useState("")

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
    finally { setSaving(false) }
  }

  function set(key: keyof HotelSettings, value: any) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  if (loading) return (
    <div style={{ padding: isMobile ? "12px" : "28px", maxWidth: "760px", margin: "0 auto" }}>
      {[1,2,3,4].map((i) => (
        <div key={i} className="skeleton" style={{ height: "200px", borderRadius: "16px", marginBottom: "16px" }} />
      ))}
    </div>
  )

  return (
    <div style={{ padding: isMobile ? "12px" : "28px", maxWidth: "760px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 className="page-title" style={{ fontSize: isMobile ? "18px" : undefined }}>Settings</h1>
          <p className="page-sub">Manage your hotel configuration</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchSettings}>
            <RefreshCw size={13} /> Reload
          </button>
          <button className="btn btn-primary" onClick={saveSettings} disabled={saving}>
            <Save size={14} /> {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>
      </div>

      {/* Hotel Profile */}
      <SectionCard
        title="Hotel Profile"
        description="Basic information about your property"
        icon={Hotel}
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

      {/* Tax Settings */}
      <SectionCard
        title="Tax & GST Settings"
        description="Configure tax rates applied to invoices"
        icon={Percent}
        iconColor="var(--green)"
        iconBg="var(--green-bg)"
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
          {settings.gst_percentage && settings.gst_percentage > 0 && (
            <div style={{
              background: "var(--green-bg)", border: "1px solid var(--green-border)",
              borderRadius: "10px", padding: "12px 14px",
              display: "flex", alignItems: "center", gap: "10px",
            }}>
              <Percent size={14} color="var(--green)" />
              <span style={{ fontSize: "13px", color: "var(--green)", fontWeight: 500 }}>
                {settings.gst_percentage}% {settings.tax_name || "tax"} will be applied to all invoices
              </span>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Check-in / Check-out Times */}
      <SectionCard
        title="Check-in & Check-out Times"
        description="Default times for guest arrivals and departures"
        icon={Clock}
        iconColor="var(--blue)"
        iconBg="var(--blue-bg)"
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
        icon={DollarSign}
        iconColor="var(--amber)"
        iconBg="var(--amber-bg)"
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
              placeholder="e.g. &#8377;"
              value={settings.currency_symbol || ""}
              onChange={(e) => set("currency_symbol", e.target.value)} />
          </div>
        </div>
      </SectionCard>

      {/* Save Button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <button className="btn btn-primary" onClick={saveSettings} disabled={saving}
          style={{ padding: "10px 28px", fontSize: "14px" }}>
          <Save size={15} /> {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      {/* Danger Zone */}
      <div style={{
        background: "rgba(225,112,85,0.05)",
        border: "1px solid rgba(225,112,85,0.2)",
        borderRadius: "16px", padding: "24px", marginBottom: "28px",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "20px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "11px",
            background: "var(--red-bg)", display: "flex", alignItems: "center",
            justifyContent: "center", flexShrink: 0,
          }}>
            <AlertTriangle size={19} color="var(--red)" strokeWidth={2.5} />
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

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Reset action */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: "12px",
            padding: "16px", borderRadius: "10px",
            background: "rgba(225,112,85,0.04)",
            border: "1px solid rgba(225,112,85,0.12)",
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
              <button className="btn btn-danger btn-sm" onClick={() => setConfirmReset(true)}>
                <AlertTriangle size={13} /> Reset Settings
              </button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                <div style={{ fontSize: "12px", color: "var(--red)", fontWeight: 500 }}>
                  Type RESET to confirm:
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    className="form-input"
                    style={{ fontFamily: '"DM Mono", monospace', width: "120px", padding: "6px 10px", fontSize: "13px" }}
                    placeholder="RESET"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                  />
                  <button
                    className="btn btn-danger btn-sm"
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
                  >
                    Confirm Reset
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setConfirmReset(false); setConfirmText("") }}>
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
