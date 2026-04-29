import {
  collection,
  collectionGroup,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  limit,
  where,
  updateDoc,
  deleteDoc,
  addDoc,
  setDoc,
  getCountFromServer,
  serverTimestamp,
  Timestamp,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";
import { UserData, Badge, QuizQuestion, QuizCategory } from "./types";

// ── USER QUERIES ─────────────────────────────────────────────────────────────

export const adminGetAllUsers = async (
  pageLimit = 20,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{ users: UserData[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> => {
  const ref = collection(db, "users");
  const q = lastDoc
    ? query(ref, orderBy("createdAt", "desc"), startAfter(lastDoc), limit(pageLimit))
    : query(ref, orderBy("createdAt", "desc"), limit(pageLimit));

  const snap = await getDocs(q);
  const users = snap.docs.map((d) => ({ ...d.data(), uid: d.id } as UserData));
  const last = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
  return { users, lastDoc: last };
};

export const adminGetTotalUserCount = async (): Promise<number> => {
  const snap = await getCountFromServer(collection(db, "users"));
  return snap.data().count;
};

export const adminSearchUsersByEmail = async (email: string): Promise<UserData[]> => {
  const ref = collection(db, "users");
  const q = query(ref, where("email", ">=", email), where("email", "<=", email + "\uf8ff"), limit(10));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), uid: d.id } as UserData));
};

export const adminGetUser = async (uid: string): Promise<UserData | null> => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? ({ ...snap.data(), uid: snap.id } as UserData) : null;
};

export const adminUpdateUserCoins = async (uid: string, coins: number): Promise<void> => {
  await updateDoc(doc(db, "users", uid), { coins, updatedAt: serverTimestamp() });
};

export const adminDeleteUser = async (uid: string): Promise<void> => {
  await updateDoc(doc(db, "users", uid), { deleted: true, deletedAt: serverTimestamp() });
};

// ── PLATFORM STATS ───────────────────────────────────────────────────────────

export const adminGetPlatformStats = async (): Promise<{
  totalUsers: number;
  totalCoins: number;
  totalQuizzesTaken: number;
  totalBadgesAwarded: number;
}> => {
  const usersSnap = await getDocs(collection(db, "users"));

  let totalCoins = 0;
  let totalBadgesAwarded = 0;

  usersSnap.docs.forEach((d) => {
    const data = d.data();
    totalCoins += data.coins || 0;
    totalBadgesAwarded += Array.isArray(data.badges) ? data.badges.length : 0;
  });

  let totalQuizzesTaken = 0;
  try {
    const quizzesSnap = await getCountFromServer(collectionGroup(db, "quizResults"));
    totalQuizzesTaken = quizzesSnap.data().count;
  } catch (e) {
    console.error("Error getting quiz count:", e);
  }

  return {
    totalUsers: usersSnap.docs.length,
    totalCoins,
    totalQuizzesTaken,
    totalBadgesAwarded,
  };
};

export const adminGetTopUsers = async (n = 5): Promise<UserData[]> => {
  const ref = collection(db, "users");
  const q = query(ref, orderBy("coins", "desc"), limit(n));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), uid: d.id } as UserData));
};

// ── RECENT ACTIVITY ───────────────────────────────────────────────────────────

export interface AdminTransaction {
  id: string;
  userId: string;
  userDisplayName?: string;
  amount: number;
  description: string;
  type: "credit" | "debit";
  category?: string;
  timestamp: Timestamp;
}

export const adminGetRecentTransactions = async (n = 15): Promise<AdminTransaction[]> => {
  try {
    const q = query(
      collectionGroup(db, "transactions"),
      orderBy("timestamp", "desc"),
      limit(n)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const pathParts = d.ref.path.split("/");
      const userId = pathParts[1]; // users/{uid}/transactions/{id}
      return { id: d.id, userId, ...d.data() } as AdminTransaction;
    });
  } catch {
    return [];
  }
};

// ── QUIZ CONTENT ──────────────────────────────────────────────────────────────

export const adminGetQuizQuestions = async (): Promise<QuizQuestion[]> => {
  const snap = await getDocs(collection(db, "quizQuestions"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as QuizQuestion));
};

export const adminAddQuizQuestion = async (
  question: Omit<QuizQuestion, "id">
): Promise<string> => {
  const ref = await addDoc(collection(db, "quizQuestions"), {
    ...question,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const adminDeleteQuizQuestion = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "quizQuestions", id));
};

// ── BADGE CONTENT ─────────────────────────────────────────────────────────────

export const adminGetBadges = async (): Promise<Badge[]> => {
  const snap = await getDocs(collection(db, "badges"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Badge));
};

export const adminAddBadge = async (badge: Omit<Badge, "id">): Promise<string> => {
  const ref = await addDoc(collection(db, "badges"), {
    ...badge,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const adminDeleteBadge = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "badges", id));
};

// ── PLATFORM SETTINGS ─────────────────────────────────────────────────────────

export interface PlatformSettings {
  welcomeCoins: number;
  dailyBonusBase: number;
  quizCoinsPerCorrect: number;
  maintenanceMode: boolean;
  updatedAt?: Timestamp;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  welcomeCoins: 500,
  dailyBonusBase: 100,
  quizCoinsPerCorrect: 5,
  maintenanceMode: false,
};

export const adminGetSettings = async (): Promise<PlatformSettings> => {
  const snap = await getDoc(doc(db, "settings", "platform"));
  if (snap.exists()) {
    return snap.data() as PlatformSettings;
  }
  return DEFAULT_SETTINGS;
};

export const adminUpdateSettings = async (
  settings: Partial<PlatformSettings>
): Promise<void> => {
  await setDoc(
    doc(db, "settings", "platform"),
    { ...settings, updatedAt: serverTimestamp() },
    { merge: true }
  );
};

// ── USER GROWTH (last 7 days) ──────────────────────────────────────────────────

export interface DailyGrowth {
  date: string;
  count: number;
}

export const adminGetUserGrowth = async (): Promise<DailyGrowth[]> => {
  const snap = await getDocs(collection(db, "users"));
  const counts: Record<string, number> = {};

  // Build last-7-days labels
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    counts[d.toLocaleDateString("en-IN", { month: "short", day: "numeric" })] = 0;
  }

  snap.docs.forEach((d) => {
    const ts: Timestamp | undefined = d.data().createdAt;
    if (!ts) return;
    const dateStr = ts
      .toDate()
      .toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    if (dateStr in counts) counts[dateStr]++;
  });

  return Object.entries(counts).map(([date, count]) => ({ date, count }));
};
