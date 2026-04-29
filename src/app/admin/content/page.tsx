"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Award,
  Plus,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X,
  Loader,
} from "lucide-react";
import {
  adminGetQuizQuestions,
  adminAddQuizQuestion,
  adminDeleteQuizQuestion,
  adminGetBadges,
  adminAddBadge,
  adminDeleteBadge,
} from "@/lib/adminFirebase";
import { QuizQuestion, Badge, QuizCategory } from "@/lib/types";

// ── helpers ───────────────────────────────────────────────────────────────────
const CATEGORIES: QuizCategory[] = [
  "ds_algo","database","os","networks","math","aptitude",
  "grammar","programming","physics","chemistry","biology",
  "history","geography","literature","general_knowledge",
];

const DIFFICULTIES = ["easy", "medium", "hard"] as const;

function SectionHeader({
  icon: Icon,
  title,
  count,
  color,
  open,
  onToggle,
}: {
  icon: React.ElementType;
  title: string;
  count: number;
  color: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <div className="text-left">
          <p className="text-sm font-black text-white">{title}</p>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mt-0.5">{count} items</p>
        </div>
      </div>
      {open ? <ChevronUp size={16} className="text-white/30" /> : <ChevronDown size={16} className="text-white/30" />}
    </button>
  );
}

// ── Quiz Questions section ─────────────────────────────────────────────────────
function QuizSection() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(true);
  const [filterCat, setFilterCat] = useState<QuizCategory | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // form state
  const [form, setForm] = useState({
    category: "math" as QuizCategory,
    difficulty: "easy" as typeof DIFFICULTIES[number],
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    points: 5,
    hint: "",
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setQuestions(await adminGetQuizQuestions()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = filterCat === "all"
    ? questions
    : questions.filter((q) => q.category === filterCat);

  // grouped count by category
  const grouped: Partial<Record<QuizCategory, number>> = {};
  questions.forEach((q) => {
    if (q.category && q.category !== "custom") {
      grouped[q.category as QuizCategory] = (grouped[q.category as QuizCategory] || 0) + 1;
    }
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question.trim() || form.options.some((o) => !o.trim())) return;
    setSaving(true);
    try {
      await adminAddQuizQuestion({
        category: form.category,
        difficulty: form.difficulty,
        question: form.question.trim(),
        options: form.options.map((o) => o.trim()),
        correctAnswer: form.correctAnswer,
        points: form.points,
        hint: form.hint.trim() || undefined,
      });
      setShowForm(false);
      setForm({ category: "math", difficulty: "easy", question: "", options: ["","","",""], correctAnswer: 0, points: 5, hint: "" });
      await load();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    setDeleting(id);
    try { await adminDeleteQuizQuestion(id); setQuestions((prev) => prev.filter((q) => q.id !== id)); }
    catch (e) { console.error(e); }
    finally { setDeleting(null); }
  };

  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
      <SectionHeader
        icon={BookOpen}
        title="Quiz Questions"
        count={questions.length}
        color="#6366f1"
        open={open}
        onToggle={() => setOpen((v) => !v)}
      />
      {open && (
        <div className="border-t border-white/5">
          {/* toolbar */}
          <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-white/5">
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value as QuizCategory | "all")}
              className="bg-white/[0.04] border border-white/8 rounded-xl text-xs text-white/60 px-3 py-1.5 focus:outline-none focus:border-white/20 cursor-pointer"
            >
              <option value="all">All Categories ({questions.length})</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, " ")} ({grouped[c] || 0})
                </option>
              ))}
            </select>
            <div className="ml-auto flex gap-2">
              <button
                onClick={load}
                className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 border border-white/8 hover:border-white/20 rounded-xl px-3 py-1.5 transition-all"
              >
                <RefreshCw size={12} /> Refresh
              </button>
              <button
                onClick={() => setShowForm((v) => !v)}
                className="flex items-center gap-1.5 text-xs bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl px-3 py-1.5 transition-colors"
              >
                {showForm ? <X size={12} /> : <Plus size={12} />}
                {showForm ? "Cancel" : "Add Question"}
              </button>
            </div>
          </div>

          {/* Add form */}
          {showForm && (
            <form
              onSubmit={handleAdd}
              className="px-5 py-4 border-b border-white/5 bg-indigo-500/5 space-y-3"
            >
              <p className="text-xs font-black text-indigo-300 uppercase tracking-[0.2em]">New Question</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[9px] text-white/30 uppercase tracking-widest block mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as QuizCategory }))}
                    className="w-full bg-white/[0.04] border border-white/8 rounded-xl text-xs text-white/70 px-3 py-2 focus:outline-none focus:border-indigo-500/50"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-white/30 uppercase tracking-widest block mb-1">Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value as typeof DIFFICULTIES[number] }))}
                    className="w-full bg-white/[0.04] border border-white/8 rounded-xl text-xs text-white/70 px-3 py-2 focus:outline-none focus:border-indigo-500/50"
                  >
                    {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-white/30 uppercase tracking-widest block mb-1">Points</label>
                  <input
                    type="number"
                    min={1}
                    value={form.points}
                    onChange={(e) => setForm((f) => ({ ...f, points: parseInt(e.target.value) || 5 }))}
                    className="w-full bg-white/[0.04] border border-white/8 rounded-xl text-xs text-white/70 px-3 py-2 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-[9px] text-white/30 uppercase tracking-widest block mb-1">Question</label>
                <textarea
                  required
                  rows={2}
                  value={form.question}
                  onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                  placeholder="Enter the question…"
                  className="w-full bg-white/[0.04] border border-white/8 rounded-xl text-xs text-white/70 px-3 py-2 focus:outline-none focus:border-indigo-500/50 resize-none placeholder-white/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {form.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct"
                      checked={form.correctAnswer === i}
                      onChange={() => setForm((f) => ({ ...f, correctAnswer: i }))}
                      className="accent-indigo-400"
                    />
                    <input
                      required
                      value={opt}
                      onChange={(e) => {
                        const opts = [...form.options];
                        opts[i] = e.target.value;
                        setForm((f) => ({ ...f, options: opts }));
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      className="flex-1 bg-white/[0.04] border border-white/8 rounded-xl text-xs text-white/70 px-3 py-2 focus:outline-none focus:border-indigo-500/50 placeholder-white/20"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-[9px] text-white/30 uppercase tracking-widest block mb-1">Hint (optional)</label>
                <input
                  value={form.hint}
                  onChange={(e) => setForm((f) => ({ ...f, hint: e.target.value }))}
                  placeholder="Hint shown when user gives wrong answer…"
                  className="w-full bg-white/[0.04] border border-white/8 rounded-xl text-xs text-white/70 px-3 py-2 focus:outline-none focus:border-indigo-500/50 placeholder-white/20"
                />
              </div>
              <div className="text-[10px] text-white/25">
                ● Select the radio button next to the correct answer.
              </div>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl px-4 py-2 text-xs transition-colors disabled:opacity-50"
              >
                {saving ? <Loader size={12} className="animate-spin" /> : <Plus size={12} />}
                {saving ? "Saving…" : "Add Question"}
              </button>
            </form>
          )}

          {/* list */}
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04] max-h-[480px] overflow-y-auto">
              {filtered.length === 0 && (
                <p className="text-center text-white/20 text-xs py-10">No questions in this category</p>
              )}
              {filtered.map((q) => (
                <div key={q.id} className="flex items-start gap-3 px-5 py-3 hover:bg-white/[0.02] group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400/70 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                        {String(q.category).replace(/_/g, " ")}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/20 bg-white/5 px-2 py-0.5 rounded-md">
                        {q.difficulty}
                      </span>
                      <span className="text-[9px] text-amber-400/60">{q.points} pts</span>
                    </div>
                    <p className="text-xs text-white/70 font-medium line-clamp-2">{q.question}</p>
                    <div className="flex flex-wrap gap-x-4 mt-1">
                      {q.options.map((o, i) => (
                        <span
                          key={i}
                          className={`text-[10px] ${i === q.correctAnswer ? "text-emerald-400 font-bold" : "text-white/25"}`}
                        >
                          {String.fromCharCode(65 + i)}) {o}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(q.id)}
                    disabled={deleting === q.id}
                    className="shrink-0 w-7 h-7 rounded-xl bg-red-500/0 hover:bg-red-500/10 text-white/10 hover:text-red-400 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  >
                    {deleting === q.id ? <Loader size={12} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Badge section ─────────────────────────────────────────────────────────────
const BADGE_ICONS = ["award","star","zap","flame","shield","crown","gem","trophy"] as const;
const BADGE_COLORS = ["#f59e0b","#10b981","#6366f1","#ec4899","#ef4444","#3b82f6","#8b5cf6","#f97316"];

function BadgeSection() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    icon: BADGE_ICONS[0],
    color: BADGE_COLORS[0],
    price: 0,
  });

  const load = async () => {
    setLoading(true);
    try { setBadges(await adminGetBadges()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await adminAddBadge({
        name: form.name.trim(),
        description: form.description.trim(),
        icon: form.icon,
        color: form.color,
        price: form.price,
      });
      setShowForm(false);
      setForm({ name: "", description: "", icon: BADGE_ICONS[0], color: BADGE_COLORS[0], price: 0 });
      await load();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this badge?")) return;
    setDeleting(id);
    try { await adminDeleteBadge(id); setBadges((prev) => prev.filter((b) => b.id !== id)); }
    catch (e) { console.error(e); }
    finally { setDeleting(null); }
  };

  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
      <SectionHeader
        icon={Award}
        title="Badges"
        count={badges.length}
        color="#ec4899"
        open={open}
        onToggle={() => setOpen((v) => !v)}
      />
      {open && (
        <div className="border-t border-white/5">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
            <button onClick={load} className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 border border-white/8 hover:border-white/20 rounded-xl px-3 py-1.5 transition-all">
              <RefreshCw size={12} /> Refresh
            </button>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="ml-auto flex items-center gap-1.5 text-xs bg-pink-500 hover:bg-pink-400 text-white font-bold rounded-xl px-3 py-1.5 transition-colors"
            >
              {showForm ? <X size={12} /> : <Plus size={12} />}
              {showForm ? "Cancel" : "Add Badge"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAdd} className="px-5 py-4 border-b border-white/5 bg-pink-500/5 space-y-3">
              <p className="text-xs font-black text-pink-300 uppercase tracking-[0.2em]">New Badge</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-white/30 uppercase tracking-widest block mb-1">Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Badge name…"
                    className="w-full bg-white/[0.04] border border-white/8 rounded-xl text-xs text-white/70 px-3 py-2 focus:outline-none focus:border-pink-500/50 placeholder-white/20"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-white/30 uppercase tracking-widest block mb-1">Price (coins)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-white/[0.04] border border-white/8 rounded-xl text-xs text-white/70 px-3 py-2 focus:outline-none focus:border-pink-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-[9px] text-white/30 uppercase tracking-widest block mb-1">Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Short description…"
                  className="w-full bg-white/[0.04] border border-white/8 rounded-xl text-xs text-white/70 px-3 py-2 focus:outline-none focus:border-pink-500/50 placeholder-white/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-white/30 uppercase tracking-widest block mb-1">Icon</label>
                  <select
                    value={form.icon}
                    onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/8 rounded-xl text-xs text-white/70 px-3 py-2 focus:outline-none"
                  >
                    {BADGE_ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-white/30 uppercase tracking-widest block mb-1">Color</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {BADGE_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, color: c }))}
                        className="w-6 h-6 rounded-full border-2 transition-all"
                        style={{
                          background: c,
                          borderColor: form.color === c ? "white" : "transparent",
                          boxShadow: form.color === c ? `0 0 8px ${c}60` : "none",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <button type="submit" disabled={saving} className="flex items-center gap-2 bg-pink-500 hover:bg-pink-400 text-white font-bold rounded-xl px-4 py-2 text-xs transition-colors disabled:opacity-50">
                {saving ? <Loader size={12} className="animate-spin" /> : <Plus size={12} />}
                {saving ? "Saving…" : "Add Badge"}
              </button>
            </form>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-pink-500/20 border-t-pink-400 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04] max-h-[400px] overflow-y-auto">
              {badges.length === 0 && (
                <p className="text-center text-white/20 text-xs py-10">No badges yet</p>
              )}
              {badges.map((b) => (
                <div key={b.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] group">
                  <div
                    className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-lg"
                    style={{ background: `${b.color}18`, border: `1px solid ${b.color}20` }}
                  >
                    🏅
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-white/80">{b.name}</p>
                      {b.price ? (
                        <span className="text-[9px] text-amber-400/60 font-black">{b.price} coins</span>
                      ) : (
                        <span className="text-[9px] text-emerald-400/50 font-black">Free</span>
                      )}
                    </div>
                    <p className="text-[10px] text-white/30 truncate">{b.description}</p>
                  </div>
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: b.color }} />
                  <button
                    onClick={() => handleDelete(b.id)}
                    disabled={deleting === b.id}
                    className="shrink-0 w-7 h-7 rounded-xl bg-red-500/0 hover:bg-red-500/10 text-white/10 hover:text-red-400 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  >
                    {deleting === b.id ? <Loader size={12} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminContentPage() {
  return (
    <div className="space-y-5 max-w-5xl">
      <QuizSection />
      <BadgeSection />
    </div>
  );
}
