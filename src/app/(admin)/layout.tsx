import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "HotelOS — Hotel Management",
  description: "Professional Hotel Management System",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)" }}>
      <Sidebar />
      <div
        style={{
          flex: 1,
          marginLeft: "var(--sidebar-collapsed)",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          transition: "margin-left var(--transition-slow)",
        }}
      >
        {children}
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: '"DM Sans", sans-serif',
          },
        }}
      />
    </div>
  );
}
