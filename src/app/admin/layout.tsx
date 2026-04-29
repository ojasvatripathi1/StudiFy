"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

const ADMIN_EMAIL = "ojasvatripathi@gmail.com";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return; // let the login page handle itself
    if (loading) return;
    if (!user || user.email !== ADMIN_EMAIL) {
      router.replace("/admin/login");
    }
  }, [user, loading, router, isLoginPage]);

  // On the login page — render children directly (no shell, no guard)
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Checking auth or unauthorized — show spinner then redirect
  if (loading || !user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-amber-500/20" />
            <div className="absolute inset-0 rounded-full border-t-2 border-amber-400 animate-spin" />
          </div>
          <p className="text-white/30 text-xs uppercase tracking-[0.3em]">Verifying access…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#07070d] text-white overflow-hidden">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        adminEmail={user.email || ""}
        adminName={user.displayName || "Admin"}
        adminPhoto={user.photoURL || undefined}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
