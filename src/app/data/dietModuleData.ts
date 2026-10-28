export type ModuleWeekKey = 'week1';

export interface ModuleQueueVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  captionUrl?: string;
  fileName: string;
}

export interface ModuleResource {
  id: string;
  title: string;
  videoUrl: string;
  captionUrl?: string;
  fileName: string;
  icon: 'BedDouble' | 'Moon' | 'Wind';
}

export interface WeekModuleData {
  title: string;
  subtitle: string;
  duration: string;
  description: string;
  queue: ModuleQueueVideo[];
  resources: ModuleResource[];
}

export const dietModuleData: Record<ModuleWeekKey, WeekModuleData> = {
  week1:{
    title: 'Food Wellness)',
    subtitle: 'Placeholder',
    duration: '5 min',
    description:
      'Placeholder',
    queue: [
      {
        id: 'w1_v1',
        title: 'Food and Your Brain',
        description:
          'Placeholder',
        duration: '~5 min',
        videoUrl: 'https://www.youtube.com/embed/8vn4JuJiVJE?si=mguuwfxFvuKqkUFb',
        fileName: 'Diet_Vid_1',
      },
      {
        id: 'w1_v2',
        title: 'What you Eat: The MIND Diet',
        description:
          'Placeholder',
        duration: '~2 min',
        videoUrl: 'https://www.youtube.com/embed/Ubq5FoSbB6E?si=3KUi1_ydEwh0fEqw',
        fileName: 'Diet_Vid_2',
      },
      {
        id: 'w1_v3',
        title: 'When you Eat: Time-Restricted Eating',
        description:
          'Placeholder',
        duration: '~2 min',
        videoUrl: 'https://www.youtube.com/embed/hGkovLd7Puw?si=_7bj7rWQ3C8tSt9k',
        fileName: 'Diet_Vid_3',
      },
      {
        id: 'w1_v4',
        title: 'Making Healthy Eating Work in Real Life',
        description:
          'Placeholder',
        duration: '~3 min',
        videoUrl: 'https://www.youtube.com/embed/XWLQ8dlVqGg?si=aZpDOfkBPup4B-lc',
        fileName: 'Diet_Vid_4',
      },
      {
        id: 'w1_v4',
        title: 'Making Healthy Eating Work in Real Life',
        description:
          'Placeholder',
        duration: '~3 min',
        videoUrl: 'https://www.youtube.com/embed/XWLQ8dlVqGg?si=aZpDOfkBPup4B-lc',
        fileName: 'Diet_Vid_4',
      },
      {
        id: 'w1_v5',
        title: 'Recap and Your Plan for This Week',
        description:
          'Placeholder',
        duration: '~3 min',
        videoUrl: 'https://www.youtube.com/embed/gk3nZoOwJ10?si=txOVbW6VPISf70fc',
        fileName: 'Diet_Vid_5',
      },
    ],
  },
};

export const moduleWeekOrder: ModuleWeekKey[] = ['week1',];

export function toWeekKeyFromSlug(slug: string): ModuleWeekKey | null {
  const normalized = slug.toLowerCase();
  if (normalized === 'week-1') return 'week1';
  return null;
}

export function weekSlugFromKey(weekKey: ModuleWeekKey): string {
  return weekKey.replace('week', 'week-');
}

export function weekNumberFromKey(weekKey: ModuleWeekKey): number {
  return Number.parseInt(weekKey.replace('week', ''), 10);
}
