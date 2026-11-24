export type HeartModuleWeekKey = 'week1';


export interface HeartModuleQueueVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  captionUrl?: string;
  fileName: string;
}

export interface HeartModuleResource {
  id: string;
  title: string;
  videoUrl: string;
  captionUrl?: string;
  fileName: string;
  icon: 'BedDouble' | 'Moon' | 'Wind';
}

export interface HeartWeekModuleData {
  title: string;
  subtitle: string;
  duration: string;
  description: string;
  queue: HeartModuleQueueVideo[];
  resources: HeartModuleResource[];
}

export const heartModuleData: Record<HeartModuleWeekKey, HeartWeekModuleData> = {
  week1:{
    title: 'Heart Health',
    subtitle: 'Placeholder',
    duration: '19 min',
    description:
      'Placeholder',
    queue: [
      {
        id: 'heart_w1_v1',
        title: 'Heart Health is Brain Health',
        description:
          'Placeholder',
        duration: '~3 min',
        videoUrl: 'https://www.youtube.com/embed/CN-AKRmuqQQ?si=Op9KtZ0t5x19lJoi&enablejsapi=1&rel=0',
        fileName: 'Heart_Vid_1',
      },
      {
        id: 'heart_w1_v2',
        title: 'Blood Pressure',
        description:
          'Placeholder',
        duration: '~4 min',
        videoUrl: 'https://www.youtube.com/embed/pSjNlO6vstE?si=zaW8UChX-DXMtNY8&enablejsapi=1&rel=0',
        fileName: 'Heart_Vid_2',
      },
      
      {
        id: 'heart_w1_v3',
        title: 'Cholesterol, Blood Sugar, and Weight',
        description:
          'Placeholder',
        duration: '~3 min',
        videoUrl: 'https://www.youtube.com/embed/AbLvcbecrfw?si=UlHxapbA_xD9B8ZZ&enablejsapi=1&rel=0',
        fileName: 'Heart_Vid_3',
      },
      {
        id: 'heart_w1_v4',
        title: 'Medicines and Working with Your Doctor',
        description:
          'Placeholder',
        duration: '~6 min',
        videoUrl: 'https://www.youtube.com/embed/fYgpppBdY28?si=AeGOt5RH1kN9auM7&enablejsapi=1&rel=0',
        fileName: 'Heart_Vid_4',
      },
      {
        id: 'heart_w1_v5',
        title: 'Smoking and Your Brain',
        description:
          'Placeholder',
        duration: '~2 min',
        videoUrl: 'https://www.youtube.com/embed/up0ane6n7gg?si=czv-EMfxRBSHb31x&enablejsapi=1&rel=0',
        fileName: 'Heart_Vid_5',
      },
      {
        id: 'heart_w1_recap',
        title: 'Recap',
        description:
          'Placeholder',
        duration: '1 min',
        videoUrl: 'https://www.youtube.com/embed/23oQS7KLUa0?si=eI7cJrmTVciPOoac&enablejsapi=1&rel=0',
        fileName: 'Heart_Vid_Recap',
      },
    ],
    resources: [],
  },
};

export const heartModuleWeekOrder: HeartModuleWeekKey[] = ['week1'];

export function toHeartWeekKeyFromSlug(slug: string): HeartModuleWeekKey | null {
  const normalized = slug.toLowerCase();
  if (normalized === 'week-1') return 'week1';
  return null;
}

export function weekSlugFromKey(weekKey: HeartModuleWeekKey): string {
  return weekKey.replace('week', 'week-');
}

export function heartWeekNumberFromKey(weekKey: HeartModuleWeekKey): number {
  return Number.parseInt(weekKey.replace('week', ''), 10);
}
