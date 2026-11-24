/**
 * Module Content Configuration for Weeks 1-4
 * Each module contains educational content for the sleep intervention program
 * Video URLs can be easily updated by modifying the videoUrl property
 */

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct answer
  explanation: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'worksheet' | 'guide' | 'checklist';
  url: string; // URL to download resource
  size?: string; // e.g., "2.5 MB"
}

export interface ModuleContent {
  weekNumber: number;
  totalWeeks: number;
  title: string;
  subtitle: string;
  estimatedTime: number; // in minutes
  introduction: {
    title: string;
    description: string;
    objectives: string[];
  };
  video: {
    title: string;
    duration: string;
    videoUrl: string; // YouTube URL - EASILY UPDATE THIS FOR EACH WEEK
    thumbnailColor: string;
    description: string;
  };
  quiz?: {
    title: string;
    description: string;
    questions: QuizQuestion[];
  };
  exercise?: {
    title: string;
    description: string;
    tasks: string[];
  };
  resources?: ResourceItem[];
  keyTakeaways?: string[];
}

export const cogengageModuleContent: Record<string, ModuleContent> = {
  '1': {
    weekNumber: 1,
    totalWeeks: 1,
    title: 'Cogengage',
    subtitle: 'The Foundation of Better Sleep and Cognitive Health',
    estimatedTime: 25,
    introduction: {
      title: "Welcome to Your Sleep Journey",
      description:
        'In this first week, we\'ll explore the fundamental relationship between sleep and cognitive health. You\'ll learn why quality sleep is especially important for managing Mild Cognitive Impairment and how this program can help you.',
      objectives: [
        'Understand the connection between sleep and cognitive function',
        'Learn about common sleep challenges with MCI',
        'Set personal sleep goals for the program',
        'Get familiar with the program structure and tools',
      ],
    },
    video: {
      title: 'Introduction to Sleep and Cognitive Health',
      duration: '10:15',
      videoUrl: 'https://www.youtube.com/watch?v=Y-x0efG1seA',
      thumbnailColor: 'from-purple-400 to-purple-600',
      description:
        'Dr. Sarah Chen introduces the science behind sleep and cognitive health, explaining how quality sleep supports memory, attention, and overall brain function.',
    },
    resources: [],  
  },

};

/**
 * Get module content by week number
 */
export function getModuleContent(weekNumber: string | number): ModuleContent | null {
  const content = cogengageModuleContent[weekNumber.toString()];
  return content || null;
}

/**
 * Get all modules as an array
 */
export function getAllModules(): ModuleContent[] {
  return Object.values(cogengageModuleContent);
}

/**
 * Get module navigation info (previous/next)
 */
export function getModuleNavigation(weekNumber: string | number) {
  const current = parseInt(weekNumber.toString());
  const totalWeeks = 1;

  return {
    hasPrevious: current > 1,
    hasNext: current < totalWeeks,
    previousWeek: current > 1 ? current - 1 : null,
    nextWeek: current < totalWeeks ? current + 1 : null,
  };
}