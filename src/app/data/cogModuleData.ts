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
        videoUrl: 'https://www.youtube.com/embed/pArdpdA5xpA?si=0evG2KPWDNcWDZy7&enablejsapi=1',
        fileName: 'Cogengage_Vid_1',
      },
      {
        id: 'cogengage_w1_v2',
        title: 'Ways to Challenge Your Brain',
        description:
          'Placeholder',
        duration: '~4 min',
        videoUrl: 'https://www.youtube.com/embed/OT1RskWaFZM?si=8IXyyhixLK3Emzo-&enablejsapi=1',
        fileName: 'Cogengage_Vid_2',
      },
      {
        id: 'cogengage_w1_v3',
        title: 'Doing It Together',
        description:
          'Placeholder',
        duration: '~1 min',
        videoUrl: 'https://www.youtube.com/embed/fIaHAd8azf8?si=3CP2-NU7Q-TQIgSU&enablejsapi=1',
        fileName: 'Cogengage_Vid_3',
      },
      {
        id: 'cogengage_w1_v4',
        title: 'Recap and Your Plan for This Week',
        description:
          'Placeholder',
        duration: '~2 min',
        videoUrl: 'https://www.youtube.com/embed/KaWOREGIEE8?si=wpCrwR7TQNEUQesS&enablejsapi=1',
        fileName: 'Cogengage_Vid_4',
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