export type DietModuleWeekKey = 'week1';


export interface DietModuleQueueVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  captionUrl?: string;
  fileName: string;
}

export interface DietModuleResource {
  id: string;
  title: string;
  videoUrl: string;
  captionUrl?: string;
  fileName: string;
  icon: 'BedDouble' | 'Moon' | 'Wind';
}

export interface DietWeekModuleData {
  title: string;
  subtitle: string;
  duration: string;
  description: string;
  queue: DietModuleQueueVideo[];
  resources: DietModuleResource[];
}

export const dietModuleData: Record<DietModuleWeekKey, DietWeekModuleData> = {
  week1:{
    title: 'Food Wellness',
    subtitle: 'Placeholder',
    duration: '18 min',
    description:
      'Placeholder',
    queue: [
      {
        id: 'diet_w1_v1',
        title: 'Food and Your Brain',
        description:
          'Placeholder',
        duration: '~5 min',
        videoUrl: 'https://www.youtube.com/embed/__dlTbIdbfY?si=MDnBZohsiyWviDp4&enablejsapi=1&rel=0',
        fileName: 'Diet_Vid_1',
      },
      {
        id: 'diet_w1_v2',
        title: 'What you Eat: The MIND Diet',
        description:
          'Placeholder',
        duration: '~2 min',
        videoUrl: 'https://www.youtube.com/embed/Ubq5FoSbB6E?si=3KUi1_ydEwh0fEqw&enablejsapi=1&rel=0',
        fileName: 'Diet_Vid_2',
      },
      
      {
        id: 'diet_w1_v3',
        title: 'When you Eat: Time-Restricted Eating',
        description:
          'Placeholder',
        duration: '~2 min',
        videoUrl: 'https://www.youtube.com/embed/4UsOWmGFmWI?si=pufIS1mqy1DFE5Ro&enablejsapi=1&rel=0',
        fileName: 'Diet_Vid_3',
      },
      {
        id: 'diet_w1_v4',
        title: 'Making Healthy Eating Work in Real Life',
        description:
          'Placeholder',
        duration: '~3 min',
        videoUrl: 'https://www.youtube.com/embed/XWLQ8dlVqGg?si=aZpDOfkBPup4B-lc&enablejsapi=1&rel=0',
        fileName: 'Diet_Vid_4',
      },
      {
        id: 'diet_w1_v5',
        title: 'Recap and Your Plan for This Week',
        description:
          'Placeholder',
        duration: '~3 min',
        videoUrl: 'https://www.youtube.com/embed/nAfyMM2GjcA?si=Btb--IYStT1zFUOe&enablejsapi=1&rel=0',
        fileName: 'Diet_Vid_5',
      },
    ],
    resources: [],
  },
};

export const dietModuleWeekOrder: DietModuleWeekKey[] = ['week1'];

export function toDietWeekKeyFromSlug(slug: string): DietModuleWeekKey | null {
  const normalized = slug.toLowerCase();
  if (normalized === 'week-1') return 'week1';
  return null;
}

export function weekSlugFromKey(weekKey: DietModuleWeekKey): string {
  return weekKey.replace('week', 'week-');
}

export function dietWeekNumberFromKey(weekKey: DietModuleWeekKey): number {
  return Number.parseInt(weekKey.replace('week', ''), 10);
}
