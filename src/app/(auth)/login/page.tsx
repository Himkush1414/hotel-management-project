"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Eye, EyeOff, Loader2, AlertCircle, Mail, Lock } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim())    { setError("Email is required"); return }
    if (!password.trim()) { setError("Password is required"); return }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return }

    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message || "Invalid email or password")
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-2xl)",
      padding: "32px",
      boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
      animation: "modalIn 250ms ease both",
    }}>

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{
          fontSize: "20px", fontWeight: 700,
          color: "var(--text-primary)", letterSpacing: "-0.4px",
          fontFamily: "DM Sans, sans-serif", marginBottom: "6px",
        }}>
          Welcome back
        </h1>
        <p style={{
          fontSize: "13px", color: "var(--text-muted)",
          fontFamily: "DM Sans, sans-serif",
        }}>
          Sign in to your account to continue
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: "10px",
          background: "var(--red-bg)", border: "1px solid var(--red-border)",
          borderRadius: "10px", padding: "12px 14px", marginBottom: "20px",
          animation: "fadeInUp 200ms ease both",
        }}>
          <AlertCircle size={15} style={{ color: "var(--red)", flexShrink: 0, marginTop: "1px" }} />
          <span style={{ fontSize: "13px", color: "var(--red)", fontFamily: "DM Sans, sans-serif" }}>
            {error}
          </span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Email */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{
            fontSize: "11px", fontWeight: 600, color: "var(--text-muted)",
            letterSpacing: "0.6px", textTransform: "uppercase",
            fontFamily: "DM Sans, sans-serif",
          }}>
            Email Address
          </label>
          <div style={{ position: "relative" }}>
            <Mail size={15} style={{
              position: "absolute", left: "12px", top: "50%",
              transform: "translateY(-50%)", color: "var(--text-muted)",
              pointerEvents: "none",
            }} />
            <input
              type="email"
              placeholder="you@hotel.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              style={{
                width: "100%", padding: "11px 12px 11px 38px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px", fontSize: "13px",
                fontFamily: "DM Sans, sans-serif",
                color: "var(--text-primary)", outline: "none",
                transition: "border-color 150ms ease, box-shadow 150ms ease",
                opacity: loading ? 0.6 : 1,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(108,92,231,0.6)"
                e.target.style.boxShadow = "0 0 0 3px rgba(108,92,231,0.1)"
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.1)"
                e.target.style.boxShadow = "none"
              }}
            />
          </div>
        </div>

        {/* Password */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <label style={{
              fontSize: "11px", fontWeight: 600, color: "var(--text-muted)",
              letterSpacing: "0.6px", textTransform: "uppercase",
              fontFamily: "DM Sans, sans-serif",
            }}>
              Password
            </label>
            <Link href="/forgot-password" style={{
              fontSize: "12px", color: "var(--accent-light)",
              textDecoration: "none", fontWeight: 500,
              fontFamily: "DM Sans, sans-serif",
              transition: "color 150ms ease",
            }}>
              Forgot password?
            </Link>
          </div>
          <div style={{ position: "relative" }}>
            <Lock size={15} style={{
              position: "absolute", left: "12px", top: "50%",
              transform: "translateY(-50%)", color: "var(--text-muted)",
              pointerEvents: "none",
            }} />
            <input
              type={showPass ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
              style={{
                width: "100%", padding: "11px 40px 11px 38px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px", fontSize: "13px",
                fontFamily: "DM Sans, sans-serif",
                color: "var(--text-primary)", outline: "none",
                transition: "border-color 150ms ease, box-shadow 150ms ease",
                opacity: loading ? 0.6 : 1,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(108,92,231,0.6)"
                e.target.style.boxShadow = "0 0 0 3px rgba(108,92,231,0.1)"
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.1)"
                e.target.style.boxShadow = "none"
              }}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              style={{
                position: "absolute", right: "12px", top: "50%",
                transform: "translateY(-50%)", background: "none",
                border: "none", cursor: "pointer", padding: "2px",
                color: "var(--text-muted)", display: "flex",
                alignItems: "center", transition: "color 150ms ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-secondary)" }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)" }}
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%", padding: "12px",
            background: loading ? "rgba(108,92,231,0.6)" : "var(--accent)",
            color: "#fff", border: "none", borderRadius: "10px",
            fontSize: "14px", fontWeight: 600,
            fontFamily: "DM Sans, sans-serif",
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: "4px",
            transition: "all 150ms ease",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            boxShadow: loading ? "none" : "0 4px 16px rgba(108,92,231,0.35)",
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background = "var(--accent-hover)"
              e.currentTarget.style.transform = "translateY(-1px)"
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(108,92,231,0.45)"
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.background = "var(--accent)"
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(108,92,231,0.35)"
            }
          }}
        >
          {loading && <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />}
          {loading ? "Signing in..." : "Sign in to HotelOS"}
        </button>
      </form>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
