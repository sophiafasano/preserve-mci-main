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
    duration: '25 min',
    description:
      'Learn about the connection between sleep and cognitive function, and understand common sleep challenges faced by people with MCI.',
    queue: [
      {
        id: 'w1_v1',
        title: 'Week 1 Introduction',
        description:
          'Introduction to the sleep intervention program and what to expect over the coming weeks.',
        duration: '~5 min',
        videoUrl: 'https://usfedu-my.sharepoint.com/personal/priscillaamofaho_usf_edu/_layouts/15/embed.aspx?UniqueId=43996a81-0a79-42d4-965d-8b5d0a6ea021&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create',
        fileName: 'CBTi Week1 Video1_MCI',
      },
      {
        id: 'w1_v2',
        title: 'Activities that Interfere with Sleep',
        description: 'Common habits and behaviors that disrupt healthy sleep patterns.',
        duration: '~1 min',
        videoUrl: 'https://usfedu-my.sharepoint.com/personal/priscillaamofaho_usf_edu/_layouts/15/embed.aspx?UniqueId=c0c0dda6-8949-4009-a04e-283206a85a57&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create',
        fileName: 'Activities that Interfere with sleep',
      },
      {
        id: 'w1_v3',
        title: 'Sleep Hygiene',
        description: 'Essential practices and environmental factors that promote quality sleep.',
        duration: '~4 min',
        videoUrl: 'https://usfedu-my.sharepoint.com/personal/priscillaamofaho_usf_edu/_layouts/15/embed.aspx?UniqueId=b2e74762-afbf-4bb4-b7f7-637ce1043359&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create',
        fileName: 'Sleep Hygiene',
      },
      {
        id: 'w1_v4',
        title: 'Stimulus Control',
        description: 'Evidence-based techniques to strengthen the bed-sleep association.',
        duration: '~2 min',
        videoUrl: 'https://usfedu-my.sharepoint.com/personal/priscillaamofaho_usf_edu/_layouts/15/embed.aspx?UniqueId=d291ceb7-b5ad-41fb-865c-4671a776389e&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create',
        fileName: 'Stimulus Control',
      },
      {
        id: 'w1_recap',
        title: 'Week 1 Recap',
        description: 'Summary of key concepts from Week 1.',
        duration: '~2 min',
        videoUrl: 'https://usfedu-my.sharepoint.com/personal/priscillaamofaho_usf_edu/_layouts/15/embed.aspx?UniqueId=0be157f3-b591-4592-85e2-56a604d35e00&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create',
        fileName: 'Week 1 recap_MCI',
      },
    ],
    resources: [],
  },

  week2: {
    title: 'Techniques to Enhance Sleep',
    subtitle: 'Building Better Sleep Habits',
    duration: '25 min',
    description: 'Explore relaxation techniques and strategies to improve your sleep quality.',
    queue: [
      {
        id: 'w2_v1',
        title: 'Week 2 Introduction',
        description: 'Building on Week 1 foundations with new techniques to enhance sleep.',
        duration: '~8 min',
        videoUrl: 'https://usfedu-my.sharepoint.com/personal/priscillaamofaho_usf_edu/_layouts/15/embed.aspx?UniqueId=adcc9f96-7b66-4c0e-8041-afde19e0938c&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create',
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
        id: 'w2_v3',
        title: 'Progressive Muscle Relaxation',
        description: 'Progressive Muscle Relaxation',
        duration: '~16 min',
        videoUrl: 'https://www.youtube.com/embed/Pgay-cVYLjI?si=ZwEKbjV2Cc-aMdAD&enablejsapi=1',
        fileName: 'Week 2 muscle_relax'
      },
      {
        id: 'w2_recap',
        title: 'Week 2 Recap',
        description: 'Summary of key concepts from Week 2.',
        duration: '~3 min',
        videoUrl: 'https://usfedu-my.sharepoint.com/personal/priscillaamofaho_usf_edu/_layouts/15/embed.aspx?UniqueId=87dabf12-2d54-4609-b311-1ca2bbe379e5&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create',
        fileName: 'Week 2 recap_MCI',
      },
    ],
    resources: [
      {
        id: 'r_stimulus',
        title: 'Stimulus Control',
        videoUrl: 'https://usfedu-my.sharepoint.com/personal/priscillaamofaho_usf_edu/_layouts/15/embed.aspx?UniqueId=d291ceb7-b5ad-41fb-865c-4671a776389e&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create',
        fileName: 'Stimulus Control',
        icon: 'BedDouble',
      },
      {
        id: 'r_hygiene',
        title: 'Sleep Hygiene',
        videoUrl: 'https://usfedu-my.sharepoint.com/personal/priscillaamofaho_usf_edu/_layouts/15/embed.aspx?UniqueId=b2e74762-afbf-4bb4-b7f7-637ce1043359&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create',
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
    duration: '25 min',
    description:
      'Learn to identify and manage maladaptive thoughts and worries that interfere with sleep.',
    queue: [
      {
        id: 'w3_v1',
        title: 'Week 3 Introduction',
        description:
          'Introduction to managing stress, worry, and maladaptive thinking patterns.',
        duration: '~8 min',
        videoUrl: 'https://usfedu-my.sharepoint.com/personal/priscillaamofaho_usf_edu/_layouts/15/embed.aspx?UniqueId=5fde6eca-aa93-4f5f-bf7b-7324e3c2bb9d&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create',
        fileName: 'CBT- Week3 Video1_MCI',
      },
      {
        id: 'w3_maladaptive',
        title: 'Maladaptive Thoughts Week 3',
        description: 'Understanding and reframing thought patterns that disrupt sleep.',
        duration: '~8 min',
        videoUrl: 'https://usfedu-my.sharepoint.com/personal/priscillaamofaho_usf_edu/_layouts/15/embed.aspx?UniqueId=3ec7ddaf-e2bc-45bc-9bec-a184298f5df6&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create',
        fileName: 'Maladaptive Thoughts Week 3',
      },
      {
        id: 'w3_recap',
        title: 'Week 3 Recap',
        description: 'Summary of key concepts from Week 3.',
        duration: '~3 min',
        videoUrl: 'https://usfedu-my.sharepoint.com/personal/priscillaamofaho_usf_edu/_layouts/15/embed.aspx?UniqueId=655f478b-c464-49fe-bfdc-f4d5acdd800c&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create',
        fileName: 'Week 3 recap_MCI',
      },
    ],
    resources: [
      {
        id: 'r_stimulus',
        title: 'Stimulus Control',
        videoUrl: 'https://usfedu-my.sharepoint.com/personal/priscillaamofaho_usf_edu/_layouts/15/embed.aspx?UniqueId=d291ceb7-b5ad-41fb-865c-4671a776389e&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create',
        fileName: 'Stimulus Control',
        icon: 'BedDouble',
      },
      {
        id: 'r_hygiene',
        title: 'Sleep Hygiene',
        videoUrl: 'https://usfedu-my.sharepoint.com/personal/priscillaamofaho_usf_edu/_layouts/15/embed.aspx?UniqueId=b2e74762-afbf-4bb4-b7f7-637ce1043359&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create',
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
    duration: '30 min',
    description:
      'Apply everything you have learned to build lasting sleep habits and maintain cognitive wellness.',
    queue: [
      {
        id: 'w4_v1',
        title: 'Week 4 Introduction',
        description:
          'Final week bringing together all strategies for long-term sleep health.',
        duration: '~15 min',
        videoUrl: 'https://usfedu-my.sharepoint.com/personal/priscillaamofaho_usf_edu/_layouts/15/embed.aspx?UniqueId=050cfd94-3a62-410b-bb0b-0a50e892d08c&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create',
        fileName: 'Week 4 Video1_MCI',
      },
    ],
    resources: [
      {
        id: 'r_stimulus',
        title: 'Stimulus Control',
        videoUrl: 'https://usfedu-my.sharepoint.com/personal/priscillaamofaho_usf_edu/_layouts/15/embed.aspx?UniqueId=d291ceb7-b5ad-41fb-865c-4671a776389e&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create',
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
