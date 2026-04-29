"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Coins,
  BookOpen,
  Award,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";
import {
  adminGetPlatformStats,
  adminGetTopUsers,
  adminGetRecentTransactions,
  adminGetUserGrowth,
  AdminTransaction,
  DailyGrowth,
} from "@/lib/adminFirebase";
import { UserData } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 hover:bg-white/[0.05] transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        <TrendingUp size={13} className="text-white/10 group-hover:text-white/30 transition-colors" />
      </div>
      <p className="text-2xl font-black text-white tabular-nums">
        {typeof value === "number" ? value.toLocaleString("en-IN") : value}
      </p>
      <p className="text-xs text-white/30 uppercase tracking-[0.2em] mt-1">{label}</p>
      {sub && <p className="text-[10px] text-white/15 mt-1">{sub}</p>}
    </div>
  );
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#0e0e18] border border-white/10 rounded-xl px-3 py-2 text-xs text-white/80">
        <p className="font-bold mb-1">{label}</p>
        <p className="text-amber-400 font-mono">{payload[0].value} users</p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalCoins: number;
    totalQuizzesTaken: number;
    totalBadgesAwarded: number;
  } | null>(null);
  const [topUsers, setTopUsers] = useState<UserData[]>([]);
  const [recentTxns, setRecentTxns] = useState<AdminTransaction[]>([]);
  const [growth, setGrowth] = useState<DailyGrowth[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, tu, rt, g] = await Promise.all([
        adminGetPlatformStats(),
        adminGetTopUsers(5),
        adminGetRecentTransactions(12),
        adminGetUserGrowth(),
      ]);
      setStats(s);
      setTopUsers(tu);
      setRecentTxns(rt);
      setGrowth(g);
    } catch (e) {
      console.error("Admin dashboard error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
          <p className="text-xs text-white/30 uppercase tracking-[0.2em]">Loading data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white">Platform Overview</h2>
          <p className="text-xs text-white/30 mt-0.5">Live data from Firebase</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 text-xs text-white/30 hover:text-white/70 border border-white/8 hover:border-white/20 rounded-xl px-4 py-2 transition-all duration-200"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          color="#f59e0b"
        />
        <StatCard
          label="Coins in Circulation"
          value={stats?.totalCoins ?? 0}
          icon={Coins}
          color="#10b981"
          sub="Across all accounts"
        />
        <StatCard
          label="Quizzes Taken"
          value={stats?.totalQuizzesTaken ?? 0}
          icon={BookOpen}
          color="#6366f1"
        />
        <StatCard
          label="Badges Awarded"
          value={stats?.totalBadgesAwarded ?? 0}
          icon={Award}
          color="#ec4899"
        />
      </div>

      {/* Chart + Top Users */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* User growth chart */}
        <div className="lg:col-span-3 bg-white/[0.03] border border-white/8 rounded-2xl p-5">
          <p className="text-sm font-black text-white mb-1">User Growth</p>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-4">
            New sign-ups — last 7 days
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={growth} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={24}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 leaderboard */}
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/8 rounded-2xl p-5">
          <p className="text-sm font-black text-white mb-1">Top Users</p>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-4">
            By coin balance
          </p>
          <div className="space-y-3">
            {topUsers.map((u, i) => (
              <div key={u.uid} className="flex items-center gap-3">
                <span
                  className="text-[10px] font-black w-5 text-right shrink-0"
                  style={{ color: i === 0 ? "#f59e0b" : i === 1 ? "#9ca3af" : i === 2 ? "#cd7c2f" : "rgba(255,255,255,0.2)" }}
                >
                  #{i + 1}
                </span>
                <div
                  className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/10 flex items-center justify-center shrink-0 text-[10px] font-black text-amber-400"
                >
                  {u.displayName?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white/80 truncate">{u.displayName}</p>
                  <p className="text-[10px] text-white/25 truncate">{u.email}</p>
                </div>
                <span className="text-xs font-black text-amber-400 shrink-0">
                  {(u.coins ?? 0).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
            {topUsers.length === 0 && (
              <p className="text-xs text-white/20 text-center py-4">No users yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-white">Recent Transactions</p>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mt-0.5">
              Platform-wide activity
            </p>
          </div>
        </div>
        <div className="divide-y divide-white/4">
          {recentTxns.length === 0 ? (
            <p className="text-xs text-white/20 text-center py-8">No transactions yet</p>
          ) : (
            recentTxns.map((t) => (
              <div
                key={`${t.userId}-${t.id}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors"
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    t.type === "credit"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {t.type === "credit" ? (
                    <ArrowUpRight size={14} />
                  ) : (
                    <ArrowDownRight size={14} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white/70 truncate">{t.description}</p>
                  <p className="text-[10px] text-white/25 truncate">uid: {t.userId}</p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={`text-xs font-black tabular-nums ${
                      t.type === "credit" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {t.type === "credit" ? "+" : ""}
                    {t.amount}
                  </p>
                  <p className="text-[9px] text-white/20">
                    {t.timestamp?.toDate
                      ? t.timestamp.toDate().toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })
                      : "—"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
