export type ModuleWeekKey = 'week1' | 'week2' | 'week3' | 'week4';

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

export const moduleData: Record<ModuleWeekKey, WeekModuleData> = {
  week1: {
    title: 'Understanding Sleep and MCI; Introduction to Sleep Intervention',
    subtitle: 'The Foundation of Better Sleep and Cognitive Health',
    duration: '14 min',
    description:
      'Learn about the connection between sleep and cognitive function, and understand common sleep challenges faced by people with MCI.',
    queue: [
      {
        id: 'w1_v1',
        title: 'Week 1 Introduction',
        description:
          'Introduction to the sleep intervention program and what to expect over the coming weeks.',
        duration: '~5 min',
        videoUrl: 'https://www.youtube.com/embed/Vn7KRiLg7jE?enablejsapi=1',
        fileName: 'CBTi Week1 Video1_MCI',
      },
      {
        id: 'w1_v2',
        title: 'Activities that Interfere with Sleep',
        description: 'Common habits and behaviors that disrupt healthy sleep patterns.',
        duration: '~1 min',
        videoUrl: 'https://www.youtube.com/embed/GD9VWT0JQo8?enablejsapi=1',
        fileName: 'Activities that Interfere with sleep',
      },
      {
        id: 'w1_v3',
        title: 'Sleep Hygiene',
        description: 'Essential practices and environmental factors that promote quality sleep.',
        duration: '~4 min',
        videoUrl: 'https://www.youtube.com/embed/J8hRZ9zqvVU?enablejsapi=1',
        fileName: 'Sleep Hygiene',
      },
      {
        id: 'w1_v4',
        title: 'Stimulus Control',
        description: 'Evidence-based techniques to strengthen the bed-sleep association.',
        duration: '~2 min',
        videoUrl: 'https://www.youtube.com/embed/-8n_SPzN5Y4?enablejsapi=1',
        fileName: 'Stimulus Control',
      },
      {
        id: 'w1_recap',
        title: 'Week 1 Recap',
        description: 'Summary of key concepts from Week 1.',
        duration: '~2 min',
        videoUrl: 'https://www.youtube.com/embed/mYYHNOawQyw?enablejsapi=1',
        fileName: 'Week 1 recap_MCI',
      },
    ],
    resources: [],
  },
 
  week2: {
    title: 'Techniques to Enhance Sleep',
    subtitle: 'Building Better Sleep Habits',
    duration: '30 min',
    description: 'Explore relaxation techniques and strategies to improve your sleep quality.',
    queue: [
      {
        id: 'w2_v1',
        title: 'Week 2 Introduction',
        description: 'Building on Week 1 foundations with new techniques to enhance sleep.',
        duration: '~6 min',
        videoUrl: 'https://www.youtube.com/embed/dNCMYTyzGWs?enablejsapi=1',
        fileName: 'CBTi Week2 Video1_MCI',
      },
      {
        id: 'w2_v2',
        title: 'Autogenic Relaxation',
        description: 'Autogenic Relaxation',
        duration: '~6 min',
        videoUrl: 'https://www.youtube.com/embed/H62t26iYF9o?si=zchGwlBqCObJ7GcT&enablejsapi=1',
        fileName: 'Week 2 auto_relax'
      },
      {
        id: 'w2_recap',
        title: 'Week 2 Recap',
        description: 'Summary of key concepts from Week 2.',
        duration: '~1 min',
        videoUrl: 'https://www.youtube.com/embed/wlv4zQEbt9I?enablejsapi=1',
        fileName: 'Week 2 recap_MCI',
      },
    ],
    resources: [
      {
        id: 'r_stimulus',
        title: 'Stimulus Control',
        videoUrl: 'https://www.youtube.com/embed/-8n_SPzN5Y4?enablejsapi=1',
        fileName: 'Stimulus Control',
        icon: 'BedDouble',
      },
      {
        id: 'r_hygiene',
        title: 'Sleep Hygiene',
        videoUrl: 'https://www.youtube.com/embed/J8hRZ9zqvVU?enablejsapi=1',
        fileName: 'Sleep Hygiene',
        icon: 'Moon',
      },
      {
        id: 'r_progressive',
        title: 'Progressive Muscle Relaxation',
        videoUrl: 'https://www.youtube.com/embed/Pgay-cVYLjI?si=ZwEKbjV2Cc-aMdAD&enablejsapi=1',
        fileName: 'Progressive Muscle Relaxation',
        icon: 'Wind',
      },
    ],
  },
 
  week3: {
    title: 'Managing Stress and Worry',
    subtitle: 'Strategies for Staying Asleep',
    duration: '9 min',
    description:
      'Learn to identify and manage maladaptive thoughts and worries that interfere with sleep.',
    queue: [
      {
        id: 'w3_v1',
        title: 'Week 3 Introduction',
        description:
          'Introduction to managing stress, worry, and maladaptive thinking patterns.',
        duration: '~5 min',
        videoUrl: 'https://www.youtube.com/embed/WRJVpWZDMhw?enablejsapi=1',
        fileName: 'CBT- Week3 Video1_MCI',
      },
      {
        id: 'w3_maladaptive',
        title: 'Maladaptive Thoughts',
        description: 'Understanding and reframing thought patterns that disrupt sleep.',
        duration: '~4 min',
        videoUrl: 'https://www.youtube.com/embed/YKsqSgtHp4M?enablejsapi=1',
        fileName: 'Maladaptive Thoughts Week 3',
      },
      {
        id: 'w3_recap',
        title: 'Week 3 Recap',
        description: 'Summary of key concepts from Week 3.',
        duration: '~1 min',
        videoUrl: 'https://www.youtube.com/embed/UBqnJACsYjM?enablejsapi=1',
        fileName: 'Week 3 recap_MCI',
      },
    ],
    resources: [
      {
        id: 'r_stimulus',
        title: 'Stimulus Control',
        videoUrl: 'https://www.youtube.com/embed/-8n_SPzN5Y4?enablejsapi=1',
        fileName: 'Stimulus Control',
        icon: 'BedDouble',
      },
      {
        id: 'r_hygiene',
        title: 'Sleep Hygiene',
        videoUrl: 'https://www.youtube.com/embed/J8hRZ9zqvVU?enablejsapi=1',
        fileName: 'Sleep Hygiene',
        icon: 'Moon',
      },
      {
        id: 'r_relaxation',
        title: 'Autogenic Relaxation',
        videoUrl: 'https://www.youtube.com/embed/H62t26iYF9o?si=zchGwlBqCObJ7GcT&enablejsapi=1',
        fileName: 'Autogenic Relaxation',
        icon: 'Wind',
      },
      {
        id: 'r_progressive',
        title: 'Progressive Muscle Relaxation',
        videoUrl: 'https://www.youtube.com/embed/Pgay-cVYLjI?si=ZwEKbjV2Cc-aMdAD&enablejsapi=1',
        fileName: 'Progressive Muscle Relaxation',
        icon: 'Wind',
      },
    ],
  },
 
  week4: {
    title: 'Practical Recommendations',
    subtitle: 'Maintaining Long-Term Sleep Health',
    duration: '5 min',
    description:
      'Apply everything you have learned to build lasting sleep habits and maintain cognitive wellness.',
    queue: [
      {
        id: 'w4_v1',
        title: 'Week 4 Introduction',
        description:
          'Final week bringing together all strategies for long-term sleep health.',
        duration: '~5 min',
        videoUrl: 'https://www.youtube.com/embed/TgQXRurrR9I?enablejsapi=1',
        fileName: 'Week 4 Video1_MCI',
      },
    ],
    resources: [
      {
        id: 'r_stimulus',
        title: 'Stimulus Control',
        videoUrl: 'https://www.youtube.com/embed/-8n_SPzN5Y4?enablejsapi=1',
        fileName: 'Stimulus Control',
        icon: 'BedDouble',
      },
      {
        id: 'r_relaxation',
        title: 'Autogenic Relaxation',
        videoUrl: 'https://www.youtube.com/embed/H62t26iYF9o?si=zchGwlBqCObJ7GcT&enablejsapi=1',
        fileName: 'Autogenic Relaxation',
        icon: 'Wind',
      },
      {
        id: 'r_progressive',
        title: 'Progressive Muscle Relaxation',
        videoUrl: 'https://www.youtube.com/embed/Pgay-cVYLjI?si=ZwEKbjV2Cc-aMdAD&enablejsapi=1',
        fileName: 'Progressive Muscle Relaxation',
        icon: 'Wind',
      },
    ],
  },
};

export const moduleWeekOrder: ModuleWeekKey[] = ['week1', 'week2', 'week3', 'week4'];

export function toWeekKeyFromSlug(slug: string): ModuleWeekKey | null {
  const normalized = slug.toLowerCase();
  if (normalized === 'week-1') return 'week1';
  if (normalized === 'week-2') return 'week2';
  if (normalized === 'week-3') return 'week3';
  if (normalized === 'week-4') return 'week4';
  return null;
}

export function weekSlugFromKey(weekKey: ModuleWeekKey): string {
  return weekKey.replace('week', 'week-');
}

export function weekNumberFromKey(weekKey: ModuleWeekKey): number {
  return Number.parseInt(weekKey.replace('week', ''), 10);
}
