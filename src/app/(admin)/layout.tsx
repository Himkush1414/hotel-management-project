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
        className="admin-main-content"
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
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
      <style>{`
        .admin-main-content {
          margin-left: var(--sidebar-collapsed);
          transition: margin-left var(--transition-slow);
        }
        @media (max-width: 767px) {
          .admin-main-content {
            margin-left: 0 !important;
            margin-bottom: 60px;
          }
        }
      `}</style>
    </div>
  );
}
