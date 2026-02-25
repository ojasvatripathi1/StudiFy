import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
  User
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  writeBatch,
  serverTimestamp,
  Timestamp,
  where,
  addDoc,
  updateDoc,
  arrayUnion,
  deleteDoc,
  runTransaction,
  getCountFromServer,
  FieldValue
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { UserData, Transaction, QuizQuestion, QuizResult, Notification, Badge, QuizCategory, LeaderboardEntry } from './types';
import { DEFAULT_AVATAR } from './avatarUtils';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock_key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock_domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock_project_id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock_storage_bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "mock_sender_id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "mock_app_id",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


// --- AUTH FUNCTIONS ---

export const signUp = async (email: string, password: string, displayName: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Send email verification
  await sendEmailVerification(user);

  // Update profile with display name
  await updateProfile(user, { displayName });

  // Set persistence for the auth session
  await setPersistence(auth, browserLocalPersistence);

  // Create user document in Firestore
  const userRef = doc(db, "users", user.uid);
  const initialUserData: Omit<UserData, 'uid' | 'email'> = {
    displayName: displayName,
    username: "", // To be set by user on profile page
    avatarUrl: DEFAULT_AVATAR, // Default avatar
    coins: 500, // Onboarding credit
    lastBonusClaimed: null,
    loginStreak: 0,
    lastLoginDate: null,
    quizStreaks: {
      ds_algo: 0,
      database: 0,
      os: 0,
      networks: 0,
      math: 0,
      aptitude: 0,
      grammar: 0,
      programming: 0,
      physics: 0,
      chemistry: 0,
      biology: 0,
      history: 0,
      geography: 0,
      literature: 0,
      general_knowledge: 0
    },
    lastQuizDates: {
      ds_algo: null,
      database: null,
      os: null,
      networks: null,
      math: null,
      aptitude: null,
      grammar: null,
      programming: null,
      physics: null,
      chemistry: null,
      biology: null,
      history: null,
      geography: null,
      literature: null,
      general_knowledge: null
    },
    badges: [],
    totalQuizCorrect: {
      ds_algo: 0,
      database: 0,
      os: 0,
      networks: 0,
      math: 0,
      aptitude: 0,
      grammar: 0,
      programming: 0,
      physics: 0,
      chemistry: 0,
      biology: 0,
      history: 0,
      geography: 0,
      literature: 0,
      general_knowledge: 0
    },
    perfectDays: 0,
    perfectWeeks: 0,
    perfectMonths: 0,
    totalQuizzesTaken: 0,
    emailVerified: false,
    createdAt: serverTimestamp() as Timestamp,
  };
  await setDoc(userRef, { ...initialUserData, email: user.email, uid: user.uid });

  // Add initial transaction
  const transactionRef = doc(collection(db, `users/${user.uid}/transactions`));
  const initialTransaction: Omit<Transaction, 'id'> = {
    amount: 500,
    description: "Welcome bonus for joining StudiFy!",
    timestamp: serverTimestamp() as Timestamp,
    type: 'credit',
    category: 'welcome'
  };
  await setDoc(transactionRef, initialTransaction);

  return userCredential;
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();

  // Add these scopes if you need additional permissions
  provider.addScope('profile');
  provider.addScope('email');

  // Set the authentication persistence
  await setPersistence(auth, browserLocalPersistence);

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user is new
    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (!userDoc.exists()) {
      // New user - create user document with initial data
      const userData = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Anonymous',
        username: "", // To be set by user on profile page
        avatarUrl: "/3d_avatar_studify/1.png", // Default avatar
        coins: 500, // Initial bonus
        lastBonusClaimed: null,
        loginStreak: 0,
        lastLoginDate: serverTimestamp(),
        quizStreaks: { ds_algo: 0, database: 0, os: 0, networks: 0 },
        lastQuizDates: { ds_algo: null, database: null, os: null, networks: null },
        badges: [],
        totalQuizCorrect: { ds_algo: 0, database: 0, os: 0, networks: 0 },
        perfectDays: 0,
        perfectWeeks: 0,
        perfectMonths: 0,
        totalQuizzesTaken: 0,
        emailVerified: user.emailVerified,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      // Add welcome notification
      await addDoc(collection(db, 'users', user.uid, 'notifications'), {
        type: 'welcome',
        message: 'Welcome to StudiFy! You received 500 coins as a welcome bonus.',
        read: false,
        createdAt: serverTimestamp()
      });

      // Add welcome transaction
      const transactionRef = doc(collection(db, `users/${user.uid}/transactions`));
      await setDoc(transactionRef, {
        amount: 500,
        description: 'Welcome bonus for joining StudiFy!',
        timestamp: serverTimestamp(),
        type: 'credit',
        category: 'welcome'
      });
    } else {
      // Update emailVerified status in Firestore if it changed
      await updateDoc(doc(db, 'users', user.uid), {
        emailVerified: user.emailVerified,
        updatedAt: serverTimestamp()
      });
    }

    return user;
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    // More specific error handling
    if (firebaseError.code === 'auth/unauthorized-domain') {
      console.error("Error signing in with Google:", error);
      throw new Error('This domain is not authorized for OAuth operations. Please contact support.');
    } else if (firebaseError.code === 'auth/popup-closed-by-user') {
      // Don't log to console.error as this is a user-initiated action
      console.log('Google Sign In: Popup closed by user');
      throw new Error('The sign-in popup was closed before completing the sign-in process.');
    } else if (firebaseError.code === 'auth/account-exists-with-different-credential') {
      console.error("Error signing in with Google:", error);
      throw new Error('An account already exists with the same email but different sign-in credentials.');
    } else {
      console.error("Error signing in with Google:", error);
      throw new Error(firebaseError.message || 'Failed to sign in with Google. Please try again.');
    }
  }
};

export const signIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signOut = () => {
  return firebaseSignOut(auth);
};

export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return firebaseOnAuthStateChanged(auth, callback);
};

// --- FIRESTORE FUNCTIONS ---

export const getUserData = async (uid: string): Promise<UserData | null> => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data() as UserData;
  }
  return null;
};

/**
 * Update basic user profile info (displayName, username, bio) with unique username enforcement.
 * Stores username in both the user doc and a separate `usernames` collection for uniqueness.
 */
export const updateUserProfile = async (
  uid: string,
  updates: { displayName: string; username: string; bio?: string; avatarUrl?: string }
) => {
  const desiredUsername = updates.username.trim().toLowerCase();
  if (!desiredUsername || !/^[a-z0-9_\.]{3,20}$/.test(desiredUsername)) {
    throw new Error(
      "Username must be 3-20 characters and can contain lowercase letters, numbers, underscores and dots."
    );
  }

  const userRef = doc(db, "users", uid);
  const usernameRef = doc(db, "usernames", desiredUsername);

  await runTransaction(db, async (tx) => {
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists()) {
      throw new Error("User not found");
    }

    const userData = userSnap.data() as UserData;
    const currentUsername = userData.username?.toLowerCase();

    // If username is changing, enforce uniqueness via `usernames` collection
    if (currentUsername !== desiredUsername) {
      const usernameSnap = await tx.get(usernameRef);
      if (usernameSnap.exists() && usernameSnap.data()?.uid !== uid) {
        throw new Error("This username is already taken. Please choose another.");
      }

      // Remove old mapping if present
      if (currentUsername && currentUsername !== desiredUsername) {
        const oldRef = doc(db, "usernames", currentUsername);
        tx.delete(oldRef);
      }

      // Set new mapping
      tx.set(usernameRef, {
        uid,
        createdAt: serverTimestamp(),
      });
    }

    tx.update(userRef, {
      displayName: updates.displayName.trim(),
      username: desiredUsername,
      bio: updates.bio?.trim() || "",
      avatarUrl: updates.avatarUrl || userData.avatarUrl || "",
      updatedAt: serverTimestamp(),
    });
  });
};

export const getLeaderboard = async (userLimit: number = 10): Promise<UserData[]> => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("coins", "desc"), limit(userLimit));
    const querySnapshot = await getDocs(q);

    // Deduplicate users by uid to prevent duplicate keys
    const users = querySnapshot.docs.map(doc => doc.data() as UserData);
    const uniqueUsers = users.filter((user, index, self) =>
      index === self.findIndex(u => u.uid === user.uid)
    );

    return uniqueUsers;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
};

export const getUserRank = async (uid: string, coins?: number): Promise<number> => {
  try {
    let userCoins = coins;
    
    if (userCoins === undefined) {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) return 0;
      
      const userData = userSnap.data() as UserData;
      userCoins = userData.coins || 0;
    }
    
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("coins", ">", userCoins));
    const snapshot = await getCountFromServer(q);
    
    return snapshot.data().count + 1;
  } catch (error) {
    console.error("Error fetching user rank:", error);
    return 0;
  }
};

export const getTransactions = async (uid: string): Promise<Transaction[]> => {
  try {
    const transactionsRef = collection(db, `users/${uid}/transactions`);
    const q = query(transactionsRef, orderBy("timestamp", "desc"), limit(20));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};

export const claimDailyBonus = async (uid: string) => {
  const batch = writeBatch(db);
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) throw new Error("User not found");
  const userData = userSnap.data() as UserData;

  // Calculate streak and bonus amount
  const today = new Date();
  const lastLogin = userData.lastLoginDate?.toDate();
  let newStreak = 1;

  if (lastLogin) {
    const daysDiff = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff === 1) {
      newStreak = userData.loginStreak + 1;
    } else if (daysDiff > 1) {
      // Streak broken, apply penalty
      await applyPenalty(uid, 'missed_login', userData.loginStreak * 5);
      newStreak = 1;
    }
  }

  const bonusAmount = 100 + (newStreak - 1) * 5; // Day 1: 100, Day 2: 105, etc.

  batch.update(userRef, {
    coins: userData.coins + bonusAmount,
    lastBonusClaimed: serverTimestamp(),
    loginStreak: newStreak,
    lastLoginDate: serverTimestamp()
  });

  const transactionRef = doc(collection(db, `users/${uid}/transactions`));
  const newTransaction: Omit<Transaction, 'id'> = {
    amount: bonusAmount,
    description: `Daily login bonus (${newStreak} day streak)`,
    timestamp: serverTimestamp() as Timestamp,
    type: 'credit',
    category: 'bonus'
  };
  batch.set(transactionRef, newTransaction);

  await batch.commit();

  // Check for streak badges
  await checkAndAwardBadges(uid, 'streak', newStreak, 'login');
};

export const updateUserCoinsAfterQuiz = async (uid: string, coinsEarned: number) => {
  if (coinsEarned <= 0) return;

  const batch = writeBatch(db);
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) throw new Error("User not found");
  const userData = userSnap.data() as UserData;

  batch.update(userRef, {
    coins: userData.coins + coinsEarned,
  });

  const transactionRef = doc(collection(db, `users/${uid}/transactions`));
  const newTransaction: Omit<Transaction, 'id'> = {
    amount: coinsEarned,
    description: `Daily quiz reward`,
    timestamp: serverTimestamp() as Timestamp,
    type: 'credit',
    category: 'quiz'
  };
  batch.set(transactionRef, newTransaction);

  await batch.commit();
}

// --- QUIZ FUNCTIONS ---

export const getQuizQuestions = async (category: QuizCategory): Promise<QuizQuestion[]> => {
  try {
    const questionsRef = collection(db, 'quizQuestions');
    const q = query(questionsRef, where('category', '==', category), limit(15));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.docs.length > 0) {
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizQuestion));
    }
  } catch (error) {
    console.warn('Firebase quiz questions unavailable, using mock data:', error);
  }

  // Fallback to mock questions for development/testing
  const { getMockQuestions } = await import('./mockQuestions');
  return getMockQuestions(category);
};

export const submitQuizResult = async (uid: string, category: QuizCategory, questions: QuizQuestion[], userAnswers: number[]) => {
  const correctAnswers = userAnswers.filter((answer, index) => answer === questions[index].correctAnswer).length;
  const score = (correctAnswers / questions.length) * 100;
  
  // Check for active multiplier booster
  let coinsEarned = correctAnswers * 5; // Base: 5 coins per correct answer
  try {
    const { getActiveMultiplier, consumeBooster } = await import('./shopFirebase');
    const activeMultiplier = await getActiveMultiplier(uid);
    if (activeMultiplier && activeMultiplier.multiplier > 1) {
      coinsEarned = Math.floor(coinsEarned * activeMultiplier.multiplier);
      // Use one charge of the multiplier
      await consumeBooster(uid, activeMultiplier.purchaseId);
    }
  } catch (error) {
    console.error('Error checking multiplier:', error);
    // Continue with base coins if multiplier check fails
  }

  const batch = writeBatch(db);
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  let userData: UserData;

  if (!userSnap.exists()) {
    // Create user document if it doesn't exist
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("User not authenticated");

    const initialUserData: Omit<UserData, 'uid' | 'email'> = {
      displayName: currentUser.displayName || 'User',
      username: "",
      avatarUrl: "/3d_avatar_studify/1.png", // Default avatar
      coins: 500,
      lastBonusClaimed: null,
      loginStreak: 0,
      lastLoginDate: null,
      quizStreaks: { 
        ds_algo: 0, database: 0, os: 0, networks: 0,
        math: 0, aptitude: 0, grammar: 0, programming: 0,
        physics: 0, chemistry: 0, biology: 0, history: 0, geography: 0, literature: 0, general_knowledge: 0
      },
      lastQuizDates: { 
        ds_algo: null, database: null, os: null, networks: null,
        math: null, aptitude: null, grammar: null, programming: null,
        physics: null, chemistry: null, biology: null, history: null, geography: null, literature: null, general_knowledge: null
      },
      badges: [],
      totalQuizCorrect: { 
        ds_algo: 0, database: 0, os: 0, networks: 0,
        math: 0, aptitude: 0, grammar: 0, programming: 0,
        physics: 0, chemistry: 0, biology: 0, history: 0, geography: 0, literature: 0, general_knowledge: 0
      },
      perfectDays: 0,
      perfectWeeks: 0,
      perfectMonths: 0,
      totalQuizzesTaken: 0,
      createdAt: serverTimestamp() as Timestamp,
    };

    userData = { ...initialUserData, email: currentUser.email || '', uid: currentUser.uid } as UserData;
    batch.set(userRef, userData);

    // Add welcome transaction
    const welcomeTransactionRef = doc(collection(db, `users/${uid}/transactions`));
    const welcomeTransaction: Omit<Transaction, 'id'> = {
      amount: 500,
      description: "Welcome bonus for joining StudiFy!",
      timestamp: serverTimestamp() as Timestamp,
      type: 'credit',
      category: 'welcome'
    };
    batch.set(welcomeTransactionRef, welcomeTransaction);
  } else {
    userData = userSnap.data() as UserData;
  }

  // Calculate quiz streak
  const today = new Date();
  const lastQuizDate = userData.lastQuizDates?.[category]?.toDate();
  let newStreak = 1;

  if (lastQuizDate) {
    const daysDiff = Math.floor((today.getTime() - lastQuizDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff === 0) {
      newStreak = userData.quizStreaks?.[category] || 1;
    } else if (daysDiff === 1) {
      const streak = userData.quizStreaks?.[category];
      newStreak = (streak || 0) + 1;
    } else if (daysDiff > 1) {
      // Apply penalty for missed quiz
      const streak = userData.quizStreaks?.[category];
      await applyPenalty(uid, 'missed_quiz', (streak || 0) * 2);
      newStreak = 1;
    }
  }

  // Update user data
  const currentTotal = userData.totalQuizCorrect?.[category];
  const updates: Record<string, number | FieldValue> = {
    coins: userData.coins + coinsEarned,
    [`quizStreaks.${category}`]: newStreak,
    [`lastQuizDates.${category}`]: serverTimestamp(),
    [`totalQuizCorrect.${category}`]: (currentTotal || 0) + correctAnswers
  };

  // Check for perfect day (all categories completed with 100% score)
  if (score === 100) {
    const allCategoriesCompleted = await checkAllCategoriesCompletedToday(uid);
    if (allCategoriesCompleted) {
      updates.perfectDays = userData.perfectDays + 1;
    }
  }

  batch.update(userRef, updates);

  // Add transaction
  const transactionRef = doc(collection(db, `users/${uid}/transactions`));
  const newTransaction: Omit<Transaction, 'id'> = {
    amount: coinsEarned,
    description: `${category} quiz: ${correctAnswers}/${questions.length} correct`,
    timestamp: serverTimestamp() as Timestamp,
    type: 'credit',
    category: 'quiz'
  };
  batch.set(transactionRef, newTransaction);

  // Save quiz result
  const quizResultRef = doc(collection(db, `users/${uid}/quizResults`));
  const quizResult: Omit<QuizResult, 'id'> = {
    userId: uid,
    category,
    score,
    totalQuestions: questions.length,
    correctAnswers,
    coinsEarned,
    timestamp: serverTimestamp() as Timestamp,
    questions,
    userAnswers
  };
  batch.set(quizResultRef, quizResult);

  await batch.commit();

  // Check for badges
  await checkAndAwardBadges(uid, 'streak', newStreak, category);
  if (score === 100) {
    await checkAndAwardBadges(uid, 'perfect_score', 1, category);
  }

  return { score, coinsEarned, correctAnswers };
};

// --- BADGE FUNCTIONS ---

export const getBadges = async (): Promise<Badge[]> => {
  try {
    const badgesRef = collection(db, 'badges');
    const querySnapshot = await getDocs(badgesRef);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Ensure we have all required fields with proper types
      return {
        id: doc.id,
        name: data.name || 'Unnamed Badge',
        description: data.description || '',
        price: data.price || 0,
        icon: data.icon || 'award',
        color: data.color || 'gray',
        ...(data.requirement && { requirement: data.requirement })
      } as Badge;
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return [];
  }
};

export const purchaseBadge = async (uid: string, badgeId: string) => {
  try {
    const batch = writeBatch(db);
    const userRef = doc(db, "users", uid);
    const badgeRef = doc(db, "badges", badgeId);

    const [userSnap, badgeSnap] = await Promise.all([getDoc(userRef), getDoc(badgeRef)]);

    if (!userSnap.exists()) throw new Error("User not found");
    if (!badgeSnap.exists()) throw new Error("Badge not found");

    const userData = userSnap.data() as UserData;
    const badge = badgeSnap.data() as Badge;

    // Validate user data structure
    if (!userData || typeof userData !== 'object') throw new Error("Invalid user data");
    if (typeof userData.coins !== 'number' || userData.coins < 0) throw new Error("Invalid user coin balance");

    // Validate badge data structure
    if (!badge || typeof badge !== 'object') throw new Error("Invalid badge data");
    if (!badge.id || typeof badge.id !== 'string') throw new Error("Invalid badge ID");

    // Ensure badges array exists and is valid
    if (!userData.badges || !Array.isArray(userData.badges)) {
      userData.badges = [];
    }

    // Validate that badges array contains only strings
    if (!userData.badges.every(id => typeof id === 'string')) {
      userData.badges = userData.badges.filter(id => typeof id === 'string');
    }

    if (!badge.price || typeof badge.price !== 'number' || badge.price <= 0) throw new Error("Badge is not purchasable");
    if (userData.coins < badge.price) throw new Error("Insufficient coins");
    if (!userData.badges || userData.badges.includes(badgeId)) throw new Error("Badge already owned");

    batch.update(userRef, {
      coins: userData.coins - badge.price,
      badges: arrayUnion(badgeId)
    });

    const transactionRef = doc(collection(db, `users/${uid}/transactions`));
    const newTransaction: Omit<Transaction, 'id'> = {
      amount: -badge.price,
      description: `Purchased badge: ${badge.name || 'Unknown Badge'}`,
      timestamp: serverTimestamp() as Timestamp,
      type: 'debit',
      category: 'badge'
    };
    batch.set(transactionRef, newTransaction);

    await batch.commit();
  } catch (error) {
    console.error('Error purchasing badge:', error);
    throw error; // Re-throw for user feedback
  }
};

export const checkAndAwardBadges = async (uid: string, type: string, value: number, category?: string) => {
  try {
    const badges = await getBadges();
    if (!badges || badges.length === 0) return;

    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return;
    const userData = userSnap.data() as UserData;

    // Ensure badges array exists
    if (!userData.badges) {
      userData.badges = [];
    }

    // Ensure badges array is valid and contains only strings
    if (!Array.isArray(userData.badges)) {
      userData.badges = [];
    } else if (!userData.badges.every(id => typeof id === 'string')) {
      userData.badges = userData.badges.filter(id => typeof id === 'string');
    }

    const eligibleBadges = badges.filter(badge => {
      // Validate badge structure
      if (!badge || typeof badge !== 'object') return false;
      if (!badge.id || typeof badge.id !== 'string') return false;
      if (!userData.badges || userData.badges.includes(badge.id)) return false;
      if (!badge.requirement || typeof badge.requirement !== 'object') return false;

      const req = badge.requirement;
      if (!req.type || req.type !== type) return false;
      if (category && req.category !== category) return false;
      if (typeof req.value !== 'number') return false;

      return value >= req.value;
    });

    if (eligibleBadges.length > 0) {
      const batch = writeBatch(db);
      const newBadgeIds = eligibleBadges.map(b => b.id).filter(Boolean);

      if (newBadgeIds.length > 0) {
        batch.update(userRef, {
          badges: arrayUnion(...newBadgeIds)
        });

        // Add notification for each badge
        for (const badge of eligibleBadges) {
          if (badge && badge.name && typeof badge.name === 'string') {
            const notificationRef = doc(collection(db, `users/${uid}/notifications`));
            const notification: Omit<Notification, 'id'> = {
              userId: uid,
              title: "New Badge Earned!",
              message: `You've earned the "${badge.name}" badge!`,
              type: 'achievement',
              read: false,
              timestamp: serverTimestamp() as Timestamp
            };
            batch.set(notificationRef, notification);
          }
        }

        await batch.commit();
      }
    }
  } catch (error) {
    console.error('Error checking and awarding badges:', error);
    // Don't throw error to prevent quiz submission from failing
  }
};

// --- PENALTY FUNCTIONS ---

export const applyPenalty = async (uid: string, type: 'missed_login' | 'missed_quiz', amount: number) => {
  if (amount <= 0) return;

  const batch = writeBatch(db);
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;
  const userData = userSnap.data() as UserData;

  const penaltyAmount = Math.min(amount, userData.coins); // Don't go below 0 coins

  batch.update(userRef, {
    coins: Math.max(0, userData.coins - penaltyAmount)
  });

  const transactionRef = doc(collection(db, `users/${uid}/transactions`));
  const newTransaction: Omit<Transaction, 'id'> = {
    amount: -penaltyAmount,
    description: type === 'missed_login' ? 'Penalty for missed daily login' : 'Penalty for missed daily quiz',
    timestamp: serverTimestamp() as Timestamp,
    type: 'debit',
    category: 'penalty'
  };
  batch.set(transactionRef, newTransaction);

  // Add motivational notification
  const notificationRef = doc(collection(db, `users/${uid}/notifications`));
  const motivationalMessages = [
    "Don't give up! Every expert was once a beginner.",
    "Consistency is key to success. You've got this!",
    "Small steps every day lead to big results.",
    "Your comeback is always stronger than your setback!",
    "Progress, not perfection. Keep going!"
  ];

  const notification: Omit<Notification, 'id'> = {
    userId: uid,
    title: "Stay Motivated!",
    message: motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)],
    type: 'penalty',
    read: false,
    timestamp: serverTimestamp() as Timestamp
  };
  batch.set(notificationRef, notification);

  await batch.commit();
};

// --- NOTIFICATION FUNCTIONS ---

export const getNotifications = async (uid: string): Promise<Notification[]> => {
  const notificationsRef = collection(db, `users/${uid}/notifications`);
  const q = query(notificationsRef, orderBy("timestamp", "desc"), limit(20));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
};

export const markNotificationAsRead = async (uid: string, notificationId: string) => {
  const notificationRef = doc(db, `users/${uid}/notifications`, notificationId);
  await updateDoc(notificationRef, { read: true });
};

export const checkLeaderboardChanges = async () => {
  try {
    const currentLeaderboard = await getLeaderboard(10);
    const previousLeaderboardRef = doc(db, 'system', 'previousLeaderboard');
    const previousSnap = await getDoc(previousLeaderboardRef);

    if (previousSnap.exists()) {
      const previousLeaderboard = previousSnap.data().data as LeaderboardEntry[];

      // Check for rank changes
      for (let i = 0; i < currentLeaderboard.length; i++) {
        const currentUser = currentLeaderboard[i];
        const previousUser = previousLeaderboard.find(u => u.uid === currentUser.uid);

        if (previousUser && previousUser.rank !== i + 1) {
          // Rank changed, send notification
          const notificationRef = doc(collection(db, `users/${currentUser.uid}/notifications`));
          const notification: Omit<Notification, 'id'> = {
            userId: currentUser.uid,
            title: "Leaderboard Update!",
            message: `You moved from rank ${previousUser.rank} to rank ${i + 1}!`,
            type: 'leaderboard',
            read: false,
            timestamp: serverTimestamp() as Timestamp
          };
          await setDoc(notificationRef, notification);
        }
      }
    }

    // Update previous leaderboard
    const leaderboardData = currentLeaderboard.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    await setDoc(previousLeaderboardRef, { data: leaderboardData });
  } catch (error) {
    console.error("Error checking leaderboard changes:", error);
  }
};

// --- HELPER FUNCTIONS ---

export const checkAllCategoriesCompletedToday = async (uid: string): Promise<boolean> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Only checking core categories for perfect day streak to avoid making it too hard
  const categories: QuizCategory[] = ['ds_algo', 'database', 'os', 'networks'];

  for (const category of categories) {
    const quizResultsRef = collection(db, `users/${uid}/quizResults`);
    // Use only single field query to avoid composite index requirement
    const q = query(
      quizResultsRef,
      where('category', '==', category),
      limit(20)
    );
    const querySnapshot = await getDocs(q);

    // Check client-side for today's perfect scores
    const todayPerfectScore = querySnapshot.docs.some(doc => {
      const data = doc.data();
      const timestamp = data.timestamp?.toDate();
      return timestamp &&
        timestamp >= today &&
        data.score === 100;
    });

    if (!todayPerfectScore) {
      return false;
    }
  }

  return true;
};

export interface DailyStat {
  date: string;
  coinsEarned: number;
  quizzesTaken: number;
  loginBonus: number;
  penalties: number;
  transactions: {
    amount: number;
    type: string;
    category: string;
    description: string;
    timestamp: Date | Timestamp;
  }[];
}

export const getDailyStats = async (uid: string, startDate?: Date, endDate: Date = new Date()): Promise<DailyStat[]> => {
  const stats: DailyStat[] = [];

  // If no startDate is provided, default to 30 days ago
  if (!startDate) {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
  }

  // Clone dates to avoid modifying the original references
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Set start date to beginning of the day
  start.setHours(0, 0, 0, 0);
  // Set end date to end of the day
  end.setHours(23, 59, 59, 999);

  // Calculate the number of days between start and end dates
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  // Get all transactions in the date range in a single query
  const transactionsRef = collection(db, `users/${uid}/transactions`);
  const q = query(
    transactionsRef,
    where('timestamp', '>=', start),
    where('timestamp', '<=', end),
    orderBy('timestamp', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const allTransactions = querySnapshot.docs.map(doc => {
    const data = doc.data();
    // Handle both Firestore Timestamp and Date objects (for flexibility)
    let timestamp: Date;
    if (data.timestamp instanceof Timestamp) {
      timestamp = data.timestamp.toDate();
    } else if (data.timestamp instanceof Date) {
      timestamp = data.timestamp;
    } else {
      // Fallback if timestamp is missing or invalid
      timestamp = new Date(); 
    }
    
    return {
      ...(data as Omit<Transaction, 'id' | 'timestamp'>),
      id: doc.id,
      timestamp
    };
  });

  // Initialize stats for each day in the range
  for (let i = 0; i <= daysDiff; i++) {
    const currentDate = new Date(endDate);
    currentDate.setDate(currentDate.getDate() - i);
    const dateStr = currentDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Create date strings in local timezone for comparison
    const currentDateStr = currentDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format

    // Filter transactions for this specific day
    const dayTransactions = allTransactions.filter(t => {
      // timestamp is already normalized to Date
      const transactionDate = t.timestamp;
      // Convert to local date string for comparison
      const transactionDateStr = transactionDate.toLocaleDateString('en-CA');
      return transactionDateStr === currentDateStr;
    });

    // Calculate stats for the day
    const coinsEarned = dayTransactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);

    const penalties = dayTransactions
      .filter(t => t.category === 'penalty')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const quizzesTaken = dayTransactions
      .filter(t => t.category === 'quiz').length;

    const loginBonus = dayTransactions
      .filter(t => t.category === 'bonus')
      .reduce((sum, t) => sum + t.amount, 0);

    // Only include days with activity or within the last 7 days
    if (coinsEarned > 0 || penalties > 0 || quizzesTaken > 0 || loginBonus > 0 || i >= (daysDiff - 7)) {
      stats.push({
        date: dateStr,
        coinsEarned,
        quizzesTaken,
        loginBonus,
        penalties,
        transactions: dayTransactions.map(t => ({
          amount: t.amount,
          type: t.type,
          category: t.category,
          description: t.description,
          timestamp: t.timestamp
        }))
      });
    }
  }

  // Sort by date (oldest first)
  return stats.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// --- CUSTOM QUIZ FUNCTIONS ---

export interface CustomQuiz {
  id?: string;
  title: string;
  topic: string;
  description?: string;
  questions: QuizQuestion[];
  createdBy: string;
  createdAt: Timestamp;
  sourceFile?: string;
  category: 'custom';
  difficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * Save custom quiz to Firebase
 */
export const saveCustomQuiz = async (uid: string, quiz: Omit<CustomQuiz, 'id' | 'createdAt' | 'createdBy'>): Promise<string> => {
  try {
    const customQuizzesRef = collection(db, 'customQuizzes');
    const quizData: CustomQuiz = {
      ...quiz,
      createdBy: uid,
      createdAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(customQuizzesRef, quizData);

    // Also add to user's custom quizzes subcollection
    const userCustomQuizzesRef = collection(db, `users/${uid}/customQuizzes`);
    await setDoc(doc(userCustomQuizzesRef, docRef.id), {
      ...quizData,
      id: docRef.id,
    });

    return docRef.id;
  } catch (error) {
    console.error('Error saving custom quiz:', error);
    throw error;
  }
};

/**
 * Get custom quizzes for a user
 */
export const getUserCustomQuizzes = async (uid: string): Promise<CustomQuiz[]> => {
  try {
    const userCustomQuizzesRef = collection(db, `users/${uid}/customQuizzes`);
    const q = query(userCustomQuizzesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CustomQuiz));
  } catch (error) {
    console.error('Error fetching custom quizzes:', error);
    return [];
  }
};

/**
 * Get all custom quizzes (for discovery/sharing)
 */
export const getAllCustomQuizzes = async (): Promise<CustomQuiz[]> => {
  try {
    const customQuizzesRef = collection(db, 'customQuizzes');
    const q = query(customQuizzesRef, orderBy('createdAt', 'desc'), limit(50));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CustomQuiz));
  } catch (error) {
    console.error('Error fetching custom quizzes:', error);
    return [];
  }
};

/**
 * Delete custom quiz
 */
export const deleteCustomQuiz = async (uid: string, quizId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, `users/${uid}/customQuizzes`, quizId));
    await deleteDoc(doc(db, 'customQuizzes', quizId));
  } catch (error) {
    console.error('Error deleting custom quiz:', error);
    throw error;
  }
};
