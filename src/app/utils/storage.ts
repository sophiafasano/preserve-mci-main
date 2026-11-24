/**
 * Centralized localStorage utility functions
 * Provides type-safe storage operations with error handling
 */

// Storage keys - centralized for easy management
export const STORAGE_KEYS = {
  MODULE_PROGRESS: 'mii_module_progress_v2',
  SLEEP_LOGS: 'mii_sleep_logs_v2',
  USER_PREFERENCES: 'mii_user_preferences_v2',
  OVERALL_PROGRESS: 'mii_overall_progress_v2',
  PATIENT_CONNECTION: 'mii_patient_connection_v2',
  CARE_MESSAGES: 'mii_care_messages_v2',
  CLINICIAN_NOTES: 'mii_clinician_notes_v3',
} as const;

/**
 * Safely get data from localStorage with error handling
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
}

/**
 * Safely save data to localStorage with error handling
 */
export function saveToStorage<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Remove an item from localStorage
 */
export function removeFromStorage(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Clear all app-related data from localStorage
 */
export function clearAllStorage(): boolean {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
}