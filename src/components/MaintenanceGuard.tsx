"use client";

import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { usePathname } from "next/navigation";

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    const checkMaintenance = async () => {
      try {
        const res = await fetch("/api/settings/platform");
        if (!res.ok) throw new Error("Failed to fetch settings");
        const data = await res.json();
        if (mounted) {
          setIsMaintenance(data.maintenanceMode === true);
          setLoading(false);
        }
      } catch (error) {
        console.error("Maintenance check failed:", error);
        if (mounted) setLoading(false);
      }
    };

    // Initial check
    checkMaintenance();

    // Poll every 30 seconds
    const interval = setInterval(checkMaintenance, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Let admins access the admin panel even during maintenance
  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  // Prevent showing the UI while checking
  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070d] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
      </div>
    );
  }

  if (isMaintenance) {
    return (
      <div className="min-h-screen bg-[#07070d] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-3xl font-black mb-3">Under Maintenance</h1>
        <p className="text-white/60 max-w-md mx-auto leading-relaxed">
          StudiFy is currently undergoing scheduled maintenance and upgrades. 
          We'll be back online shortly. Thank you for your patience!
        </p>
        <div className="mt-8 flex gap-2 justify-center">
          <div className="w-2 h-2 rounded-full bg-red-500/40 animate-ping" />
          <div className="w-2 h-2 rounded-full bg-red-500/60 animate-ping" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-red-500/80 animate-ping" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
