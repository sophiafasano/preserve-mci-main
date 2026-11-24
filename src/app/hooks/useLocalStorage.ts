import { useState, useEffect, useCallback } from 'react';
import { getFromStorage, saveToStorage } from '../utils/storage';

/**
 * Generic hook for managing localStorage state
 * Automatically syncs state with localStorage and handles errors
 * 
 * @param key - localStorage key
 * @param initialValue - default value if nothing is stored
 * @returns [storedValue, setValue, clearValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Initialize state with value from localStorage or initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    return getFromStorage(key, initialValue);
  });

  // Update localStorage whenever storedValue changes
  useEffect(() => {
    saveToStorage(key, storedValue);
  }, [key, storedValue]);

  // Enhanced setValue that supports both direct values and updater functions
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prevValue) => {
          const valueToStore = value instanceof Function ? value(prevValue) : value;
          return valueToStore;
        });
      } catch (error) {
        console.error(`Error setting localStorage value for key "${key}":`, error);
      }
    },
    [key] // Remove storedValue from dependencies - use the callback form instead
  );

  // Clear the stored value and reset to initial value
  const clearValue = useCallback(() => {
    setStoredValue(initialValue);
    saveToStorage(key, initialValue);
  }, [key, initialValue]);

  return [storedValue, setValue, clearValue];
}