export type CogengageModuleWeekKey = 'week1';


export interface CogengageModuleQueueVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  captionUrl?: string;
  fileName: string;
}

export interface CogengageModuleResource {
  id: string;
  title: string;
  videoUrl: string;
  captionUrl?: string;
  fileName: string;
  icon: 'BedDouble' | 'Moon' | 'Wind';
}

export interface CogengageWeekModuleData {
  title: string;
  subtitle: string;
  duration: string;
  description: string;
  queue: CogengageModuleQueueVideo[];
  resources: CogengageModuleResource[];
}

export const cogengageModuleData: Record<CogengageModuleWeekKey, CogengageWeekModuleData> = {
  week1:{
    title: 'Cognitive Engagement',
    subtitle: 'Placeholder',
    duration: '10 min',
    description:
      'Placeholder',
    queue: [
      {
        id: 'cogengage_w1_v1',
        title: 'Why Keep Your Brain Active?',
        description:
          'Placeholder',
        duration: '~3 min',
        videoUrl: 'https://www.youtube.com/embed/Fv9YNqf3o5U?si=onPHIpjZb3exEzFK&enablejsapi=1&rel=0',
        fileName: 'Cogengage_Vid_1',
      },
      {
        id: 'cogengage_w1_v2',
        title: 'Ways to Challenge Your Brain',
        description:
          'Placeholder',
        duration: '~4 min',
        videoUrl: 'https://www.youtube.com/embed/gQbJ5sJtN_c?si=HHpDVYfSpeayFV7i&enablejsapi=1&rel=0',
        fileName: 'Cogengage_Vid_2',
      },
      {
        id: 'cogengage_w1_v3',
        title: 'Doing It Together',
        description:
          'Placeholder',
        duration: '~1 min',
        videoUrl: 'https://www.youtube.com/embed/jdeISC-Ae8s?si=Z328jDh8kJFovoRi&enablejsapi=1&rel=0',
        fileName: 'Cogengage_Vid_3',
      },
      {
        id: 'cogengage_w1_v4',
        title: 'Everyday Memory Tools',
        description:
          'Placeholder',
        duration: '~1 min',
        videoUrl: 'https://www.youtube.com/embed/6_sc3js9wXU?si=c_RXllREnxXHxC3k&enablejsapi=1&rel=0',
        fileName: 'Cogengage_Vid_4',
      },
      {
        id: 'cogengage_recap',
        title: 'Recap',
        description:
          'Placeholder',
        duration: '~2 min',
        videoUrl: 'https://www.youtube.com/embed/qtkaTcZldvw?si=KSVS-J_TZqtYzbLo&enablejsapi=1&rel=0',
        fileName: 'Cogengage_Vid_5',
      },
    ],
    resources: [],
  },
};

export const cogengageModuleWeekOrder: CogengageModuleWeekKey[] = ['week1'];

export function toCogengageWeekKeyFromSlug(slug: string): CogengageModuleWeekKey | null {
  const normalized = slug.toLowerCase();
  if (normalized === 'week-1') return 'week1';
  return null;
}

export function weekSlugFromKey(weekKey: CogengageModuleWeekKey): string {
  return weekKey.replace('week', 'week-');
}

export function cogengageWeekNumberFromKey(weekKey: CogengageModuleWeekKey): number {
  return Number.parseInt(weekKey.replace('week', ''), 10);
}