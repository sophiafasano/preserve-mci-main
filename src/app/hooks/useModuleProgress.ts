import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../utils/storage';

/**
 * Module Progress Data Structure
 */
export interface ModuleProgressData {
  videoWatched: boolean;
  quizCompleted: boolean;
  quizScore?: number; // Percentage score (0-100)
  quizAnswers?: Record<string, number>; // questionId -> selected answer index
  exerciseCompleted: boolean;
  notes: string;
  completedAt: string | null;
  lastAccessed: string;
  progress: number; // 0-100 percentage
}

/**
 * All modules progress storage
 */
export interface AllModulesProgress {
  [moduleId: string]: ModuleProgressData;
}

/**
 * Default module progress state
 */
const DEFAULT_MODULE_PROGRESS: ModuleProgressData = {
  videoWatched: false,
  quizCompleted: false,
  exerciseCompleted: false,
  notes: '',
  completedAt: null,
  lastAccessed: new Date().toISOString(),
  progress: 0,
};

/**
 * Hook for managing module progress with localStorage persistence
 * Provides easy-to-use functions for tracking video, exercise, and notes completion
 */
export function useModuleProgress(moduleId: string) {
  const [allProgress, setAllProgress] = useLocalStorage<AllModulesProgress>(
    STORAGE_KEYS.MODULE_PROGRESS,
    {}
  );

  // Get current module's progress
  const moduleProgress = useMemo(() => {
    return allProgress[moduleId] || DEFAULT_MODULE_PROGRESS;
  }, [allProgress, moduleId]);

  /**
   * Mark video as watched
   */
  const markVideoComplete = useCallback(() => {
    setAllProgress((prev) => {
      const current = prev[moduleId] || DEFAULT_MODULE_PROGRESS;
      const videoWatched = true;
      const progress = calculateProgress(
        videoWatched,
        current.quizCompleted,
        current.exerciseCompleted,
        current.notes
      );

      return {
        ...prev,
        [moduleId]: {
          ...current,
          videoWatched,
          progress,
          lastAccessed: new Date().toISOString(),
        },
      };
    });
  }, [moduleId, setAllProgress]);

  /**
   * Mark quiz as completed
   */
  const markQuizComplete = useCallback(
    (score: number, answers: Record<string, number>) => {
      setAllProgress((prev) => {
        const current = prev[moduleId] || DEFAULT_MODULE_PROGRESS;
        const quizCompleted = true;
        const progress = calculateProgress(
          current.videoWatched,
          quizCompleted,
          current.exerciseCompleted,
          current.notes
        );

        return {
          ...prev,
          [moduleId]: {
            ...current,
            quizCompleted,
            quizScore: score,
            quizAnswers: answers,
            progress,
            lastAccessed: new Date().toISOString(),
          },
        };
      });
    },
    [moduleId, setAllProgress]
  );

  /**
   * Mark exercise as completed
   */
  const markExerciseComplete = useCallback(() => {
    setAllProgress((prev) => {
      const current = prev[moduleId] || DEFAULT_MODULE_PROGRESS;
      const exerciseCompleted = true;
      const progress = calculateProgress(
        current.videoWatched,
        current.quizCompleted,
        exerciseCompleted,
        current.notes
      );

      return {
        ...prev,
        [moduleId]: {
          ...current,
          exerciseCompleted,
          progress,
          lastAccessed: new Date().toISOString(),
        },
      };
    });
  }, [moduleId, setAllProgress]);

  /**
   * Save module notes
   */
  const saveNotes = useCallback(
    (notes: string) => {
      setAllProgress((prev) => {
        const current = prev[moduleId] || DEFAULT_MODULE_PROGRESS;
        const progress = calculateProgress(
          current.videoWatched,
          current.quizCompleted,
          current.exerciseCompleted,
          notes
        );

        return {
          ...prev,
          [moduleId]: {
            ...current,
            notes,
            progress,
            lastAccessed: new Date().toISOString(),
          },
        };
      });
    },
    [moduleId, setAllProgress]
  );

  /**
   * Mark entire module as complete
   */
  const markModuleComplete = useCallback(() => {
    setAllProgress((prev) => {
      const current = prev[moduleId] || DEFAULT_MODULE_PROGRESS;

      return {
        ...prev,
        [moduleId]: {
          ...current,
          videoWatched: true,
          quizCompleted: true,
          exerciseCompleted: true,
          completedAt: new Date().toISOString(),
          progress: 100,
          lastAccessed: new Date().toISOString(),
        },
      };
    });
  }, [moduleId, setAllProgress]);

  /**
   * Reset module progress
   */
  const resetModule = useCallback(() => {
    setAllProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[moduleId];
      return newProgress;
    });
  }, [moduleId, setAllProgress]);

  /**
   * Update last accessed time
   */
  const updateLastAccessed = useCallback(() => {
    setAllProgress((prev) => {
      const current = prev[moduleId] || DEFAULT_MODULE_PROGRESS;

      return {
        ...prev,
        [moduleId]: {
          ...current,
          lastAccessed: new Date().toISOString(),
        },
      };
    });
  }, [moduleId, setAllProgress]);

  /**
   * Check if module is complete
   */
  const isModuleComplete = useMemo(() => {
    return moduleProgress.videoWatched && moduleProgress.exerciseCompleted;
  }, [moduleProgress]);

  /**
   * Get overall progress across all modules
   */
  const overallProgress = useMemo(() => {
    const modules = Object.values(allProgress);
    if (modules.length === 0) return 0;

    const totalProgress = modules.reduce((sum, module) => sum + module.progress, 0);
    return Math.round(totalProgress / modules.length);
  }, [allProgress]);

  /**
   * Get completed modules count
   */
  const completedModulesCount = useMemo(() => {
    return Object.values(allProgress).filter((module) => module.completedAt !== null)
      .length;
  }, [allProgress]);

  return {
    // Current module data
    moduleProgress,
    isModuleComplete,

    // Actions
    markVideoComplete,
    markQuizComplete,
    markExerciseComplete,
    saveNotes,
    markModuleComplete,
    resetModule,
    updateLastAccessed,

    // Overall stats
    allProgress,
    overallProgress,
    completedModulesCount,
  };
}

/**
 * Calculate progress percentage based on completion status
 * Video: 50%, Quiz: 30%, Exercise: 15%, Notes: 5%
 */
function calculateProgress(
  videoWatched: boolean,
  quizCompleted: boolean,
  exerciseCompleted: boolean,
  notes: string
): number {
  let progress = 0;

  if (videoWatched) progress += 50;
  if (quizCompleted) progress += 30;
  if (exerciseCompleted) progress += 15;
  if (notes.trim().length > 0) progress += 5;

  return progress;
}

/**
 * Hook to get all modules summary (useful for dashboard/overview)
 */
export function useAllModulesProgress() {
  const [allProgress] = useLocalStorage<AllModulesProgress>(
    STORAGE_KEYS.MODULE_PROGRESS,
    {}
  );

  const totalModules = 8; // Total weeks in program

  const stats = useMemo(() => {
    const modules = Object.values(allProgress);
    const completedCount = modules.filter((m) => m.completedAt !== null).length;
    const inProgressCount = modules.filter(
      (m) => m.progress > 0 && m.completedAt === null
    ).length;
    const totalProgress = modules.reduce((sum, m) => sum + m.progress, 0);
    const averageProgress =
      modules.length > 0 ? Math.round(totalProgress / totalModules) : 0;

    return {
      totalModules,
      completedCount,
      inProgressCount,
      notStartedCount: totalModules - completedCount - inProgressCount,
      averageProgress,
      allModules: allProgress,
    };
  }, [allProgress, totalModules]);

  return stats;
}