import {onSchedule} from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import {FieldValue} from "firebase-admin/firestore";

// Initialize Firebase Admin
admin.initializeApp();
export const checkUserDailyActivity = onSchedule({
  schedule: "59 23 * * *", // Runs every day at 23:59
  timeZone: "Asia/Kolkata", // Adjust timezone as needed
  memory: "1GiB",
  timeoutSeconds: 540,
  minInstances: 0,
  maxInstances: 1,
}, async () => {
  const db = admin.firestore();
  const now = admin.firestore.Timestamp.now();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = admin.firestore.Timestamp.fromDate(today);

  try {
    // Get all users
    const usersSnapshot = await db.collection("users").get();
    const batch = db.batch();
    let batchCount = 0;
    const BATCH_LIMIT = 500; // Firestore batch limit

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;

      // Check if user logged in today
      const lastLogin = userData.lastLoginDate?.toDate();
      const loggedInToday = lastLogin && lastLogin >= today;

      // Check if user completed any quiz today
      const quizQuery = await db
        .collection("quizResults")
        .where("userId", "==", userId)
        .where("timestamp", ">=", todayStart)
        .limit(1)
        .get();

      const completedQuizToday = !quizQuery.empty;

      if (!loggedInToday || !completedQuizToday) {
        const updates: {
          loginStreak?: number;
          quizStreaks?: {
            math: number;
            aptitude: number;
            grammar: number;
            programming: number;
          };
          coins?: FirebaseFirestore.FieldValue;
          [key: string]: unknown;
        } = {};

        // Reset login streak if didn't log in
        if (!loggedInToday) {
          updates.loginStreak = 0;
          updates.quizStreaks = {
            math: 0,
            aptitude: 0,
            grammar: 0,
            programming: 0,
          };
        }

        // Deduct coins (e.g., 10 coins penalty)
        const penalty = 10;
        updates.coins = FieldValue.increment(-penalty);

        // Add penalty transaction
        const transactionRef = db
          .collection(`users/${userId}/transactions`)
          .doc();
        batch.set(transactionRef, {
          amount: penalty,
          description: "Daily activity penalty",
          timestamp: now,
          type: "debit",
          category: "penalty",
        });

        // Update user data
        const userRef = db.collection("users").doc(userId);
        batch.update(userRef, updates);

        batchCount++;
        if (batchCount >= BATCH_LIMIT) {
          await batch.commit();
          batchCount = 0;
        }
      }
    }

    // Commit any remaining batched operations
    if (batchCount > 0) {
      await batch.commit();
    }

    console.log("Daily user activity check completed successfully");
  } catch (error) {
    console.error("Error in daily user activity check:", error);
    throw error;
  }
});
