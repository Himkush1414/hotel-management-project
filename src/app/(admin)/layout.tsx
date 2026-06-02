import { Sidebar } from "@/components/layout/Sidebar"
import { Toaster } from "sonner"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#0a0a0f" }}>
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0, paddingLeft: 88 }}>
        <div style={{ minHeight: "100vh", padding: "28px 32px" }}>
          {children}
        </div>
      </main>
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "rgba(20,20,30,0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#e8e8f0",
            borderRadius: 12,
          },
        }}
      />
    </div>
  )
}
