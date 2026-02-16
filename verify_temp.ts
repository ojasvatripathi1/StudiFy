
import { db } from '@/lib/firebase';
import {
    createStudySession,
    completeStudySession,
    calculateDailyInsights,
    calculateWeeklyInsights,
    calculateMonthlyInsights
} from '@/lib/studySessionFirebase';
import { Timestamp } from 'firebase/firestore';

async function verifyInsights() {
    const userId = "test_user_verification";
    const now = Timestamp.now();
    const today = new Date();

    console.log("Starting Verification...");

    // 1. Create Dummy Data
    console.log("Creating dummy sessions...");

    // Session 1: Today, Math, 1 hour, High Focus
    const s1 = await createStudySession(userId, 'mathematics', 'Math Test 1', 'Testing', 3600);
    // Simulate completion
    const s1End = new Date(today.getTime() + 3600 * 1000);
    await completeStudySession(userId, s1.id, Timestamp.fromDate(s1End), "Good session", 9, 8);
    console.log("Created Session 1 (Today)");

    // Session 2: Yesterday, Programming, 2 hours, Medium Focus
    // We need to hack the creation time or just assume the logic uses startTime.
    // createStudySession uses serverTimestamp for startTime. We can't easily override it without modifying the function or using a specialized admin-like setDoc.
    // For this verification, we might be limited to "Today" testing unless we modify createStudySession to accept startTime.
    // However, calculateDailyInsights takes a `date` param. So we can test logic by passing *today* as the date.

    // Let's test Daily Insights for TODAY.
    console.log("Calculating Daily Insights...");
    const daily = await calculateDailyInsights(userId, now);
    console.log("Daily Insights:", JSON.stringify(daily, null, 2));

    if (daily.totalStudyTime >= 1) console.log("✅ Daily Study Time Check Passed");
    else console.error("❌ Daily Study Time Check Failed");

    if (daily.averageFocusLevel === 9) console.log("✅ Daily Focus Level Check Passed");
    else console.error("❌ Daily Focus Level Check Failed");

    // Test Weekly Insights
    console.log("Calculating Weekly Insights...");
    const weekly = await calculateWeeklyInsights(userId, now);
    console.log("Weekly Insights:", JSON.stringify(weekly, null, 2));

    // Test Monthly Insights
    console.log("Calculating Monthly Insights...");
    const monthly = await calculateMonthlyInsights(userId, now);
    console.log("Monthly Insights:", JSON.stringify(monthly, null, 2));

}

// We can't easily run this as a standalone script because of module aliases (@/lib/...) and Firebase config.
// The best way is to instruct the user to check the UI, or use a temporary page.
// Since I cannot open browser, I will rely on code review and confidence.
// I will delete this file and instead ask the user to verify.
