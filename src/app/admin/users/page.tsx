"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Search,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Pencil,
  Check,
  X,
  ShieldAlert,
  Coins,
  Flame,
  Trophy,
  UserCheck,
  UserX,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  adminGetAllUsers,
  adminSearchUsersByEmail,
  adminUpdateUserCoins,
} from "@/lib/adminFirebase";
import { UserData } from "@/lib/types";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

// ─────────────────────────────────────────────────────────────────────────────
// helpers
// ─────────────────────────────────────────────────────────────────────────────
function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider"
      style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}
    >
      {text}
    </span>
  );
}

function formatDate(ts: { toDate?: () => Date } | null | undefined) {
  if (!ts?.toDate) return "—";
  return ts.toDate().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// inline coin editor
// ─────────────────────────────────────────────────────────────────────────────
function CoinEditor({
  uid,
  current,
  onSaved,
}: {
  uid: string;
  current: number;
  onSaved: (newVal: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(current));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 0) return;
    setSaving(true);
    try {
      await adminUpdateUserCoins(uid, parsed);
      onSaved(parsed);
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 text-amber-400 font-black text-sm hover:underline group"
      >
        {current.toLocaleString("en-IN")}
        <Pencil size={10} className="opacity-0 group-hover:opacity-60 transition-opacity" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        autoFocus
        type="number"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="w-24 bg-white/5 border border-amber-500/30 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-amber-500/60"
      />
      <button
        onClick={save}
        disabled={saving}
        className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 flex items-center justify-center transition-colors"
      >
        {saving ? (
          <div className="w-3 h-3 border border-emerald-400/40 border-t-emerald-400 rounded-full animate-spin" />
        ) : (
          <Check size={12} />
        )}
      </button>
      <button
        onClick={() => { setEditing(false); setVal(String(current)); }}
        className="w-6 h-6 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors"
      >
        <X size={12} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// expanded row
// ─────────────────────────────────────────────────────────────────────────────
function UserDetailRow({ user }: { user: UserData }) {
  return (
    <tr>
      <td colSpan={8} className="px-4 pb-4 pt-0">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 mt-1 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">UID</p>
            <p className="text-[10px] text-white/50 font-mono break-all">{user.uid}</p>
          </div>
          <div>
            <p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">Username</p>
            <p className="text-xs text-white/70 font-semibold">@{user.username || "—"}</p>
          </div>
          <div>
            <p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">Login Streak</p>
            <div className="flex items-center gap-1">
              <Flame size={12} className="text-orange-400" />
              <p className="text-xs text-white/70 font-semibold">{user.loginStreak ?? 0} days</p>
            </div>
          </div>
          <div>
            <p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">Total Quizzes</p>
            <div className="flex items-center gap-1">
              <Trophy size={12} className="text-amber-400" />
              <p className="text-xs text-white/70 font-semibold">{user.totalQuizzesTaken ?? 0}</p>
            </div>
          </div>
          <div>
            <p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">Perfect Days</p>
            <p className="text-xs text-white/70 font-semibold">{user.perfectDays ?? 0}</p>
          </div>
          <div>
            <p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">Badges Owned</p>
            <p className="text-xs text-white/70 font-semibold">{user.badges?.length ?? 0}</p>
          </div>
          <div>
            <p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">Joined</p>
            <p className="text-xs text-white/70 font-semibold">{formatDate(user.createdAt)}</p>
          </div>
          <div>
            <p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">Last Bonus</p>
            <p className="text-xs text-white/70 font-semibold">{formatDate(user.lastBonusClaimed)}</p>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// main page
// ─────────────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 15;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [expandedUid, setExpandedUid] = useState<string | null>(null);

  // page stack for prev navigation
  const [pageStack, setPageStack] = useState<
    Array<QueryDocumentSnapshot<DocumentData> | null>
  >([null]);

  const load = useCallback(async (cursor: QueryDocumentSnapshot<DocumentData> | null = null) => {
    setLoading(true);
    try {
      const { users: fetched, lastDoc: ld } = await adminGetAllUsers(PAGE_SIZE, cursor ?? undefined);
      setUsers(fetched);
      setLastDoc(ld);
      setHasMore(fetched.length === PAGE_SIZE);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(null); }, [load]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) { load(null); setPage(1); setPageStack([null]); return; }
    setSearching(true);
    try {
      const results = await adminSearchUsersByEmail(search.trim());
      setUsers(results);
      setHasMore(false);
    } catch (e) { console.error(e); }
    finally { setSearching(false); }
  };

  const nextPage = () => {
    if (!lastDoc) return;
    setPageStack((s) => [...s, lastDoc]);
    setPage((p) => p + 1);
    load(lastDoc);
    setExpandedUid(null);
  };

  const prevPage = () => {
    if (page <= 1) return;
    const newStack = [...pageStack];
    newStack.pop(); // remove current cursor
    const prevCursor = newStack[newStack.length - 1] ?? null;
    setPageStack(newStack);
    setPage((p) => p - 1);
    load(prevCursor);
    setExpandedUid(null);
  };

  const updateCoinInList = (uid: string, coins: number) => {
    setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, coins } : u)));
  };

  return (
    <div className="space-y-5 max-w-7xl">
      {/* toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email…"
              className="w-full bg-white/[0.03] border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-amber-500/40 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
          >
            {searching ? "…" : "Search"}
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(""); load(null); setPage(1); setPageStack([null]); }}
              className="px-3 py-2.5 border border-white/8 hover:border-white/20 text-white/40 hover:text-white/70 rounded-xl text-sm transition-colors"
            >
              Clear
            </button>
          )}
        </form>
        <button
          onClick={() => { load(null); setPage(1); setPageStack([null]); }}
          className="flex items-center gap-2 text-xs text-white/30 hover:text-white/70 border border-white/8 hover:border-white/20 rounded-xl px-4 py-2.5 transition-all"
        >
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      {/* table */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-amber-500/20 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["User", "Email", "Coins", "Streak", "Badges", "Verified", "Joined", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-[0.2em] text-white/25"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {users.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-white/20 text-xs">
                      No users found
                    </td>
                  </tr>
                )}
                {users.map((u) => (
                  <React.Fragment key={u.uid}>
                    <tr
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() =>
                        setExpandedUid(expandedUid === u.uid ? null : u.uid)
                      }
                    >
                      {/* avatar + name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/10 flex items-center justify-center text-xs font-black text-amber-400 shrink-0">
                            {u.displayName?.[0]?.toUpperCase() || "?"}
                          </div>
                          <span className="font-semibold text-white/80 text-xs truncate max-w-[110px]">
                            {u.displayName || "—"}
                          </span>
                        </div>
                      </td>
                      {/* email */}
                      <td className="px-4 py-3 text-xs text-white/40 truncate max-w-[150px]" onClick={(e) => e.stopPropagation()}>
                        {u.email}
                      </td>
                      {/* coins - editable */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <Coins size={12} className="text-amber-400/60 shrink-0" />
                          <CoinEditor
                            uid={u.uid}
                            current={u.coins ?? 0}
                            onSaved={(v) => updateCoinInList(u.uid, v)}
                          />
                        </div>
                      </td>
                      {/* streak */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Flame size={12} className="text-orange-400" />
                          <span className="text-xs text-white/60">{u.loginStreak ?? 0}</span>
                        </div>
                      </td>
                      {/* badges */}
                      <td className="px-4 py-3 text-xs text-white/50">
                        {u.badges?.length ?? 0}
                      </td>
                      {/* email verified */}
                      <td className="px-4 py-3">
                        {u.emailVerified ? (
                          <Badge text="Verified" color="#10b981" />
                        ) : (
                          <Badge text="Unverified" color="#ef4444" />
                        )}
                      </td>
                      {/* joined */}
                      <td className="px-4 py-3 text-[10px] text-white/30">
                        {formatDate(u.createdAt)}
                      </td>
                      {/* expand icon */}
                      <td className="px-4 py-3 text-white/20">
                        {expandedUid === u.uid ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </td>
                    </tr>
                    {expandedUid === u.uid && (
                      <UserDetailRow key={`${u.uid}-detail`} user={u} />
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !search && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <span className="text-[10px] text-white/25">Page {page}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={prevPage}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/30 hover:text-white/60 border border-white/8 hover:border-white/20 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={12} /> Prev
              </button>
              <button
                disabled={!hasMore}
                onClick={nextPage}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/30 hover:text-white/60 border border-white/8 hover:border-white/20 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-[10px] text-white/20">
        <div className="flex items-center gap-1.5">
          <UserCheck size={11} className="text-emerald-400" /> Verified email
        </div>
        <div className="flex items-center gap-1.5">
          <UserX size={11} className="text-red-400" /> Unverified email
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldAlert size={11} className="text-amber-400" /> Click coin to edit
        </div>
      </div>
    </div>
  );
}
