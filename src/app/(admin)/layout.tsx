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
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)", overflow: "hidden" }}>
      <Sidebar />
      <div className="admin-content">
        {children}
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: { fontFamily: '"DM Sans", sans-serif' },
        }}
      />
      <style>{`
        .admin-content {
          flex: 1;
          min-width: 0;
          max-width: 100%;
          display: flex;
          flex-direction: column;
          margin-left: 64px;
          overflow-x: hidden;
          transition: margin-left 220ms cubic-bezier(0.4,0,0.2,1);
          width: calc(100% - 64px);
        }
        @media (max-width: 767px) {
          .admin-content {
            margin-left: 0 !important;
            width: 100vw !important;
            max-width: 100vw !important;
            padding-bottom: 70px;
            overflow-x: hidden !important;
          }
        }
      `}</style>
    </div>
  );
}
