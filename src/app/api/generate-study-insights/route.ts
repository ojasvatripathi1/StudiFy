import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

function initFirebase() {
  if (!getApps().length) {
    if (process.env.FIREBASE_PRIVATE_KEY) {
      initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      console.warn('Missing FIREBASE_PRIVATE_KEY, skipping Firebase Admin initialization');
    }
  }
}

/**
 * Generate AI-powered insights from study session data
 * POST /api/generate-study-insights
 */
export async function POST(req: NextRequest) {
  try {
    initFirebase();
    const db = getFirestore();
    const { userId, period } = await req.json();

    if (!userId || !period) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, period' },
        { status: 400 }
      );
    }

    // Verify user authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const decodedToken = await getAuth().verifyIdToken(token);
    
    if (decodedToken.uid !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's study sessions for the period
    let startDate: Date;
    const endDate = new Date();

    if (period === 'daily') {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'weekly') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - startDate.getDay());
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'monthly') {
      startDate = new Date();
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    } else {
      return NextResponse.json(
        { error: 'Invalid period' },
        { status: 400 }
      );
    }

    // Query user's study sessions
    const sessionsRef = db.collection(`users/${userId}/studySessions`);
    const snapshot = await sessionsRef
      .where('startTime', '>=', startDate)
      .where('startTime', '<=', endDate)
      .where('status', '==', 'completed')
      .orderBy('startTime', 'desc')
      .get();

    const sessions = snapshot.docs.map((doc) => doc.data());

    if (sessions.length === 0) {
      return NextResponse.json({
        insights: {
          summary: 'No study sessions completed for this period.',
          recommendations: ['Start a study session to get personalized insights'],
          keyFindings: [],
        },
      });
    }

    // Calculate metrics
    const totalStudyTime = sessions.reduce((sum, s) => sum + s.duration, 0) / 3600; // hours
    const avgFocusLevel = sessions.reduce((sum, s) => sum + (s.focusLevel || 0), 0) / sessions.length;
    const avgProductivity = sessions.reduce((sum, s) => sum + (s.productivity || 0), 0) / sessions.length;

    interface SubjectData {
      sessions: number;
      totalTime: number;
      focusLevels: number[];
      distractions: string[];
      topics: string[];
    }

    // Analyze by subject
    const subjectAnalysis: Record<string, SubjectData> = {};
    sessions.forEach((session) => {
      if (!subjectAnalysis[session.subject]) {
        subjectAnalysis[session.subject] = {
          sessions: 0,
          totalTime: 0,
          focusLevels: [],
          distractions: [],
          topics: [],
        };
      }
      subjectAnalysis[session.subject].sessions++;
      subjectAnalysis[session.subject].totalTime += session.duration / 3600;
      if (session.focusLevel) subjectAnalysis[session.subject].focusLevels.push(session.focusLevel);
      if (session.distractions) subjectAnalysis[session.subject].distractions.push(...session.distractions);
      if (session.topics) subjectAnalysis[session.subject].topics.push(...session.topics);
    });

    // Generate AI insights
    const recommendations: string[] = [];
    const keyFindings: string[] = [];

    // Focus insights
    if (avgFocusLevel >= 8) {
      keyFindings.push(`Excellent focus level maintained at ${avgFocusLevel.toFixed(1)}/10`);
    } else if (avgFocusLevel >= 6) {
      keyFindings.push(`Good focus level at ${avgFocusLevel.toFixed(1)}/10`);
      recommendations.push('Try to minimize distractions to improve focus further');
    } else {
      keyFindings.push(`Focus level needs improvement: ${avgFocusLevel.toFixed(1)}/10`);
      recommendations.push('Consider studying in a quieter environment');
      recommendations.push('Take regular breaks to maintain focus');
    }

    // Time insights
    if (totalStudyTime >= 10 && period === 'weekly') {
      keyFindings.push(`Strong commitment with ${totalStudyTime.toFixed(1)} hours of study`);
    } else if (totalStudyTime < 5 && period === 'weekly') {
      recommendations.push('Try to increase study time for better learning outcomes');
    }

    // Distraction analysis
    const allDistractions = Object.values(subjectAnalysis).flatMap((s) => s.distractions);
    const distractionFreq: Record<string, number> = {};
    allDistractions.forEach((d) => {
      distractionFreq[d] = (distractionFreq[d] || 0) + 1;
    });

    const topDistractions = Object.entries(distractionFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([d]) => d);

    if (topDistractions.length > 0) {
      keyFindings.push(`Top distractions: ${topDistractions.join(', ')}`);
      recommendations.push(
        `Address these distractions: ${topDistractions.join(', ')}`
      );
    }

    // Subject-specific insights
    Object.entries(subjectAnalysis).forEach(([subject, data]) => {
      const avgSubjectFocus = data.focusLevels.length > 0
        ? (data.focusLevels.reduce((a, b) => a + b, 0) / data.focusLevels.length)
        : 0;

      if (avgSubjectFocus < 5) {
        recommendations.push(
          `${subject}: Focus level is low, consider shorter sessions for this subject`
        );
      }

      const uniqueTopics = [...new Set(data.topics)];
      if (uniqueTopics.length > 0) {
        keyFindings.push(`${subject}: Covered ${uniqueTopics.length} unique topics`);
      }
    });

    // Productivity insights
    if (avgProductivity >= 8) {
      keyFindings.push('Excellent productivity! Maintain this pace');
    } else if (avgProductivity < 5) {
      recommendations.push('Consider breaking sessions into smaller, focused chunks');
      recommendations.push('Review your study environment for optimization');
    }

    // Session frequency
    const sessionsPerDay = sessions.length / (period === 'daily' ? 1 : period === 'weekly' ? 7 : 30);
    if (sessionsPerDay < 1) {
      recommendations.push('Try to have at least one study session per day');
    }

    const summary = `
You completed ${sessions.length} study ${sessions.length === 1 ? 'session' : 'sessions'} in this ${period} period.
Total study time: ${totalStudyTime.toFixed(1)} hours
Average focus level: ${avgFocusLevel.toFixed(1)}/10
Average productivity: ${avgProductivity.toFixed(1)}/10

${keyFindings.length > 0 ? 'Key Findings:\n' + keyFindings.map(f => `• ${f}`).join('\n') : ''}
    `.trim();

    return NextResponse.json({
      insights: {
        summary,
        recommendations,
        keyFindings,
        metrics: {
          totalSessions: sessions.length,
          totalStudyTime: parseFloat(totalStudyTime.toFixed(1)),
          avgFocusLevel: parseFloat(avgFocusLevel.toFixed(1)),
          avgProductivity: parseFloat(avgProductivity.toFixed(1)),
        },
        subjectBreakdown: Object.entries(subjectAnalysis).map(([subject, data]) => ({
          subject,
          sessions: data.sessions,
          totalTime: parseFloat((data.totalTime).toFixed(1)),
        })),
      },
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
