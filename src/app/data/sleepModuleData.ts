import Week_2_recap_E from '../components/videos/Week_2_recap_E.mov'
import Week_3_Recap from '../components/videos/Week_3_Recap.mov'

const CBTi_Week_1_Video_1_P = 'https://mhrnrxuaxlwh4zav.public.blob.vercel-storage.com/CBTi_Week_1_Video_1_P.mov'
const CBTi_Week_2_Video_1_P = 'https://mhrnrxuaxlwh4zav.public.blob.vercel-storage.com/CBTi_Week_2_Video_1_P.mov'
const CBTi_Week_3_Video_1_P = 'https://mhrnrxuaxlwh4zav.public.blob.vercel-storage.com/CBTi_Week_3_Video_1_P.mov'
const CBTi_Week_4_Video_1_P = 'https://mhrnrxuaxlwh4zav.public.blob.vercel-storage.com/CBTi_Week_4_Video_1_P.mov'
const Maladaptive_Thoughts_Week_3 = 'https://mhrnrxuaxlwh4zav.public.blob.vercel-storage.com/Maladaptive_Thoughts_Week_3_CG.mov'
const Sleep_Hygiene_E = 'https://mhrnrxuaxlwh4zav.public.blob.vercel-storage.com/Sleep_Hygiene_E_CG.mov'
const Stimulus_Control_E = 'https://mhrnrxuaxlwh4zav.public.blob.vercel-storage.com/Stimulus_Control_E_CG.mov'
const Week_1_recap_E = 'https://mhrnrxuaxlwh4zav.public.blob.vercel-storage.com/Week_1_recap_E_CG.mov'
const Activities_Video = 'https://mhrnrxuaxlwh4zav.public.blob.vercel-storage.com/Activities_that_Interfer_with_sleep.mov'

export type SleepModuleWeekKey = 'week1' | 'week2' | 'week3' | 'week4';
export const SleepModuleWeekOrder = ['week1', 'week2', 'week3', 'week4']

export interface SleepModuleQueueVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  captionUrl?: string;
  fileName: string;
}

export interface SleepModuleResource {
  id: string;
  title: string;
  videoUrl: string;
  captionUrl?: string;
  fileName: string;
  icon: 'BedDouble' | 'Moon' | 'Wind';
}

export interface SleepWeekModuleData {
  title: string;
  subtitle: string;
  duration: string;
  description: string;
  queue: SleepModuleQueueVideo[];
  resources: SleepModuleResource[];
}

export const sleepModuleData: Record<SleepModuleWeekKey, SleepWeekModuleData> = {
  week1: {
    title: 'How Sleep Works, and Healthy Sleep Habits',
    subtitle: 'The Foundation of Better Sleep and Cognitive Health',
    duration: '14 min',
    description:
      'Learn about the connection between sleep and cognitive function, and understand common sleep challenges faced by people with MCI.',
    queue: [
      {
        id: 'w1_v1',
        title: 'Welcome: Sleep, Aging and Your Brain',
        description:
          'Introduction to the sleep intervention program and what to expect over the coming weeks.',
        duration: '~5 min',
        //videoUrl: CBTi_Week_1_Video_1_P,
        videoUrl: 'https://www.youtube.com/embed/MphZRzwwfCs?si=O7TR9RUiIJDNIqIP&enablejsapi=1&rel=0',
        fileName: 'CBTi_Week_1_Video_1_P',
      },
      {
        id: 'w1_v2',
        title: 'What is Insomnia, and How Do We Treat It?',
        description: 'Placeholder',
        duration: '~1 min',
        //videoUrl: Activities_Video,
        videoUrl: 'https://www.youtube.com/embed/f1U16hSYK6U?si=SXpzfqe7ain1QiaH&enablejsapi=1&rel=0',
        fileName: 'Activities_Video',
      },
      {
        id: 'w1_v3',
        title: 'Things That Can Get in the Way of Sleep',
        description: 'Placeholder',
        duration: '~4 min',
        // videoUrl: Sleep_Hygiene_E,
        videoUrl: 'https://www.youtube.com/embed/sQsZMI5zvR0?si=oVmmbOCW0g2abecV&enablejsapi=1&rel=0',
        fileName: 'Sleep_Hygiene_E',
      },
      {
        id: 'w1_v4',
        title: 'Healthy Sleep Habits',
        description: 'Placeholder',
        duration: '~2 min',
        // videoUrl: Stimulus_Control_E,
        videoUrl: 'https://www.youtube.com/embed/c1DFng_CuGI?si=DcY1rj9GSE4BJP6S&enablejsapi=1&rel=0',
        fileName: 'Stimulus_Control_E',
      },
      {
        id: 'w1_v5',
        title: 'WRONG FORMAT - Retrain Your Brain for Sleep (Stimulus Control)',
        description: 'Placeholder',
        duration: '~2 min',
        // videoUrl: Week_1_recap_E,
        videoUrl: 'https://www.youtube.com/embed/mYYHNOawQyw?enablejsapi=1&rel=0',
        fileName: 'Week_1_recap_E',
      },
      {
        id: 'w1_recap',
        title: 'Your Plan for Week 1',
        description: 'Summary of key concepts from Week 1.',
        duration: '~2 min',
        // videoUrl: Week_1_recap_E,
        videoUrl: 'https://www.youtube.com/embed/xsggC6QHWt4?si=48CzI6jxnZW35Ysr&enablejsapi=1&rel=0',
        fileName: 'Week_1_recap_E2',
      },
    ],
    resources: [],
  },
 
  week2: {
    title: 'Your Sleep Schedule, Relaxation, and Noticing Thoughts',
    subtitle: 'Building Better Sleep Habits',
    duration: '30 min',
    description: 'Explore relaxation techniques and strategies to improve your sleep quality.',
    queue: [
      {
        id: 'w2_v1',
        title: 'Your Sleep Schedule (Sleep Compression)',
        description: 'Building on Week 1 foundations with new techniques to enhance sleep.',
        duration: '~6 min',
        //videoUrl: CBTi_Week_2_Video_1_P,
        videoUrl: 'https://www.youtube.com/embed/9sG4IDEMCdc?si=7ZiRhQv4hJqDyKlm&enablejsapi=1&rel=0',
        fileName: 'CBTi_Week_2_Video_1_P',
      },
      {
        id: 'w2_v2',
        title: 'Notcing Thoughts That Keep You Awake',
        description: 'Placeholder',
        duration: '~6 min',
        videoUrl: 'https://www.youtube.com/embed/C-yhMzjdEUw?si=y6RTBia8AbKvIm0V&si=zchGwlBqCObJ7GcT&enablejsapi=1&rel=0',
        fileName: 'Week 2 auto_relax'
      },
      {
        id: 'w2_v3',
        title: 'Calming Your Body and Mind at Bedtime',
        description: 'Placeholder',
        duration: '~6 min',
        videoUrl: 'https://www.youtube.com/embed/vGVdYJ-5bKw?si=eIQ14SlP0DZk-EFy&si=zchGwlBqCObJ7GcT&enablejsapi=1&rel=0',
        fileName: 'Week 2 auto_relax2'
      },
      {
        id: 'w2_v4',
        title: 'The Mental Shuffle: For a Racing Mind',
        description: 'Placeholder',
        duration: '~6 min',
        videoUrl: 'https://www.youtube.com/embed/vV2VSJCv84Q?enablejsapi=1&rel=0',
        fileName: 'Week 2 auto_relax3'
      },
      {
        id: 'w2_v5',
        title: 'Working Together at Night',
        description: 'Placeholder',
        duration: '~6 min',
        videoUrl: 'https://www.youtube.com/embed/vIYhrZoDKIM?enablejsapi=1&rel=0',
        fileName: 'Week 2 auto_relax4'
      },
      {
        id: 'w2_recap',
        title: 'Your Plan for Week 2',
        description: 'Summary of key concepts from Week 2.',
        duration: '~1 min',
        // videoUrl: Week_2_recap_E,
        videoUrl: 'https://www.youtube.com/embed/rwJxWUdMn3c?si=382V21WwB9XbjsYO&enablejsapi=1&rel=0',
        fileName: 'Week_2_recap_E',
      },
    ],
    resources: [
      {
        id: 'r_stimulus',
        title: 'Stimulus Control',
        // videoUrl: Stimulus_Control_E,
        videoUrl: 'https://www.youtube.com/embed/-8n_SPzN5Y4?enablejsapi=1&rel=0',
        fileName: 'Stimulus_Control_E',
        icon: 'BedDouble',
      },
      {
        id: 'r_hygiene',
        title: 'Sleep Hygiene',
        // videoUrl: Sleep_Hygiene_E,
        videoUrl: 'https://www.youtube.com/embed/J8hRZ9zqvVU?enablejsapi=1&rel=0',
        fileName: 'Sleep_Hygiene_E',
        icon: 'Moon',
      },
      {
        id: 'r_progressive',
        title: 'Progressive Muscle Relaxation',
        videoUrl: 'https://www.youtube.com/embed/Pgay-cVYLjI?si=ZwEKbjV2Cc-aMdAD&enablejsapi=1&rel=0',
        fileName: 'Progressive Muscle Relaxation',
        icon: 'Wind',
      },
    ],
  },
 
  week3: {
    title: 'Balacing Thoughts, Living with MCI, and Managing Stress',
    subtitle: 'Strategies for Staying Asleep',
    duration: '9 min',
    description:
      'Learn to identify and manage maladaptive thoughts and worries that interfere with sleep.',
    queue: [
      {
        id: 'w3_v1',
        title: 'Sleep, Memory, and Living with MCI',
        description:
          'Placeholder',
        duration: '~5 min',
        // videoUrl: CBTi_Week_3_Video_1_P,
        videoUrl: 'https://www.youtube.com/embed/jR4ywKsx5Hs?si=rWHJRk7OAK1YwCv8&enablejsapi=1&rel=0',
        fileName: 'CBTi_Week_3_Video_1_P',
      },
      {
        id: 'w3_v2',
        title: 'Catch It, Check It, Change It',
        description: 'Placeholder',
        duration: '~4 min',
        // videoUrl: Maladaptive_Thoughts_Week_3,
        videoUrl: 'https://www.youtube.com/embed/GomKEs77U64?si=SPmAySrW66Bqm0-N&enablejsapi=1&rel=0',
        fileName: 'Maladaptive_Thoughts_Week_3',
      },
      {
        id: 'w3_v3',
        title: 'Managing Stress During the Day',
        description: 'Placeholder',
        duration: '~4 min',
        // videoUrl: Maladaptive_Thoughts_Week_3,
        videoUrl: 'https://www.youtube.com/embed/s1EvZ_q0_P4?si=oh82ZkF-7EaSTUw2&enablejsapi=1&rel=0',
        fileName: 'Maladaptive_Thoughts_Week_32',
      },
      {
        id: 'w3_recap',
        title: 'Your Plan for Week 3',
        description: 'Summary of key concepts from Week 3.',
        duration: '~1 min',
        // videoUrl: Week_3_Recap,
        videoUrl: 'https://www.youtube.com/embed/5iBnOdLg20M?si=D3fsuNJ5ZbF9sM-z&enablejsapi=1&rel=0',
        fileName: 'Week_3_Recap',
      },
    ],
    resources: [
      {
        id: 'r_stimulus',
        title: 'Stimulus Control',
        // videoUrl: Stimulus_Control_E,
        videoUrl: 'https://www.youtube.com/embed/-8n_SPzN5Y4?enablejsapi=1&rel=0',
        fileName: 'Stimulus_Control_E',
        icon: 'BedDouble',
      },
      {
        id: 'r_hygiene',
        title: 'Sleep Hygiene',
        // videoUrl: Sleep_Hygiene_E,
        videoUrl: 'https://www.youtube.com/embed/J8hRZ9zqvVU?enablejsapi=1&rel=0',
        fileName: 'Sleep_Hygiene_E',
        icon: 'Moon',
      },
      {
        id: 'r_relaxation',
        title: 'Autogenic Relaxation',
        videoUrl: 'https://www.youtube.com/embed/H62t26iYF9o?si=zchGwlBqCObJ7GcT&enablejsapi=1&rel=0',
        fileName: 'Autogenic Relaxation',
        icon: 'Wind',
      },
      {
        id: 'r_progressive',
        title: 'Progressive Muscle Relaxation',
        videoUrl: 'https://www.youtube.com/embed/Pgay-cVYLjI?si=ZwEKbjV2Cc-aMdAD&enablejsapi=1&rel=0',
        fileName: 'Progressive Muscle Relaxation',
        icon: 'Wind',
      },
    ],
  },
 
  week4: {
    title: 'Keeping Your Progress',
    subtitle: 'Maintaining Long-Term Sleep Health',
    duration: '5 min',
    description:
      'Apply everything you have learned to build lasting sleep habits and maintain cognitive wellness.',
    queue: [
      {
        id: 'w4_v1',
        title: 'Keeping Your Progress',
        description:
          'Placeholder',
        duration: '~5 min',
        // videoUrl: CBTi_Week_4_Video_1_P,
        videoUrl: 'https://www.youtube.com/embed/0ePF9Ac7ioA?si=hHP6MQygDNaQzf3Y&enablejsapi=1&rel=0',
        fileName: 'CBTi_Week_4_Video_1_P',
      },
      {
        id: 'w4_v2',
        title: 'Your Plan Going Forward',
        description:
          'Placeholder',
        duration: '~5 min',
        // videoUrl: CBTi_Week_4_Video_1_P,
        videoUrl: 'https://www.youtube.com/embed/sqizetBi43Y?si=BelpVXqpydwpOZTa&enablejsapi=1&rel=0',
        fileName: 'CBTi_Week_4_Video_2_P',
      },
      {
        id: 'w4_recap',
        title: 'Sleep Plan',
        description:
          'Placeholder',
        duration: '~5 min',
        // videoUrl: CBTi_Week_4_Video_1_P,
        videoUrl: 'https://www.youtube.com/embed/Jl88hx0-ahY?si=z50cca4e7sr-2o9i&enablejsapi=1&rel=0',
        fileName: 'CBTi_Week_4_Video_3_P',
      },
    ],
    resources: [
      {
        id: 'r_stimulus',
        title: 'Stimulus Control',
        // videoUrl: Stimulus_Control_E,
        videoUrl: 'https://www.youtube.com/embed/-8n_SPzN5Y4?enablejsapi=1&rel=0',
        fileName: 'Stimulus_Control_E',
        icon: 'BedDouble',
      },
      {
        id: 'r_relaxation',
        title: 'Autogenic Relaxation',
        videoUrl: 'https://www.youtube.com/embed/H62t26iYF9o?si=zchGwlBqCObJ7GcT&enablejsapi=1&rel=0',
        fileName: 'Autogenic Relaxation',
        icon: 'Wind',
      },
      {
        id: 'r_progressive',
        title: 'Progressive Muscle Relaxation',
        videoUrl: 'https://www.youtube.com/embed/Pgay-cVYLjI?si=ZwEKbjV2Cc-aMdAD&enablejsapi=1&rel=0',
        fileName: 'Progressive Muscle Relaxation',
        icon: 'Wind',
      },
    ],
  },
};

export const sleepModuleWeekOrder: SleepModuleWeekKey[] = ['week1', 'week2', 'week3', 'week4'];

export function toSleepWeekKeyFromSlug(slug: string): SleepModuleWeekKey | null {
  const normalized = slug.toLowerCase();
  if (normalized === 'week-1') return 'week1';
  if (normalized === 'week-2') return 'week2';
  if (normalized === 'week-3') return 'week3';
  if (normalized === 'week-4') return 'week4';
  return null;
}

export function weekSlugFromKey(weekKey: SleepModuleWeekKey): string {
  return weekKey.replace('week', 'week-');
}

export function sleepWeekNumberFromKey(weekKey: SleepModuleWeekKey): number {
  return Number.parseInt(weekKey.replace('week', ''), 10);
}
