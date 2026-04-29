"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { signOut } from "@/lib/firebase";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  adminEmail: string;
  adminName: string;
  adminPhoto?: string;
}

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/content", label: "Content", icon: BookOpen },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar({
  collapsed,
  onToggle,
  adminEmail,
  adminName,
  adminPhoto,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/admin/login");
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen bg-[#0a0a0f] border-r border-white/5 transition-all duration-300 ease-in-out shrink-0",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Top glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-5 border-b border-white/5",
          collapsed && "justify-center px-0"
        )}
      >
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <ShieldCheck className="w-5 h-5 text-black" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0a0a0f] animate-pulse" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white leading-none">
              StudiFy
            </p>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-amber-400/70 mt-0.5">
              Admin Panel
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                active
                  ? "bg-amber-500/10 text-amber-400 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.2)]"
                  : "text-white/40 hover:text-white/80 hover:bg-white/5",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon
                className={cn(
                  "w-4.5 h-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                  active ? "text-amber-400" : "text-white/30 group-hover:text-white/60"
                )}
                size={18}
              />
              {!collapsed && <span>{label}</span>}
              {active && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info + sign out */}
      <div className="border-t border-white/5 px-2 py-3 space-y-2">
        {/* User chip */}
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2 bg-white/3",
            collapsed && "justify-center px-0"
          )}
        >
          {adminPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={adminPhoto}
              alt="Admin"
              className="w-7 h-7 rounded-full shrink-0 ring-1 ring-amber-400/40"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-black text-amber-400">
                {adminName?.[0]?.toUpperCase() || "A"}
              </span>
            </div>
          )}
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-white/80 truncate leading-none">
                {adminName}
              </p>
              <p className="text-[9px] text-white/30 truncate mt-0.5">{adminEmail}</p>
            </div>
          )}
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className={cn(
            "group w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut
            className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform duration-200"
            size={16}
          />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0a0a0f] border border-white/10 flex items-center justify-center text-white/30 hover:text-white/70 hover:border-white/30 transition-all duration-200 z-10"
      >
        {collapsed ? (
          <ChevronRight size={12} />
        ) : (
          <ChevronLeft size={12} />
        )}
      </button>
    </aside>
  );
}
