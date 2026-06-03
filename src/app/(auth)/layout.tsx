import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In — HotelOS",
  description: "Sign in to your hotel management system",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-base)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Background glow effects */}
      <div style={{
        position: "absolute", top: "-20%", left: "-10%",
        width: "600px", height: "600px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(108,92,231,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-20%", right: "-10%",
        width: "500px", height: "500px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(116,185,255,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Grid pattern overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "56px", height: "56px", borderRadius: "16px",
            background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)",
            marginBottom: "16px",
            boxShadow: "0 8px 32px rgba(108,92,231,0.4)",
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ width: "26px", height: "26px" }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div style={{
            fontSize: "26px", fontWeight: 700, color: "var(--text-primary)",
            letterSpacing: "-0.5px", fontFamily: "DM Sans, sans-serif",
          }}>HotelOS</div>
          <div style={{
            fontSize: "13px", color: "var(--text-muted)",
            marginTop: "4px", fontFamily: "DM Sans, sans-serif",
          }}>Hotel Management System</div>
        </div>

        {children}

        {/* Footer */}
        <div style={{
          textAlign: "center", marginTop: "24px",
          fontSize: "12px", color: "var(--text-muted)",
          fontFamily: "DM Sans, sans-serif",
        }}>
          Having trouble?{" "}
          <a href="mailto:support@hotelos.com" style={{
            color: "var(--accent-light)", textDecoration: "none", fontWeight: 500,
          }}>
            Contact support
          </a>
        </div>
      </div>
    </div>
  )
}
