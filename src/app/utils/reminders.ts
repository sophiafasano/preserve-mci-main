/**
 * Reminders & Engagement System
 * Manages notifications, reminders, and engagement tracking
 */

export type ReminderType = 
  | 'sleep_log'
  | 'module_completion'
  | 'appointment'
  | 'streak_maintenance'
  | 'check_in'
  | 'custom';

export type ReminderPriority = 'low' | 'medium' | 'high';

export interface Reminder {
  id: string;
  type: ReminderType;
  title: string;
  message: string;
  priority: ReminderPriority;
  dueDate?: string;
  dueTime?: string;
  completed: boolean;
  dismissed: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface ReminderPreferences {
  sleepLogReminders: boolean;
  sleepLogTime: string; // HH:MM format
  moduleReminders: boolean;
  streakReminders: boolean;
  appointmentReminders: boolean;
  dailyDigest: boolean;
  digestTime: string; // HH:MM format
}

export const DEFAULT_REMINDER_PREFERENCES: ReminderPreferences = {
  sleepLogReminders: true,
  sleepLogTime: '09:00',
  moduleReminders: true,
  streakReminders: true,
  appointmentReminders: true,
  dailyDigest: false,
  digestTime: '08:00',
};

/**
 * Generate automatic reminders based on user activity
 */
export function generateAutomaticReminders(
  lastSleepLogDate: string | null,
  currentStreak: number,
  incompleteModules: number,
  preferences: ReminderPreferences
): Reminder[] {
  const reminders: Reminder[] = [];
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Sleep log reminder
  if (preferences.sleepLogReminders) {
    const lastLog = lastSleepLogDate ? new Date(lastSleepLogDate) : null;
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    // If no log for yesterday, remind them
    if (!lastLog || lastLog < yesterday) {
      reminders.push({
        id: `sleep-log-${today}`,
        type: 'sleep_log',
        title: 'Log Your Sleep',
        message: "Don't forget to log last night's sleep to maintain your tracking streak!",
        priority: 'high',
        dueDate: today,
        dueTime: preferences.sleepLogTime,
        completed: false,
        dismissed: false,
        createdAt: now.toISOString(),
        actionUrl: '/patient/dashboard',
        actionLabel: 'Log Sleep Now',
      });
    }
  }

  // Streak maintenance reminder
  if (preferences.streakReminders && currentStreak >= 3) {
    const lastLog = lastSleepLogDate ? new Date(lastSleepLogDate) : null;
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    if (!lastLog || lastLog < yesterday) {
      reminders.push({
        id: `streak-${today}`,
        type: 'streak_maintenance',
        title: 'Keep Your Streak Alive!',
        message: `You have a ${currentStreak}-day logging streak. Don't break it!`,
        priority: 'medium',
        dueDate: today,
        completed: false,
        dismissed: false,
        createdAt: now.toISOString(),
        actionUrl: '/patient/dashboard',
        actionLabel: 'Log Sleep',
      });
    }
  }

  // Module completion reminder
  if (preferences.moduleReminders && incompleteModules > 0) {
    reminders.push({
      id: `module-${today}`,
      type: 'module_completion',
      title: 'Continue Your Learning',
      message: `You have ${incompleteModules} module${incompleteModules > 1 ? 's' : ''} in progress. Keep building your sleep knowledge!`,
      priority: 'low',
      dueDate: today,
      completed: false,
      dismissed: false,
      createdAt: now.toISOString(),
      actionUrl: '/modules',
      actionLabel: 'View Modules',
    });
  }

  return reminders;
}

/**
 * Check if a reminder should be displayed now
 */
export function shouldDisplayReminder(reminder: Reminder): boolean {
  if (reminder.completed || reminder.dismissed) return false;

  const now = new Date();
  
  if (reminder.dueDate) {
    const dueDate = new Date(reminder.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Only show if due today or overdue
    if (dueDate > today) return false;
  }

  return true;
}

/**
 * Get reminder icon based on type
 */
export function getReminderIcon(type: ReminderType): string {
  switch (type) {
    case 'sleep_log':
      return 'Moon';
    case 'module_completion':
      return 'BookOpen';
    case 'appointment':
      return 'Calendar';
    case 'streak_maintenance':
      return 'Flame';
    case 'check_in':
      return 'MessageSquare';
    default:
      return 'Bell';
  }
}

/**
 * Get reminder color based on priority
 */
export function getReminderColor(priority: ReminderPriority): string {
  switch (priority) {
    case 'high':
      return 'red';
    case 'medium':
      return 'amber';
    case 'low':
      return 'blue';
    default:
      return 'gray';
  }
}

/**
 * Sort reminders by priority and due date
 */
export function sortReminders(reminders: Reminder[]): Reminder[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 };

  return [...reminders].sort((a, b) => {
    // First by priority
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then by due date (earlier first)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;

    // Finally by creation date (newer first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/**
 * Calculate engagement score (0-100)
 */
export function calculateEngagementScore(
  sleepLogsCount: number,
  currentStreak: number,
  modulesCompleted: number,
  totalModules: number,
  messagesRead: number
): number {
  let score = 0;

  // Sleep logging (40 points max)
  score += Math.min(40, sleepLogsCount * 2);

  // Current streak (20 points max)
  score += Math.min(20, currentStreak * 2);

  // Module completion (30 points max)
  const moduleProgress = totalModules > 0 ? (modulesCompleted / totalModules) * 30 : 0;
  score += moduleProgress;

  // Message engagement (10 points max)
  score += Math.min(10, messagesRead);

  return Math.min(100, Math.round(score));
}
