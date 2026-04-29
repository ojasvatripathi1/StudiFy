"use client";

import { usePathname } from "next/navigation";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

const SECTION_LABELS: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "Dashboard", subtitle: "Platform overview & real-time stats" },
  "/admin/users": { title: "User Management", subtitle: "Browse, search, and manage all users" },
  "/admin/content": { title: "Content Management", subtitle: "Manage quiz questions & badges" },
  "/admin/settings": { title: "Platform Settings", subtitle: "Configure global platform parameters" },
};

export default function AdminHeader() {
  const pathname = usePathname();
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Match the most-specific route first
  const section =
    SECTION_LABELS[pathname] ||
    Object.entries(SECTION_LABELS)
      .filter(([k]) => k !== "/admin" && pathname.startsWith(k))
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ||
    SECTION_LABELS["/admin"];

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="h-16 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0">
      {/* Left: section title */}
      <div>
        <h1 className="text-base font-black text-white tracking-tight leading-none">
          {section.title}
        </h1>
        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mt-0.5">
          {section.subtitle}
        </p>
      </div>

      {/* Right: date + clock */}
      <div className="flex items-center gap-2 text-white/30">
        <Clock size={13} />
        <span className="text-[11px] font-mono">
          {today} · {time}
        </span>
      </div>
    </header>
  );
}
