import { useState, useEffect, useCallback } from 'react';
import {
  Reminder,
  ReminderPreferences,
  DEFAULT_REMINDER_PREFERENCES,
  generateAutomaticReminders,
  shouldDisplayReminder,
  sortReminders,
} from '../utils/reminders';
import { useAuth } from '../contexts/useAuth';

const REMINDERS_STORAGE_KEY = 'sleep_intervention_reminders';
const PREFERENCES_STORAGE_KEY = 'sleep_intervention_reminder_preferences';

/**
 * Hook for managing reminders and notifications
 */
export function useReminders() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [preferences, setPreferences] = useState<ReminderPreferences>(DEFAULT_REMINDER_PREFERENCES);
  const [loading, setLoading] = useState(true);

  // Load reminders and preferences from localStorage
  useEffect(() => {
    if (!user) {
      setReminders([]);
      setPreferences(DEFAULT_REMINDER_PREFERENCES);
      setLoading(false);
      return;
    }

    const storageKey = `${REMINDERS_STORAGE_KEY}_${user.id}`;
    const prefsKey = `${PREFERENCES_STORAGE_KEY}_${user.id}`;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setReminders(parsed);
      }

      const storedPrefs = localStorage.getItem(prefsKey);
      if (storedPrefs) {
        const parsedPrefs = JSON.parse(storedPrefs);
        setPreferences(parsedPrefs);
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Save reminders to localStorage
  const saveReminders = useCallback((newReminders: Reminder[]) => {
    if (!user) return;

    const storageKey = `${REMINDERS_STORAGE_KEY}_${user.id}`;
    localStorage.setItem(storageKey, JSON.stringify(newReminders));
    setReminders(newReminders);
  }, [user]);

  // Save preferences to localStorage
  const savePreferences = useCallback((newPreferences: ReminderPreferences) => {
    if (!user) return;

    const prefsKey = `${PREFERENCES_STORAGE_KEY}_${user.id}`;
    localStorage.setItem(prefsKey, JSON.stringify(newPreferences));
    setPreferences(newPreferences);
  }, [user]);

  // Add a new reminder
  const addReminder = useCallback((reminder: Omit<Reminder, 'id' | 'createdAt' | 'completed' | 'dismissed'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: `custom-${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
      completed: false,
      dismissed: false,
    };

    saveReminders([...reminders, newReminder]);
  }, [reminders, saveReminders]);

  // Mark reminder as completed
  const completeReminder = useCallback((id: string) => {
    const updated = reminders.map(r => 
      r.id === id ? { ...r, completed: true } : r
    );
    saveReminders(updated);
  }, [reminders, saveReminders]);

  // Dismiss reminder
  const dismissReminder = useCallback((id: string) => {
    const updated = reminders.map(r => 
      r.id === id ? { ...r, dismissed: true } : r
    );
    saveReminders(updated);
  }, [reminders, saveReminders]);

  // Delete reminder
  const deleteReminder = useCallback((id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    saveReminders(updated);
  }, [reminders, saveReminders]);

  // Clear old reminders (older than 7 days)
  const clearOldReminders = useCallback(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const updated = reminders.filter(r => {
      const createdDate = new Date(r.createdAt);
      return createdDate >= sevenDaysAgo || (!r.completed && !r.dismissed);
    });

    saveReminders(updated);
  }, [reminders, saveReminders]);

  // Refresh automatic reminders
  const refreshAutomaticReminders = useCallback((
    lastSleepLogDate: string | null,
    currentStreak: number,
    incompleteModules: number
  ) => {
    // Generate new automatic reminders
    const newAutoReminders = generateAutomaticReminders(
      lastSleepLogDate,
      currentStreak,
      incompleteModules,
      preferences
    );

    // Remove old automatic reminders (keep custom ones)
    const customReminders = reminders.filter(r => r.type === 'custom' || r.type === 'appointment');

    // Merge with new automatic reminders (avoid duplicates by id)
    const existingIds = new Set(customReminders.map(r => r.id));
    const uniqueNewReminders = newAutoReminders.filter(r => !existingIds.has(r.id));

    saveReminders([...customReminders, ...uniqueNewReminders]);
  }, [reminders, preferences, saveReminders]);

  // Get active reminders (not completed or dismissed)
  const activeReminders = reminders.filter(shouldDisplayReminder);
  const sortedActiveReminders = sortReminders(activeReminders);

  // Count of unread/active reminders
  const activeCount = activeReminders.length;

  return {
    reminders: sortedActiveReminders,
    allReminders: reminders,
    activeCount,
    preferences,
    loading,
    addReminder,
    completeReminder,
    dismissReminder,
    deleteReminder,
    clearOldReminders,
    refreshAutomaticReminders,
    updatePreferences: savePreferences,
  };
}
