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
  exercise: {
    title: string;
    description: string;
    tasks: string[];
  };
  resources?: ResourceItem[];
  keyTakeaways: string[];
}

export const moduleContent: Record<string, ModuleContent> = {
  '1': {
    weekNumber: 1,
    totalWeeks: 4,
    title: 'Understanding Sleep and MCI; Introduction to Sleep Intervention',
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
    quiz: {
      title: 'Knowledge Check',
      description: 'Let\'s review what you learned about sleep and cognitive health.',
      questions: [
        {
          id: 'q1_1',
          question: 'Why is quality sleep particularly important for people with MCI?',
          options: [
            'It helps with memory consolidation and brain health',
            'It only affects physical health',
            'It has no special importance for MCI',
            'It prevents all cognitive decline'
          ],
          correctAnswer: 0,
          explanation: 'Quality sleep is crucial for memory consolidation and overall brain health, which is especially important when managing MCI.'
        },
        {
          id: 'q1_2',
          question: 'Which statement about sleep quality is true?',
          options: [
            'Only quantity matters, not quality',
            'Quality matters as much as quantity',
            'Quality doesn\'t matter at all',
            'You only need 3 hours of sleep'
          ],
          correctAnswer: 1,
          explanation: 'Both the quality and quantity of sleep are important for cognitive health and overall well-being.'
        },
        {
          id: 'q1_3',
          question: 'How long is this sleep intervention program?',
          options: [
            '4 weeks',
            '6 weeks',
            '8 weeks',
            '12 weeks'
          ],
          correctAnswer: 0,
          explanation: 'This program is designed as a 4-week intervention to help you develop sustainable sleep habits.'
        }
      ]
    },
    exercise: {
      title: 'Set Your Sleep Goals',
      description:
        'Reflect on your current sleep patterns and identify what you want to improve through this program.',
      tasks: [
        'What time do you typically go to bed?',
        'How many hours of sleep do you usually get?',
        'What sleep challenges do you currently face?',
        'What would "good sleep" look like for you?',
        'What is one specific goal you have for this program?',
      ],
    },
    resources: [
      {
        id: 'res1_1',
        title: 'Sleep and Brain Health Guide',
        description: 'A comprehensive guide explaining the connection between sleep and cognitive function.',
        type: 'guide',
        url: '#',
        size: '1.2 MB'
      },
      {
        id: 'res1_2',
        title: 'Personal Sleep Goals Worksheet',
        description: 'Use this worksheet to document your sleep goals and track your progress.',
        type: 'worksheet',
        url: '#',
        size: '850 KB'
      }
    ],
    keyTakeaways: [
      'Sleep plays a crucial role in memory consolidation and cognitive function',
      'Quality matters as much as quantity when it comes to sleep',
      'Small, consistent changes can make a big difference',
      'This 4-week program is designed specifically for your needs',
      'You\'re not alone - many people with MCI experience sleep challenges',
    ],
  },

  '2': {
    weekNumber: 2,
    totalWeeks: 4,
    title: 'Sleep Hygiene Fundamentals',
    subtitle: 'Building Healthy Sleep Habits',
    estimatedTime: 25,
    introduction: {
      title: "What You'll Learn This Week",
      description:
        'This week focuses on establishing strong sleep hygiene practices - the foundational habits that promote better sleep. You\'ll learn practical strategies you can implement immediately.',
      objectives: [
        'Master the principles of good sleep hygiene',
        'Create an optimal sleep environment',
        'Establish consistent sleep-wake schedules',
        'Identify and eliminate common sleep disruptors',
      ],
    },
    video: {
      title: 'Sleep Hygiene Essentials',
      duration: '12:30',
      videoUrl: 'https://www.youtube.com/watch?v=Y-x0efG1seA',
      thumbnailColor: 'from-purple-400 to-purple-600',
      description:
        'Learn the evidence-based practices that create the foundation for healthy sleep, from bedroom environment to daily routines.',
    },
    exercise: {
      title: 'Sleep Environment Audit',
      description:
        'Evaluate your bedroom and sleep environment using this comprehensive checklist.',
      tasks: [
        'Check bedroom temperature (ideal: 60-67°F / 15-19°C)',
        'Assess lighting levels and sources of light pollution',
        'Evaluate noise levels and consider sound management',
        'Review mattress, pillows, and bedding comfort',
        'Identify and remove electronic devices from bedroom',
      ],
    },
    keyTakeaways: [
      'Your bedroom should be cool, dark, and quiet',
      'Consistency in sleep schedule helps regulate your body clock',
      'Remove screens and electronics from the bedroom',
      'Invest in comfortable bedding and a supportive mattress',
      'Small environmental changes can have big impacts on sleep quality',
    ],
  },

  '3': {
    weekNumber: 3,
    totalWeeks: 4,
    title: 'Managing Nighttime Wakefulness',
    subtitle: 'Strategies for Staying Asleep',
    estimatedTime: 25,
    introduction: {
      title: "Addressing Middle-of-the-Night Wake-Ups",
      description:
        'Many people with MCI struggle with waking during the night. This week, you\'ll learn proven techniques to reduce nighttime awakenings and get back to sleep more quickly when they do occur.',
      objectives: [
        'Understand why nighttime awakenings happen',
        'Learn the "20-minute rule" for managing wakefulness',
        'Develop strategies to quiet a racing mind',
        'Create a plan for handling nighttime wake-ups',
      ],
    },
    video: {
      title: 'Managing Middle-of-the-Night Awakenings',
      duration: '11:45',
      videoUrl: 'https://www.youtube.com/watch?v=Y-x0efG1seA',
      thumbnailColor: 'from-purple-400 to-purple-600',
      description:
        'Dr. Chen explains the science of sleep cycles and shares practical techniques for reducing nighttime awakenings and falling back asleep faster.',
    },
    exercise: {
      title: 'Create Your Wake-Up Response Plan',
      description:
        'Design a personalized strategy for those times when you wake up during the night.',
      tasks: [
        'List calming activities you can do if you can\'t sleep (reading, gentle stretching, etc.)',
        'Identify a comfortable spot outside your bedroom for nighttime wakefulness',
        'Choose relaxing thoughts or memories to focus on',
        'Plan what NOT to do (checking phone, watching TV, etc.)',
        'Write down your "20-minute rule" action plan',
      ],
    },
    keyTakeaways: [
      'Nighttime awakenings are common and don\'t mean something is wrong',
      'Follow the 20-minute rule: if you can\'t sleep, get up',
      'Keep lights dim and activities calm if you wake at night',
      'Avoid checking the clock - it increases anxiety',
      'Have a consistent plan for nighttime wakefulness',
    ],
  },

  '4': {
    weekNumber: 4,
    totalWeeks: 4,
    title: 'Relaxation and Wind-Down Techniques',
    subtitle: 'Preparing Your Mind and Body for Sleep',
    estimatedTime: 30,
    introduction: {
      title: "Building a Calming Bedtime Routine",
      description:
        'This week focuses on relaxation techniques that signal your body it\'s time for sleep. You\'ll learn evidence-based methods to calm your mind and reduce pre-sleep anxiety.',
      objectives: [
        'Learn progressive muscle relaxation techniques',
        'Practice deep breathing exercises for sleep',
        'Create a personalized wind-down routine',
        'Understand the role of stress in sleep quality',
      ],
    },
    video: {
      title: 'Relaxation Techniques for Better Sleep',
      duration: '14:20',
      videoUrl: 'https://www.youtube.com/watch?v=Y-x0efG1seA',
      thumbnailColor: 'from-purple-400 to-purple-600',
      description:
        'Learn and practice guided relaxation techniques including progressive muscle relaxation, deep breathing, and visualization exercises designed for better sleep.',
    },
    exercise: {
      title: 'Design Your Wind-Down Routine',
      description:
        'Create a 30-60 minute pre-bed routine that helps you transition from day to night.',
      tasks: [
        'Choose 2-3 relaxing activities for your routine',
        'Set a consistent start time for your wind-down',
        'Identify activities to avoid before bed',
        'Plan your ideal sequence of wind-down activities',
        'Practice one relaxation technique from the video',
      ],
    },
    keyTakeaways: [
      'Start winding down 30-60 minutes before bedtime',
      'Progressive muscle relaxation can reduce physical tension',
      'Deep breathing activates your relaxation response',
      'Consistency in your routine helps your body recognize sleep signals',
      'Find relaxation techniques that work for you personally',
    ],
  },
};

/**
 * Get module content by week number
 */
export function getModuleContent(weekNumber: string | number): ModuleContent | null {
  const content = moduleContent[weekNumber.toString()];
  return content || null;
}

/**
 * Get all modules as an array
 */
export function getAllModules(): ModuleContent[] {
  return Object.values(moduleContent);
}

/**
 * Get module navigation info (previous/next)
 */
export function getModuleNavigation(weekNumber: string | number) {
  const current = parseInt(weekNumber.toString());
  const totalWeeks = 4;

  return {
    hasPrevious: current > 1,
    hasNext: current < totalWeeks,
    previousWeek: current > 1 ? current - 1 : null,
    nextWeek: current < totalWeeks ? current + 1 : null,
  };
}