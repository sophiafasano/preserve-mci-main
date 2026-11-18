export type HVSModuleWeekKey = 'week1';


export interface HVSModuleQueueVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  captionUrl?: string;
  fileName: string;
}

export interface HVSModuleResource {
  id: string;
  title: string;
  videoUrl: string;
  captionUrl?: string;
  fileName: string;
  icon: 'BedDouble' | 'Moon' | 'Wind';
}

export interface HVSWeekModuleData {
  title: string;
  subtitle: string;
  duration: string;
  description: string;
  queue: HVSModuleQueueVideo[];
  resources: HVSModuleResource[];
}

export const hvsModuleData: Record<HVSModuleWeekKey, HVSWeekModuleData> = {
  week1:{
    title: 'Hearing, Vision, and Staying Connected',
    subtitle: 'Placeholder',
    duration: '5 min',
    description:
      'Placeholder',
    queue: [
      {
        id: 'hvs_w1_v1',
        title: 'Hearting and Your Brain',
        description:
          'Placeholder',
        duration: '2 min',
        videoUrl: 'https://www.youtube.com/embed/AgWWaKh9XPI?si=Dm4qZv1fQ0-3Bv5_&enablejsapi=1&rel=0',
        fileName: 'HVS_Vid_1',
      },
      {
        id: 'hvs_w1_v2',
        title: 'Vision and Your Brain',
        description:
          'Placeholder',
        duration: '~1 min',
        videoUrl: 'https://www.youtube.com/embed/1_oD518VJos?si=kXeFhwFyDz0GXca-&enablejsapi=1&rel=0',
        fileName: 'HVS_Vid_2',
      },
      
      {
        id: 'hvs_w1_v3',
        title: 'Staying Connected',
        description:
          'Placeholder',
        duration: '~1 min',
        videoUrl: 'https://www.youtube.com/embed/sIYfgAIUSxs?si=iN8C2o73cw0ODlI8 &enablejsapi=1&rel=0',
        fileName: 'HVS_Vid_3',
      },
      {
        id: 'hvs_w1_recap',
        title: 'Recap',
        description:
          'Placeholder',
        duration: '~1 min',
        videoUrl: 'https://www.youtube.com/embed/TvnAH-iLG3A?si=BvQ2ak0DuDmvFBXz&enablejsapi=1&rel=0',
        fileName: 'HVS_Vid_Recap',
      },
    ],
    resources: [],
  },
};

export const hvsModuleWeekOrder: HVSModuleWeekKey[] = ['week1'];

export function toHVSWeekKeyFromSlug(slug: string): HVSModuleWeekKey | null {
  const normalized = slug.toLowerCase();
  if (normalized === 'week-1') return 'week1';
  return null;
}

export function weekSlugFromKey(weekKey: HVSModuleWeekKey): string {
  return weekKey.replace('week', 'week-');
}

export function hvsWeekNumberFromKey(weekKey: HVSModuleWeekKey): number {
  return Number.parseInt(weekKey.replace('week', ''), 10);
}
