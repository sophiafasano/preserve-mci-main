/**
 * Sleep Analytics Utilities
 * Advanced analytics and insights for sleep data
 */

export interface SleepLog {
  date: string;
  hoursSlept: number;
  sleepQuality: number;
  bedtime?: string;
  wakeTime?: string;
  notes?: string;
}

export interface SleepInsight {
  type: 'positive' | 'warning' | 'info';
  title: string;
  description: string;
  recommendation?: string;
}

export interface SleepPattern {
  weekdayAverage: number;
  weekendAverage: number;
  consistencyScore: number;
  optimalRange: { min: number; max: number };
  trend: 'improving' | 'declining' | 'stable';
}

export interface SleepAnalytics {
  totalLogs: number;
  averageHours: number;
  averageQuality: number;
  bestQuality: number;
  worstQuality: number;
  currentStreak: number;
  longestStreak: number;
  patterns: SleepPattern;
  insights: SleepInsight[];
  weeklyComparison: WeeklyData[];
}

export interface WeeklyData {
  week: string;
  avgHours: number;
  avgQuality: number;
  logsCount: number;
}

/**
 * Calculate sleep consistency score (0-100)
 * Higher score = more consistent sleep schedule
 */
export function calculateConsistencyScore(logs: SleepLog[]): number {
  if (logs.length < 3) return 0;

  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const recentLogs = sortedLogs.slice(-14); // Last 14 days

  if (recentLogs.length < 3) return 0;

  // Calculate standard deviation of sleep hours
  const hours = recentLogs.map(log => log.hoursSlept);
  const mean = hours.reduce((sum, h) => sum + h, 0) / hours.length;
  const variance = hours.reduce((sum, h) => sum + Math.pow(h - mean, 2), 0) / hours.length;
  const stdDev = Math.sqrt(variance);

  // Convert to 0-100 score (lower stdDev = higher consistency)
  // StdDev of 0 = 100, StdDev of 3+ = 0
  const consistencyScore = Math.max(0, Math.min(100, 100 - (stdDev * 33.33)));

  return Math.round(consistencyScore);
}

/**
 * Detect weekday vs weekend patterns
 */
export function analyzeWeekdayWeekendPattern(logs: SleepLog[]): { weekdayAvg: number; weekendAvg: number } {
  const weekdayLogs = logs.filter(log => {
    const day = new Date(log.date).getDay();
    return day >= 1 && day <= 5; // Monday-Friday
  });

  const weekendLogs = logs.filter(log => {
    const day = new Date(log.date).getDay();
    return day === 0 || day === 6; // Saturday-Sunday
  });

  const weekdayAvg = weekdayLogs.length > 0
    ? weekdayLogs.reduce((sum, log) => sum + log.hoursSlept, 0) / weekdayLogs.length
    : 0;

  const weekendAvg = weekendLogs.length > 0
    ? weekendLogs.reduce((sum, log) => sum + log.hoursSlept, 0) / weekendLogs.length
    : 0;

  return { weekdayAvg, weekendAvg };
}

/**
 * Detect sleep trend over time
 */
export function detectSleepTrend(logs: SleepLog[]): 'improving' | 'declining' | 'stable' {
  if (logs.length < 7) return 'stable';

  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Compare first half vs second half
  const midpoint = Math.floor(sortedLogs.length / 2);
  const firstHalf = sortedLogs.slice(0, midpoint);
  const secondHalf = sortedLogs.slice(midpoint);

  const firstAvg = firstHalf.reduce((sum, log) => sum + log.hoursSlept, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, log) => sum + log.hoursSlept, 0) / secondHalf.length;

  const difference = secondAvg - firstAvg;

  if (difference > 0.5) return 'improving';
  if (difference < -0.5) return 'declining';
  return 'stable';
}

/**
 * Generate insights based on sleep data
 */
export function generateInsights(logs: SleepLog[], stats: Partial<SleepAnalytics>): SleepInsight[] {
  const insights: SleepInsight[] = [];

  // Insight: Average hours
  if (stats.averageHours && stats.averageHours >= 7 && stats.averageHours <= 9) {
    insights.push({
      type: 'positive',
      title: 'Optimal Sleep Duration',
      description: `You're averaging ${stats.averageHours.toFixed(1)} hours of sleep, which is within the recommended 7-9 hours for adults.`,
      recommendation: 'Keep maintaining this healthy sleep duration.',
    });
  } else if (stats.averageHours && stats.averageHours < 6) {
    insights.push({
      type: 'warning',
      title: 'Insufficient Sleep',
      description: `Your average of ${stats.averageHours.toFixed(1)} hours is below the recommended 7-9 hours.`,
      recommendation: 'Try going to bed 30 minutes earlier each night this week.',
    });
  } else if (stats.averageHours && stats.averageHours > 10) {
    insights.push({
      type: 'info',
      title: 'Extended Sleep Duration',
      description: `You're sleeping an average of ${stats.averageHours.toFixed(1)} hours per night.`,
      recommendation: 'While sleep is important, excessive sleep may indicate other health issues. Consider discussing with your clinician.',
    });
  }

  // Insight: Sleep quality (scale 1-10)
  if (stats.averageQuality && stats.averageQuality >= 8) {
    insights.push({
      type: 'positive',
      title: 'Excellent Sleep Quality',
      description: 'Your sleep quality ratings are consistently high.',
      recommendation: 'Continue your current sleep routine and hygiene practices.',
    });
  } else if (stats.averageQuality && stats.averageQuality < 5) {
    insights.push({
      type: 'warning',
      title: 'Low Sleep Quality',
      description: 'Your sleep quality scores suggest room for improvement.',
      recommendation: 'Review the sleep hygiene modules and consider factors like room temperature, noise, and pre-bed routines.',
    });
  }

  // Insight: Consistency
  const consistency = calculateConsistencyScore(logs);
  if (consistency >= 80) {
    insights.push({
      type: 'positive',
      title: 'Consistent Sleep Schedule',
      description: `Your sleep consistency score is ${consistency}/100, indicating a regular sleep pattern.`,
      recommendation: 'Excellent! Consistency is key to healthy sleep.',
    });
  } else if (consistency < 50) {
    insights.push({
      type: 'warning',
      title: 'Inconsistent Sleep Pattern',
      description: `Your sleep consistency score is ${consistency}/100, showing variability in your sleep schedule.`,
      recommendation: 'Try to maintain the same bedtime and wake time, even on weekends.',
    });
  }

  // Insight: Streak
  if (stats.currentStreak && stats.currentStreak >= 7) {
    insights.push({
      type: 'positive',
      title: 'Great Logging Streak!',
      description: `You've logged sleep for ${stats.currentStreak} consecutive days.`,
      recommendation: 'Keep up the excellent tracking habit!',
    });
  }

  // Insight: Weekday vs Weekend
  const { weekdayAvg, weekendAvg } = analyzeWeekdayWeekendPattern(logs);
  if (weekdayAvg > 0 && weekendAvg > 0) {
    const difference = Math.abs(weekendAvg - weekdayAvg);
    if (difference > 2) {
      insights.push({
        type: 'info',
        title: 'Weekend Sleep Pattern Detected',
        description: `You sleep ${difference.toFixed(1)} hours ${weekendAvg > weekdayAvg ? 'more' : 'less'} on weekends compared to weekdays.`,
        recommendation: 'Large differences in sleep duration between weekdays and weekends can disrupt your circadian rhythm. Try to keep a more consistent schedule.',
      });
    }
  }

  // Insight: Trend
  const trend = detectSleepTrend(logs);
  if (trend === 'improving') {
    insights.push({
      type: 'positive',
      title: 'Sleep Duration Improving',
      description: 'Your sleep duration has been increasing over time.',
      recommendation: 'Great progress! Continue building on these positive changes.',
    });
  } else if (trend === 'declining') {
    insights.push({
      type: 'warning',
      title: 'Sleep Duration Declining',
      description: 'Your sleep duration has been decreasing recently.',
      recommendation: 'Consider what factors might be affecting your sleep and review your sleep hygiene practices.',
    });
  }

  return insights;
}

/**
 * Calculate comprehensive sleep analytics
 */
export function calculateSleepAnalytics(logs: SleepLog[]): SleepAnalytics {
  if (logs.length === 0) {
    return {
      totalLogs: 0,
      averageHours: 0,
      averageQuality: 0,
      bestQuality: 0,
      worstQuality: 0,
      currentStreak: 0,
      longestStreak: 0,
      patterns: {
        weekdayAverage: 0,
        weekendAverage: 0,
        consistencyScore: 0,
        optimalRange: { min: 7, max: 9 },
        trend: 'stable',
      },
      insights: [],
      weeklyComparison: [],
    };
  }

  const totalHours = logs.reduce((sum, log) => sum + log.hoursSlept, 0);
  const totalQuality = logs.reduce((sum, log) => sum + log.sleepQuality, 0);
  const averageHours = parseFloat((totalHours / logs.length).toFixed(1));
  const averageQuality = parseFloat((totalQuality / logs.length).toFixed(1));

  const qualities = logs.map(log => log.sleepQuality);
  const bestQuality = Math.max(...qualities);
  const worstQuality = Math.min(...qualities);

  // Build a set of log days for O(1) lookup
  const logDaySet = new Set(
    logs.map((log) => {
      const d = new Date(log.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  // Current streak: count consecutive days backwards from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let currentStreak = 0;
  const checkDate = new Date(today);
  while (logDaySet.has(checkDate.getTime())) {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Longest streak: scan chronologically for the longest consecutive run
  const sortedAsc = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = 0; i < sortedAsc.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(sortedAsc[i - 1].date);
      prev.setHours(0, 0, 0, 0);
      const cur = new Date(sortedAsc[i].date);
      cur.setHours(0, 0, 0, 0);
      const diffDays = Math.round((cur.getTime() - prev.getTime()) / 86400000);
      tempStreak = diffDays === 1 ? tempStreak + 1 : 1;
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  // Patterns
  const { weekdayAvg, weekendAvg } = analyzeWeekdayWeekendPattern(logs);
  const consistency = calculateConsistencyScore(logs);
  const trend = detectSleepTrend(logs);

  // Weekly comparison (last 4 weeks)
  const weeklyComparison: WeeklyData[] = [];
  const now = new Date();
  
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekLogs = logs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= weekStart && logDate < weekEnd;
    });

    const avgHours = weekLogs.length > 0
      ? parseFloat((weekLogs.reduce((sum, log) => sum + log.hoursSlept, 0) / weekLogs.length).toFixed(1))
      : 0;

    const avgQuality = weekLogs.length > 0
      ? parseFloat((weekLogs.reduce((sum, log) => sum + log.sleepQuality, 0) / weekLogs.length).toFixed(1))
      : 0;

    weeklyComparison.push({
      week: `Week ${4 - i}`,
      avgHours,
      avgQuality,
      logsCount: weekLogs.length,
    });
  }

  const analytics: SleepAnalytics = {
    totalLogs: logs.length,
    averageHours,
    averageQuality,
    bestQuality,
    worstQuality,
    currentStreak,
    longestStreak,
    patterns: {
      weekdayAverage: parseFloat(weekdayAvg.toFixed(1)),
      weekendAverage: parseFloat(weekendAvg.toFixed(1)),
      consistencyScore: consistency,
      optimalRange: { min: 7, max: 9 },
      trend,
    },
    insights: [],
    weeklyComparison,
  };

  // Generate insights
  analytics.insights = generateInsights(logs, analytics);

  return analytics;
}
