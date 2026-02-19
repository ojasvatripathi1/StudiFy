import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  updateDoc,
  runTransaction,
} from "firebase/firestore";
import { db, checkAndAwardBadges } from './firebase';
import { StudySession, SessionInsight, SubjectType, SessionStatus } from './studySessionTypes';

interface SubjectStats {
  sessions: number;
  totalTime: number;
  focusLevels: number[];
  productivityLevels: number[];
}

interface ProcessedSubjectStats {
  sessions: number;
  totalTime: number;
  averageFocusLevel: number;
  averageProductivity: number;
}

// --- STUDY SESSION FUNCTIONS ---

/**
 * Create a new study session
 */
export const createStudySession = async (
  userId: string,
  subject: SubjectType,
  title: string,
  description?: string,
  plannedDuration?: number
): Promise<StudySession> => {
  try {
    const sessionRef = doc(collection(db, `users/${userId}/studySessions`));
    const sessionData: StudySession = {
      id: sessionRef.id,
      userId,
      subject,
      title,
      description,
      startTime: serverTimestamp() as Timestamp,
      duration: 0,
      plannedDuration,
      status: 'active',
      breaks: {
        count: 0,
        totalBreakTime: 0,
      },
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    await setDoc(sessionRef, sessionData);
    return { ...sessionData, id: sessionRef.id };
  } catch (error) {
    console.error('Error creating study session:', error);
    throw error;
  }
};

/**
 * Update study session
 */
export const updateStudySession = async (
  userId: string,
  sessionId: string,
  updates: Partial<StudySession>
): Promise<void> => {
  try {
    const sessionRef = doc(db, `users/${userId}/studySessions`, sessionId);
    await updateDoc(sessionRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating study session:', error);
    throw error;
  }
};

/**
 * Complete a study session
 */
export const completeStudySession = async (
  userId: string,
  sessionId: string,
  endTime: Timestamp,
  notes?: string,
  focusLevel?: number,
  productivity?: number,
  distractions?: string[],
  topics?: string[],
  achievements?: string[]
): Promise<void> => {
  try {
    const sessionRef = doc(db, `users/${userId}/studySessions`, sessionId);
    const userRef = doc(db, 'users', userId);

    let finalTotalMinutes = 0;
    let finalTotalSessions = 0;

    await runTransaction(db, async (transaction) => {
      const sessionSnap = await transaction.get(sessionRef);
      if (!sessionSnap.exists()) {
        throw new Error("Session does not exist!");
      }

      const sessionData = sessionSnap.data();
      const startTime = sessionData.startTime as Timestamp;
      const durationInSeconds = Math.floor((endTime.toMillis() - startTime.toMillis()) / 1000);
      const durationInMinutes = Math.floor(durationInSeconds / 60);
      
      // Calculate coins: 10 coins for every 5 minutes
      const coinsEarned = Math.floor(durationInMinutes / 5) * 10;

      // READ: Get user data (Must be done before any writes)
      const userSnap = await transaction.get(userRef);
      let currentCoins = 0;
      let currentStudyMinutes = 0;
      let currentStudySessions = 0;
      let userExists = false;

      if (userSnap.exists()) {
        userExists = true;
        const userData = userSnap.data();
        currentCoins = userData.coins || 0;
        currentStudyMinutes = userData.totalStudyMinutes || 0;
        currentStudySessions = userData.totalStudySessions || 0;
      }

      finalTotalMinutes = currentStudyMinutes + durationInMinutes;
      finalTotalSessions = currentStudySessions + 1;

      // WRITE: Update session
      transaction.update(sessionRef, {
        status: 'completed',
        endTime,
        duration: durationInSeconds,
        coinsEarned,
        notes,
        focusLevel,
        productivity,
        distractions: distractions || [],
        topics: topics || [],
        achievements: achievements || [],
        updatedAt: serverTimestamp(),
      });

      // WRITE: Update user stats and balance
      if (userExists) {
        transaction.update(userRef, {
          coins: currentCoins + coinsEarned,
          totalStudyMinutes: finalTotalMinutes,
          totalStudySessions: finalTotalSessions
        });

        // Add transaction record if coins earned
        if (coinsEarned > 0) {
          const newTransactionRef = doc(collection(db, `users/${userId}/transactions`));
          transaction.set(newTransactionRef, {
            userId,
            amount: coinsEarned,
            type: 'credit',
            category: 'study_session',
            description: `Completed ${durationInMinutes} min study session`,
            timestamp: serverTimestamp(),
            balanceAfter: currentCoins + coinsEarned
          });
        }
      }
    });

    // Check for badges after successful transaction
    // We check for both cumulative minutes and session count
    if (finalTotalMinutes > 0) {
      await checkAndAwardBadges(userId, 'study_minutes', finalTotalMinutes);
    }
    if (finalTotalSessions > 0) {
      await checkAndAwardBadges(userId, 'study_sessions', finalTotalSessions);
    }

  } catch (error) {
    console.error('Error completing study session:', error);
    throw error;
  }
};

/**
 * Pause study session
 */
export const pauseStudySession = async (
  userId: string,
  sessionId: string
): Promise<void> => {
  try {
    const sessionRef = doc(db, `users/${userId}/studySessions`, sessionId);
    await updateDoc(sessionRef, {
      status: 'paused',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error pausing study session:', error);
    throw error;
  }
};

/**
 * Resume study session
 */
export const resumeStudySession = async (
  userId: string,
  sessionId: string
): Promise<void> => {
  try {
    const sessionRef = doc(db, `users/${userId}/studySessions`, sessionId);
    await updateDoc(sessionRef, {
      status: 'active',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error resuming study session:', error);
    throw error;
  }
};

/**
 * Get study session by ID
 */
export const getStudySession = async (
  userId: string,
  sessionId: string
): Promise<StudySession | null> => {
  try {
    const sessionRef = doc(db, `users/${userId}/studySessions`, sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (sessionSnap.exists()) {
      return sessionSnap.data() as StudySession;
    }
    return null;
  } catch (error) {
    console.error('Error fetching study session:', error);
    return null;
  }
};

/**
 * Get all study sessions for a user
 */
export const getUserStudySessions = async (
  userId: string,
  status?: SessionStatus,
  limit_?: number
): Promise<StudySession[]> => {
  try {
    const sessionsRef = collection(db, `users/${userId}/studySessions`);
    const q = status
      ? query(
          sessionsRef,
          where('status', '==', status),
          orderBy('startTime', 'desc'),
          limit(limit_ || 50)
        )
      : query(
          sessionsRef,
          orderBy('startTime', 'desc'),
          limit(limit_ || 50)
        );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as StudySession);
  } catch (error) {
    console.error('Error fetching study sessions:', error);
    return [];
  }
};

/**
 * Get study sessions for a specific date range
 */
export const getStudySessionsByDateRange = async (
  userId: string,
  startDate: Timestamp,
  endDate: Timestamp,
  subject?: SubjectType
): Promise<StudySession[]> => {
  try {
    const sessionsRef = collection(db, `users/${userId}/studySessions`);
    const q = subject
      ? query(
          sessionsRef,
          where('startTime', '>=', startDate),
          where('startTime', '<=', endDate),
          where('subject', '==', subject),
          orderBy('startTime', 'desc')
        )
      : query(
          sessionsRef,
          where('startTime', '>=', startDate),
          where('startTime', '<=', endDate),
          orderBy('startTime', 'desc')
        );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map((doc) => doc.data() as StudySession)
      .filter((session) => session.status === 'completed');
  } catch (error) {
    console.error('Error fetching study sessions by date range:', error);
    return [];
  }
};

/**
 * Delete study session
 */
export const deleteStudySession = async (
  userId: string,
  sessionId: string
): Promise<void> => {
  try {
    const sessionRef = doc(db, `users/${userId}/studySessions`, sessionId);
    await deleteDoc(sessionRef);
  } catch (error) {
    console.error('Error deleting study session:', error);
    throw error;
  }
};

/**
 * Record a break in session
 */
export const recordSessionBreak = async (
  userId: string,
  sessionId: string,
  breakDuration: number // in seconds
): Promise<void> => {
  try {
    const sessionRef = doc(db, `users/${userId}/studySessions`, sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (sessionSnap.exists()) {
      const session = sessionSnap.data() as StudySession;
      await updateDoc(sessionRef, {
        breaks: {
          count: session.breaks.count + 1,
          totalBreakTime: session.breaks.totalBreakTime + breakDuration,
        },
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error recording break:', error);
    throw error;
  }
};

// --- SESSION INSIGHTS FUNCTIONS ---

/**
 * Save session insights
 */
export const saveSessionInsight = async (
  userId: string,
  insight: Omit<SessionInsight, 'id' | 'createdAt'>
): Promise<SessionInsight> => {
  try {
    const insightRef = doc(collection(db, `users/${userId}/sessionInsights`));
    const insightData: SessionInsight = {
      ...insight,
      id: insightRef.id,
      createdAt: serverTimestamp() as Timestamp,
    };

    await setDoc(insightRef, insightData);
    return insightData;
  } catch (error) {
    console.error('Error saving session insight:', error);
    throw error;
  }
};

/**
 * Get latest insight for a period
 */
export const getLatestSessionInsight = async (
  userId: string,
  period: 'daily' | 'weekly' | 'monthly'
): Promise<SessionInsight | null> => {
  try {
    const insightsRef = collection(db, `users/${userId}/sessionInsights`);
    // Simple query without compound index requirement
    const q = query(insightsRef, limit(50));

    const querySnapshot = await getDocs(q);
    const insights = querySnapshot.docs
      .map((doc) => doc.data() as SessionInsight)
      .filter((insight) => insight.period === period)
      .sort((a, b) => b.date.toMillis() - a.date.toMillis());

    return insights.length > 0 ? insights[0] : null;
  } catch (error) {
    console.error('Error fetching latest session insight:', error);
    return null;
  }
};

/**
 * Get insight for the previous period (for trend calculation)
 */
export const getPreviousPeriodInsight = async (
  userId: string,
  period: 'daily' | 'weekly' | 'monthly',
  currentDate: Timestamp
): Promise<SessionInsight | null> => {
  try {
    const insightsRef = collection(db, `users/${userId}/sessionInsights`);
    // Fetch generic batch and filter + sort in memory to avoid ALL composite index requirements
    const q = query(insightsRef, limit(100));

    const querySnapshot = await getDocs(q);
    const insights = querySnapshot.docs
      .map((doc) => doc.data() as SessionInsight)
      .filter((insight) =>
        insight.period === period &&
        insight.date &&
        insight.date instanceof Timestamp &&
        insight.date.toMillis() < currentDate.toMillis()
      )
      .sort((a, b) => {
        const timeA = a.date?.toMillis?.() || 0;
        const timeB = b.date?.toMillis?.() || 0;
        return timeB - timeA;
      });

    return insights.length > 0 ? insights[0] : null;
  } catch (error) {
    console.error('Error fetching previous session insight:', error);
    return null;
  }
};

/**
 * Get all insights for a user
 */
export const getUserSessionInsights = async (
  userId: string,
  period?: 'daily' | 'weekly' | 'monthly',
  limit_?: number
): Promise<SessionInsight[]> => {
  try {
    const insightsRef = collection(db, `users/${userId}/sessionInsights`);
    // Simple query without compound index requirement
    const q = query(insightsRef, limit(limit_ || 100));

    const querySnapshot = await getDocs(q);
    let insights = querySnapshot.docs.map((doc) => doc.data() as SessionInsight);

    // Filter by period in memory if specified
    if (period) {
      insights = insights.filter((insight) => insight.period === period);
    }

    // Sort by date descending
    insights.sort((a, b) => b.date.toMillis() - a.date.toMillis());

    // Apply limit
    return insights.slice(0, limit_ || (period ? 30 : 100));
  } catch (error) {
    console.error('Error fetching session insights:', error);
    return [];
  }
};

/**
 * Calculate daily insights from study sessions
 */
export const calculateDailyInsights = async (
  userId: string,
  date: Timestamp
): Promise<Omit<SessionInsight, 'id' | 'createdAt'>> => {
  try {
    // Get sessions for the day
    const startOfDay = new Date(date.toDate());
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date.toDate());
    endOfDay.setHours(23, 59, 59, 999);

    const sessions = await getStudySessionsByDateRange(
      userId,
      Timestamp.fromDate(startOfDay),
      Timestamp.fromDate(endOfDay)
    );

    // Get previous insight for trend
    const previousInsight = await getPreviousPeriodInsight(userId, 'daily', date);

    if (sessions.length === 0) {
      return {
        userId,
        period: 'daily',
        date,
        totalSessions: 0,
        totalStudyTime: 0,
        averageSessionDuration: 0,
        averageFocusLevel: 0,
        averageProductivity: 0,
        subjectStats: {},
        improvements: previousInsight ? ['Take a break and recharge!'] : ['Start studying to get personalized insights!'],
        challenges: ['No study sessions recorded today'],
        recommendations: ['Create your first study session to begin tracking progress'],
        avgBreaksPerSession: 0,
        avgBreakDuration: 0,
        consistencyScore: previousInsight ? Math.max(0, previousInsight.consistencyScore - 10) : 0, // Decay consistency if missed
        improvementTrend: 'stable',
        generatedBy: 'system',
      };
    }

    // Calculate metrics
    const totalSessionCount = sessions.length;
    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalStudyHours = totalDuration / 3600;
    const avgSessionDuration = Math.round(totalDuration / totalSessionCount / 60);
    const avgFocusLevel =
      sessions.reduce((sum, s) => sum + (s.focusLevel || 0), 0) / totalSessionCount;
    const avgProductivity =
      sessions.reduce((sum, s) => sum + (s.productivity || 0), 0) / totalSessionCount;

    // Subject breakdown
    const subjectStats: Partial<Record<SubjectType, SubjectStats>> = {};
    sessions.forEach((session) => {
      if (!subjectStats[session.subject]) {
        subjectStats[session.subject] = {
          sessions: 0,
          totalTime: 0,
          focusLevels: [],
          productivityLevels: [],
        };
      }
      const stats = subjectStats[session.subject]!;
      stats.sessions++;
      stats.totalTime += session.duration / 3600;
      if (session.focusLevel) stats.focusLevels.push(session.focusLevel);
      if (session.productivity)
        stats.productivityLevels.push(session.productivity);
    });

    const processedSubjectStats: Record<string, ProcessedSubjectStats> = {};
    Object.entries(subjectStats).forEach(([subject, stats]) => {
      if (!stats) return;
      processedSubjectStats[subject] = {
        sessions: stats.sessions,
        totalTime: Math.round(stats.totalTime * 10) / 10,
        averageFocusLevel:
          stats.focusLevels.length > 0
            ? Math.round(
              (stats.focusLevels.reduce((a, b) => a + b, 0) / stats.focusLevels.length) * 10
            ) / 10
            : 0,
        averageProductivity:
          stats.productivityLevels.length > 0
            ? Math.round(
              (stats.productivityLevels.reduce((a, b) => a + b, 0) /
                stats.productivityLevels.length) *
              10
            ) / 10
            : 0,
      };
    });

    // Break analysis
    const totalBreaks = sessions.reduce((sum, s) => sum + s.breaks.count, 0);
    const totalBreakTime = sessions.reduce((sum, s) => sum + s.breaks.totalBreakTime, 0);
    const avgBreaksPerSession = totalSessionCount > 0 ? totalBreaks / totalSessionCount : 0;
    const avgBreakDuration =
      totalBreaks > 0 ? Math.round((totalBreakTime / totalBreaks) * 10) / 10 / 60 : 0;

    // Generate insights
    const improvements: string[] = [];
    const challenges: string[] = [];
    const recommendations: string[] = [];

    if (avgFocusLevel >= 7) improvements.push('Great focus level today!');
    else if (avgFocusLevel < 5) challenges.push('Focus level was lower than usual');

    if (totalStudyHours >= 2) improvements.push('Excellent study duration');
    else if (totalStudyHours < 0.5) recommendations.push('Try to study for at least 30 minutes daily');

    if (totalSessionCount >= 3) improvements.push('Multiple study sessions completed');

    // Check for burnout / breaks
    if (avgBreakDuration < 5 && totalStudyHours > 3) recommendations.push('Remember to take longer breaks to avoid burnout');

    // Best time analysis
    let bestHour = 0;
    let bestFocus = 0;
    const hourCounts: Record<number, number> = {};

    sessions.forEach((session) => {
      const hour = new Date(session.startTime.toDate()).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      const focus = session.focusLevel || 0;
      if (focus > bestFocus) {
        bestFocus = focus;
        bestHour = hour;
      }
    });

    // Trend Analysis
    let improvementTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (previousInsight) {
      if (totalStudyHours > previousInsight.totalStudyTime * 1.1) improvementTrend = 'improving';
      else if (totalStudyHours < previousInsight.totalStudyTime * 0.9) improvementTrend = 'declining';

      // If focus improved significantly, override
      if (avgFocusLevel > (previousInsight.averageFocusLevel || 0) + 1) improvementTrend = 'improving';
    }

    // Consistency Score: Daily logic. If you studied today, high consistency. 
    // real logic would need history of last N days. For now, simple:
    // If studied today: 100%. If not: 0%. 
    // Better: if previous consistency exists, maintain it or increase it.
    let consistencyScore = 100;
    if (previousInsight) {
      // Recover consistency if you studied today
      consistencyScore = Math.min(100, previousInsight.consistencyScore + 20);
    }




    return {
      userId,
      period: 'daily',
      date,
      totalSessions: totalSessionCount,
      totalStudyTime: Math.round(totalStudyHours * 10) / 10,
      averageSessionDuration: avgSessionDuration,
      averageFocusLevel: Math.round(avgFocusLevel * 10) / 10,
      averageProductivity: Math.round(avgProductivity * 10) / 10,
      subjectStats: processedSubjectStats,
      improvements,
      challenges,
      recommendations,
      bestTimeOfDay:
        bestFocus > 0
          ? {
            hour: bestHour,
            focusLevel: bestFocus,
            productivity: sessions.find((s) => new Date(s.startTime.toDate()).getHours() === bestHour)
              ?.productivity || 0,
          }
          : undefined,
      avgBreaksPerSession: Math.round(avgBreaksPerSession * 100) / 100,
      avgBreakDuration,
      consistencyScore,
      improvementTrend,
      generatedBy: 'system',
    };
  } catch (error) {
    console.error('Error calculating daily insights:', error);
    throw error;
  }
};

/**
 * Calculate weekly insights
 */
export const calculateWeeklyInsights = async (
  userId: string,
  weekStartDate: Timestamp
): Promise<Omit<SessionInsight, 'id' | 'createdAt'>> => {
  try {
    const startDate = new Date(weekStartDate.toDate());
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    const sessions = await getStudySessionsByDateRange(
      userId,
      Timestamp.fromDate(startDate),
      Timestamp.fromDate(endDate)
    );

    // Get previous weekly insight
    const previousInsight = await getPreviousPeriodInsight(userId, 'weekly', weekStartDate);

    if (sessions.length === 0) {
      return {
        userId,
        period: 'weekly',
        date: weekStartDate,
        totalSessions: 0,
        totalStudyTime: 0,
        averageSessionDuration: 0,
        averageFocusLevel: 0,
        averageProductivity: 0,
        subjectStats: {},
        improvements: previousInsight ? [] : ['Start studying this week!'],
        challenges: ['No study sessions this week'],
        recommendations: ['Create regular study sessions for better consistency'],
        avgBreaksPerSession: 0,
        avgBreakDuration: 0,
        consistencyScore: previousInsight ? Math.max(0, previousInsight.consistencyScore - 15) : 0,
        improvementTrend: 'stable',
        generatedBy: 'system',
      };
    }

    // Similar calculations as daily but for weekly data
    const totalSessionCount = sessions.length;
    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalStudyHours = totalDuration / 3600;
    const avgSessionDuration = Math.round(totalDuration / totalSessionCount / 60);
    const avgFocusLevel =
      sessions.reduce((sum, s) => sum + (s.focusLevel || 0), 0) / totalSessionCount;
    const avgProductivity =
      sessions.reduce((sum, s) => sum + (s.productivity || 0), 0) / totalSessionCount;

    const subjectStats: Partial<Record<SubjectType, SubjectStats>> = {};
    sessions.forEach((session) => {
      if (!subjectStats[session.subject]) {
        subjectStats[session.subject] = {
          sessions: 0,
          totalTime: 0,
          focusLevels: [],
          productivityLevels: [],
        };
      }
      const stats = subjectStats[session.subject]!;
      stats.sessions++;
      stats.totalTime += session.duration / 3600;
      if (session.focusLevel) stats.focusLevels.push(session.focusLevel);
      if (session.productivity)
        stats.productivityLevels.push(session.productivity);
    });

    const processedSubjectStats: Record<string, ProcessedSubjectStats> = {};
    Object.entries(subjectStats).forEach(([subject, stats]) => {
      if (!stats) return;
      processedSubjectStats[subject] = {
        sessions: stats.sessions,
        totalTime: Math.round(stats.totalTime * 10) / 10,
        averageFocusLevel:
          stats.focusLevels.length > 0
            ? Math.round(
              (stats.focusLevels.reduce((a, b) => a + b, 0) / stats.focusLevels.length) * 10
            ) / 10
            : 0,
        averageProductivity:
          stats.productivityLevels.length > 0
            ? Math.round(
              (stats.productivityLevels.reduce((a, b) => a + b, 0) /
                stats.productivityLevels.length) *
              10
            ) / 10
            : 0,
      };
    });

    const totalBreaks = sessions.reduce((sum, s) => sum + s.breaks.count, 0);
    const totalBreakTime = sessions.reduce((sum, s) => sum + s.breaks.totalBreakTime, 0);

    const improvements: string[] = [];
    const recommendations: string[] = [];

    if (totalStudyHours >= 10) improvements.push('Excellent weekly study commitment!');
    if (avgFocusLevel >= 7) improvements.push('Consistently high focus levels');
    if (totalSessionCount >= 15) improvements.push('Great session consistency');

    if (totalStudyHours < 5) recommendations.push('Aim for more study time next week');
    if (avgFocusLevel < 6) recommendations.push('Try to minimize distractions during sessions');

    // Trend Analysis
    let improvementTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (previousInsight) {
      if (totalStudyHours > previousInsight.totalStudyTime * 1.1) improvementTrend = 'improving';
      else if (totalStudyHours < previousInsight.totalStudyTime * 0.9) improvementTrend = 'declining';
    }

    // Consistency: Target 5 sessions/week for 100%? Or more?
    // Let's say 5 days a week is ideal. But we don't have distinct days count easily here without Set.
    // Let's use unique days.
    const uniqueDays = new Set(sessions.map(s => new Date(s.startTime.toDate()).toDateString())).size;
    const consistencyScore = Math.min(100, Math.round((uniqueDays / 5) * 100)); // 5 days a week target

    return {
      userId,
      period: 'weekly',
      date: weekStartDate,
      totalSessions: totalSessionCount,
      totalStudyTime: Math.round(totalStudyHours * 10) / 10,
      averageSessionDuration: avgSessionDuration,
      averageFocusLevel: Math.round(avgFocusLevel * 10) / 10,
      averageProductivity: Math.round(avgProductivity * 10) / 10,
      subjectStats: processedSubjectStats,
      improvements,
      challenges:
        totalStudyHours < 5 ? ['Below target study hours for the week'] : [],
      recommendations,
      avgBreaksPerSession: Math.round((totalBreaks / totalSessionCount) * 100) / 100,
      avgBreakDuration:
        totalBreaks > 0 ? Math.round((totalBreakTime / totalBreaks) * 10) / 10 / 60 : 0,
      consistencyScore,
      improvementTrend,
      generatedBy: 'system',
    };
  } catch (error) {
    console.error('Error calculating weekly insights:', error);
    throw error;
  }
};

/**
 * Calculate monthly insights
 */
export const calculateMonthlyInsights = async (
  userId: string,
  monthDate: Timestamp
): Promise<Omit<SessionInsight, 'id' | 'createdAt'>> => {
  try {
    const monthStartDate = new Date(monthDate.toDate());
    monthStartDate.setDate(1);
    monthStartDate.setHours(0, 0, 0, 0);

    const monthEndDate = new Date(monthStartDate);
    monthEndDate.setMonth(monthEndDate.getMonth() + 1);
    monthEndDate.setDate(0);
    monthEndDate.setHours(23, 59, 59, 999);

    const sessions = await getStudySessionsByDateRange(
      userId,
      Timestamp.fromDate(monthStartDate),
      Timestamp.fromDate(monthEndDate)
    );

    // Get previous monthly insight
    const previousInsight = await getPreviousPeriodInsight(userId, 'monthly', monthDate);

    if (sessions.length === 0) {
      return {
        userId,
        period: 'monthly',
        date: monthDate,
        totalSessions: 0,
        totalStudyTime: 0,
        averageSessionDuration: 0,
        averageFocusLevel: 0,
        averageProductivity: 0,
        subjectStats: {},
        improvements: previousInsight ? [] : ['Begin your monthly study journey!'],
        challenges: ['No sessions recorded this month'],
        recommendations: ['Establish consistent daily study habits'],
        avgBreaksPerSession: 0,
        avgBreakDuration: 0,
        consistencyScore: previousInsight ? Math.max(0, previousInsight.consistencyScore - 20) : 0,
        improvementTrend: 'stable',
        generatedBy: 'system',
      };
    }

    const totalSessionCount = sessions.length;
    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalStudyHours = totalDuration / 3600;
    const avgSessionDuration = Math.round(totalDuration / totalSessionCount / 60);
    const avgFocusLevel =
      sessions.reduce((sum, s) => sum + (s.focusLevel || 0), 0) / totalSessionCount;
    const avgProductivity =
      sessions.reduce((sum, s) => sum + (s.productivity || 0), 0) / totalSessionCount;

    const subjectStats: Partial<Record<SubjectType, SubjectStats>> = {};
    sessions.forEach((session) => {
      if (!subjectStats[session.subject]) {
        subjectStats[session.subject] = {
          sessions: 0,
          totalTime: 0,
          focusLevels: [],
          productivityLevels: [],
        };
      }
      const stats = subjectStats[session.subject]!;
      stats.sessions++;
      stats.totalTime += session.duration / 3600;
      if (session.focusLevel) stats.focusLevels.push(session.focusLevel);
      if (session.productivity)
        stats.productivityLevels.push(session.productivity);
    });

    const processedSubjectStats: Record<string, ProcessedSubjectStats> = {};
    Object.entries(subjectStats).forEach(([subject, stats]) => {
      if (!stats) return;
      processedSubjectStats[subject] = {
        sessions: stats.sessions,
        totalTime: Math.round(stats.totalTime * 10) / 10,
        averageFocusLevel:
          stats.focusLevels.length > 0
            ? Math.round(
              (stats.focusLevels.reduce((a, b) => a + b, 0) / stats.focusLevels.length) * 10
            ) / 10
            : 0,
        averageProductivity:
          stats.productivityLevels.length > 0
            ? Math.round(
              (stats.productivityLevels.reduce((a, b) => a + b, 0) /
                stats.productivityLevels.length) *
              10
            ) / 10
            : 0,
      };
    });

    const totalBreaks = sessions.reduce((sum, s) => sum + s.breaks.count, 0);
    const totalBreakTime = sessions.reduce((sum, s) => sum + s.breaks.totalBreakTime, 0);

    const improvements: string[] = [];
    const challenges: string[] = [];
    const recommendations: string[] = [];

    if (totalStudyHours >= 40) {
      improvements.push('Outstanding monthly study dedication!');
      improvements.push('Remarkable consistency throughout the month');
    } else if (totalStudyHours >= 20) {
      improvements.push('Good monthly study commitment');
    } else {
      challenges.push('Study hours below monthly target');
      recommendations.push('Increase daily study time to reach monthly goals');
    }

    if (avgFocusLevel >= 7) improvements.push('Excellent sustained focus throughout month');
    if (avgProductivity >= 7) improvements.push('High productivity maintained');

    // Trend Analysis
    let improvementTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (previousInsight) {
      if (totalStudyHours > previousInsight.totalStudyTime * 1.1) improvementTrend = 'improving';
      else if (totalStudyHours < previousInsight.totalStudyTime * 0.9) improvementTrend = 'declining';
    }

    // Consistency: Target 20 days/month?
    const uniqueDays = new Set(sessions.map(s => new Date(s.startTime.toDate()).toDateString())).size;
    const consistencyScore = Math.min(100, Math.round((uniqueDays / 20) * 100));

    return {
      userId,
      period: 'monthly',
      date: monthDate,
      totalSessions: totalSessionCount,
      totalStudyTime: Math.round(totalStudyHours * 10) / 10,
      averageSessionDuration: avgSessionDuration,
      averageFocusLevel: Math.round(avgFocusLevel * 10) / 10,
      averageProductivity: Math.round(avgProductivity * 10) / 10,
      subjectStats: processedSubjectStats,
      improvements,
      challenges,
      recommendations,
      avgBreaksPerSession: Math.round((totalBreaks / totalSessionCount) * 100) / 100,
      avgBreakDuration:
        totalBreaks > 0 ? Math.round((totalBreakTime / totalBreaks) * 10) / 10 / 60 : 0,
      consistencyScore,
      improvementTrend,
      generatedBy: 'system',
    };
  } catch (error) {
    console.error('Error calculating monthly insights:', error);
    throw error;
  }
};
