"use client";

import { useEffect, useState } from "react";
import {
  Save,
  RefreshCw,
  Loader,
  Coins,
  Gift,
  Zap,
  ShieldAlert,
  Info,
  Check,
} from "lucide-react";
import {
  adminGetSettings,
  adminUpdateSettings,
  PlatformSettings,
} from "@/lib/adminFirebase";

// ── input row ─────────────────────────────────────────────────────────────────
function SettingRow({
  icon: Icon,
  color,
  label,
  description,
  field,
  value,
  type = "number",
  onChange,
}: {
  icon: React.ElementType;
  color: string;
  label: string;
  description: string;
  field: keyof PlatformSettings;
  value: number | boolean;
  type?: "number" | "toggle";
  onChange: (field: keyof PlatformSettings, val: number | boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-4 border-b border-white/5 last:border-0">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: `${color}18` }}
        >
          <Icon size={16} style={{ color }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white/80">{label}</p>
          <p className="text-[10px] text-white/25 mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="shrink-0">
        {type === "toggle" ? (
          <button
            onClick={() => onChange(field, !value)}
            className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
              value ? "bg-red-500" : "bg-white/10"
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                value ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        ) : (
          <input
            type="number"
            min={0}
            value={value as number}
            onChange={(e) => onChange(field, parseInt(e.target.value) || 0)}
            className="w-28 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono text-right focus:outline-none focus:border-amber-500/40 transition-colors"
          />
        )}
      </div>
    </div>
  );
}

// ── read-only info card ───────────────────────────────────────────────────────
function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25 mb-1">{label}</p>
      <p className="text-xs font-mono text-white/60 break-all">{value}</p>
    </div>
  );
}

// ── main page ──────────────────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [draft, setDraft] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const s = await adminGetSettings();
      setSettings(s);
      setDraft(s);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (field: keyof PlatformSettings, val: number | boolean) => {
    setDraft((d) => d ? { ...d, [field]: val } : d);
  };

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await adminUpdateSettings(draft);
      setSettings(draft);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const isDirty = JSON.stringify(settings) !== JSON.stringify(draft);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
          <p className="text-xs text-white/30 uppercase tracking-[0.2em]">Loading settings…</p>
        </div>
      </div>
    );
  }

  if (!draft) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white">Platform Configuration</h2>
          <p className="text-xs text-white/30 mt-0.5">Changes are written to Firestore immediately</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 border border-white/8 hover:border-white/20 rounded-xl px-3 py-2 transition-all"
          >
            <RefreshCw size={12} /> Reload
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className={`flex items-center gap-2 font-bold rounded-xl px-4 py-2 text-sm transition-all ${
              saved
                ? "bg-emerald-500 text-white"
                : isDirty
                ? "bg-amber-500 hover:bg-amber-400 text-black"
                : "bg-white/5 text-white/20 cursor-not-allowed"
            }`}
          >
            {saving ? (
              <Loader size={14} className="animate-spin" />
            ) : saved ? (
              <Check size={14} />
            ) : (
              <Save size={14} />
            )}
            {saved ? "Saved!" : saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* coin settings */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <p className="text-sm font-black text-white">Economy Settings</p>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mt-0.5">
            Coins awarded at various events
          </p>
        </div>
        <div className="px-5">
          <SettingRow
            icon={Gift}
            color="#10b981"
            label="Welcome Coins"
            description="Coins given to every new user on first sign-up or Google sign-in."
            field="welcomeCoins"
            value={draft.welcomeCoins}
            onChange={handleChange}
          />
          <SettingRow
            icon={Coins}
            color="#f59e0b"
            label="Daily Bonus Base"
            description="Base coins awarded per daily login. Streak multiplier is added on top (Day N = base + (N-1)×5)."
            field="dailyBonusBase"
            value={draft.dailyBonusBase}
            onChange={handleChange}
          />
          <SettingRow
            icon={Zap}
            color="#6366f1"
            label="Quiz Coins per Correct Answer"
            description="How many coins a user earns for each correct answer in a standard quiz."
            field="quizCoinsPerCorrect"
            value={draft.quizCoinsPerCorrect}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* maintenance mode */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <p className="text-sm font-black text-white">Platform Status</p>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mt-0.5">
            Operational flags
          </p>
        </div>
        <div className="px-5">
          <SettingRow
            icon={ShieldAlert}
            color="#ef4444"
            label="Maintenance Mode"
            description="When ON, a maintenance banner can be shown to users. Toggle this flag in your UI components as needed."
            field="maintenanceMode"
            value={draft.maintenanceMode}
            type="toggle"
            onChange={handleChange}
          />
        </div>
      </div>

      {/* last updated */}
      {settings?.updatedAt && (
        <div className="flex items-center gap-2 text-[10px] text-white/20">
          <Info size={11} />
          Last updated:{" "}
          {settings.updatedAt.toDate().toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}

      {/* Firebase project info */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <p className="text-sm font-black text-white">Firebase Project</p>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mt-0.5">
            Read-only connection details
          </p>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard
            label="Project ID"
            value={process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "—"}
          />
          <InfoCard
            label="Auth Domain"
            value={process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "—"}
          />
          <InfoCard
            label="Storage Bucket"
            value={process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "—"}
          />
          <InfoCard
            label="App ID"
            value={process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "—"}
          />
        </div>
      </div>
    </div>
  );
}
