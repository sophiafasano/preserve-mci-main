import { dataAPI } from './api';

import {
  sleepModuleData,
  sleepModuleWeekOrder,
  toSleepWeekKeyFromSlug,
  sleepWeekNumberFromKey,
} from '../data/sleepModuleData';

import {
  dietModuleData,
  dietModuleWeekOrder,
  toDietWeekKeyFromSlug,
  dietWeekNumberFromKey,
} from '../data/dietModuleData';

import {
  cogengageModuleData,
  cogengageModuleWeekOrder,
  toCogengageWeekKeyFromSlug,
  cogengageWeekNumberFromKey,
} from '../data/cogModuleData';

import {
  hvsModuleData,
  hvsModuleWeekOrder,
  toHVSWeekKeyFromSlug,
  hvsWeekNumberFromKey,
} from '../data/hvsModuleData';

import {
  heartModuleData,
  heartModuleWeekOrder,
  toHeartWeekKeyFromSlug,
  heartWeekNumberFromKey,
} from '../data/heartModuleData';


function getModuleTypeFromPath(pathname: string): ModuleType {
  const path = pathname.toLowerCase().replace(/\/+$/, '');

  if (path === '/sleep-modules' || path.startsWith('/modules/')) {
    return 'sleep';
  }

  if (path === '/dietmodules' || path.startsWith('/dietmodules/')) {
    return 'diet';
  }

  if (path === '/heart-modules' || path.startsWith('/heart-modules/')) {
    return 'heart';
  }

  if (path === '/cogengagemodules' || path.startsWith('/cogengagemodules/')) {
    return 'cogengage';
  }

  if (path === '/hvs-modules' || path.startsWith('/hvs-modules/')){
    return 'hvs'
  }

  throw new Error(`Unknown module page: ${pathname}`);
}


// Assign module-specific data
const moduleConfig = {
  sleep: {
    data: sleepModuleData,
    weekOrder: sleepModuleWeekOrder,
    toWeekKeyFromSlug: toSleepWeekKeyFromSlug,
    getWeekNumberFromKey: sleepWeekNumberFromKey,
  },
  diet: {
    data: dietModuleData,
    weekOrder: dietModuleWeekOrder,
    toWeekKeyFromSlug: toDietWeekKeyFromSlug,
    getWeekNumberFromKey: dietWeekNumberFromKey,
  },
  cogengage: {
    data: cogengageModuleData,
    weekOrder: cogengageModuleWeekOrder,
    toWeekKeyFromSlug: toCogengageWeekKeyFromSlug,
    getWeekNumberFromKey: cogengageWeekNumberFromKey,
  },
  hvs: {
    data: hvsModuleData,
    weekOrder: hvsModuleWeekOrder,
    toWeekKeyFromSlug: toHVSWeekKeyFromSlug,
    getWeekNumberFromKey: hvsWeekNumberFromKey,
  },
  heart: {
    data: heartModuleData,
    weekOrder: heartModuleWeekOrder,
    toWeekKeyFromSlug: toHeartWeekKeyFromSlug,
    getWeekNumberFromKey: heartWeekNumberFromKey,
  },
};

function getModuleConfig(moduleType?: ModuleType) {
  const resolvedType = moduleType ?? getModuleTypeFromPath(window.location.pathname);

  return {
    moduleType: resolvedType,
    ...moduleConfig[resolvedType],
    progressKey: `modules_progress_${resolvedType}_v1`,
  };
}


type ModuleConfig = typeof moduleConfig;
export type ModuleType = keyof typeof moduleConfig;
type ModuleData = ModuleConfig[ModuleType]['data'];
type ModuleWeekKey = {
  [K in ModuleType]: keyof ModuleConfig[K]['data']
}[ModuleType];
type WeekModuleData = ModuleData[ModuleWeekKey];
type ModuleQueueVideo = WeekModuleData['queue'][number];
type ModuleResource = WeekModuleData['resources'][number];


export interface VideoProgress {
  watched: boolean;
  watchedAt: string | null;
  watchedPercent: number;
}

export interface UserModuleProgressRecord {
  videos: Record<string, VideoProgress>;
  weekStartedAt: Record<string, string>; // weekKey → ISO timestamp
  updatedAt: string;
}

export interface QueueVideoWithProgress extends ModuleQueueVideo {
  progress: VideoProgress;
}

export interface ResourceWithProgress extends ModuleResource {
  progress: VideoProgress;
}

export interface ModuleWithProgress extends WeekModuleData {
  weekKey: ModuleWeekKey;
  weekNumber: number;
  unlocked: boolean;
  isLocked: boolean;
  daysUntilUnlock: number | null; // null if unlocked or previous week not started
  completed: boolean;
  completionStatus: 'completed' | 'in_progress' | 'not_started';
  overallPercent: number;
  queue: QueueVideoWithProgress[];
  resources: ResourceWithProgress[];
}

export interface ModulesSummary {
  completedCount: number;
  inProgressCount: number;
  notStartedCount: number;
  overallPercent: number;
  watchedVideos: number;
  totalVideos: number;
}

export interface SavedModuleSummary extends ModulesSummary {
  moduleType: ModuleType;
  updatedAt: string;
}

export interface ModulesResponse {
  endpoint: '/api/modules';
  modules: ModuleWithProgress[];
  summary: ModulesSummary;
}

export interface ModuleWeekResponse {
  endpoint: '/api/modules/:week';
  module: ModuleWithProgress;
  summary: ModulesSummary;
}

export interface ProgressPostResponse {
  endpoint: '/api/modules/:week/:videoId/progress';
  module: ModuleWithProgress;
  updatedProgress: VideoProgress;
  summary: ModulesSummary;
}

function getDaysUntilUnlock(weekKey: ModuleWeekKey, record: UserModuleProgressRecord, config: ReturnType<typeof getModuleConfig>,): number | null {
  if (weekKey === 'week1') return null;
  const index = config.weekOrder.indexOf(weekKey);
  if (index <= 0) return null;
  const previousWeek = config.weekOrder[index - 1];
  if (!computeModuleCompletion(previousWeek, record, config)) return null;
  const prevWeekStarted = record.weekStartedAt[previousWeek];
  if (!prevWeekStarted) return null;

  // Use calendar days
  const startDate = new Date(prevWeekStarted);
  const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const today = new Date();
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const calendarDaysPassed = Math.floor((todayDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24));
  const remaining = 7 - calendarDaysPassed;
  return remaining > 0 ? remaining : 0;
}

function buildDefaultProgress(): UserModuleProgressRecord {
  return {
    videos: {},
    weekStartedAt: {},
    updatedAt: new Date().toISOString(),
  };
}

function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

async function getProgressRecord(
  config: ReturnType<typeof getModuleConfig>
): Promise<UserModuleProgressRecord> {
  const { progressKey } = config;
  const data = await dataAPI.get(progressKey);
  if (!data || typeof data !== 'object') return buildDefaultProgress();
  const raw = data as Partial<UserModuleProgressRecord>;
  return {
    videos: raw.videos ?? {},
    weekStartedAt: raw.weekStartedAt ?? {},
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
  };
}

async function saveProgressRecord(
  record: UserModuleProgressRecord,
  config: ReturnType<typeof getModuleConfig>,
): Promise<void> {
  await dataAPI.save(config.progressKey, {
    ...record,
    updatedAt: new Date().toISOString(),
  });
}


function videoProgressFromRecord(videoId: string, record: UserModuleProgressRecord): VideoProgress {
  const raw = record.videos[videoId];
  if (!raw) {
    return { watched: false, watchedAt: null, watchedPercent: 0 };
  }

  const watchedPercent = clampPercent(raw.watchedPercent);
  return {
    watchedPercent,
    watched: watchedPercent >= 80,
    watchedAt: raw.watchedAt ?? null,
  };
}

function computeModuleCompletion(
  weekKey: ModuleWeekKey,
  record: UserModuleProgressRecord,
  config: ReturnType<typeof getModuleConfig>,
): boolean {
  const queue = config.data[weekKey].queue;
  return queue.every((video) => videoProgressFromRecord(video.id, record).watched);
}


function isWeekUnlocked(
  weekKey: ModuleWeekKey,
  record: UserModuleProgressRecord,
  config: ReturnType<typeof getModuleConfig>,
): boolean {
  const index = config.weekOrder.indexOf(weekKey as never);

  //Unlocked Lock unlock lock
  //if (index <= 0) return true;
  return true;

  const previousWeek = config.weekOrder[index - 1];

  // Previous week must be completed
  if (!computeModuleCompletion(previousWeek, record, config)) {
    return false;
  }

  // Previous week must have been started
  const prevWeekStarted = record.weekStartedAt[previousWeek];

  if (!prevWeekStarted) return false;

  // Seven calendar days must have passed
  const startDate = new Date(prevWeekStarted);

  const startDay = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
  );

  const today = new Date();

  const todayDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const calendarDaysPassed = Math.floor(
    (todayDay.getTime() - startDay.getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return calendarDaysPassed >= 7;
}


function buildModuleWithProgress(
  weekKey: ModuleWeekKey,
  record: UserModuleProgressRecord,
  config: ReturnType<typeof getModuleConfig>,
): ModuleWithProgress {
  const base = config.data[weekKey];
  const queue: QueueVideoWithProgress[] = base.queue.map((video) => ({
    ...video,
    progress: videoProgressFromRecord(video.id, record),
  }));
  const resources: ResourceWithProgress[] = base.resources.map((resource) => ({
    ...resource,
    progress: videoProgressFromRecord(resource.id, record),
  }));
  const watchedCount = queue.filter((video) => video.progress.watched).length;
  const isCompleted = queue.length > 0 && watchedCount === queue.length;
  const overallPercent = queue.length > 0 ? Math.round((watchedCount / queue.length) * 100) : 0;

  const unlocked = isWeekUnlocked(weekKey, record, config);

  return {
    ...base,
    weekKey,
    weekNumber: config.getWeekNumberFromKey(weekKey as never),
    unlocked,
    isLocked: !unlocked,
    daysUntilUnlock: getDaysUntilUnlock(weekKey, record, config),
    completed: isCompleted,
    completionStatus: isCompleted ? 'completed' : watchedCount > 0 ? 'in_progress' : 'not_started',
    overallPercent,
    queue,
    resources,
  };
}

function calculateSummary(record: UserModuleProgressRecord, config: ReturnType<typeof getModuleConfig>): ModulesSummary {
  const modules = config.weekOrder.map((weekKey) => buildModuleWithProgress(weekKey, record, config));
  const completedCount = modules.filter((module) => module.completed).length;

  let inProgressCount = 0;
  let notStartedCount = 0;

  for (const module of modules) {
    if (module.completed) continue;
    const watchedCount = module.queue.filter((video) => video.progress.watched).length;
    if (watchedCount > 0) {
      inProgressCount += 1;
    } else {
      notStartedCount += 1;
    }
  }

  const totalVideos = config.weekOrder.reduce(
    (count, weekKey) => count + config.data[weekKey].queue.length,
    0,
  );
  const watchedVideos = config.weekOrder.reduce((count, weekKey) => {
    return (
      count +
      config.data[weekKey].queue.filter((video) => videoProgressFromRecord(video.id, record).watched)
        .length
    );
  }, 0);

  const overallPercent = totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0;

  return {
    completedCount,
    inProgressCount,
    notStartedCount,
    overallPercent,
    watchedVideos,
    totalVideos,
  };
}

async function saveModuleSummary(
  record: UserModuleProgressRecord,
  config: ReturnType<typeof getModuleConfig>,
): Promise<SavedModuleSummary> {
  const summary = calculateSummary(record, config);

  const savedSummary: SavedModuleSummary = {
    ...summary,
    moduleType: config.moduleType,
    updatedAt: new Date().toISOString(),
  };

  await dataAPI.save(
    `modules_summary_${config.moduleType}_v1`,
    savedSummary
  );

  return savedSummary

}





function findVideoInWeek(weekKey: ModuleWeekKey, videoId: string, config: ReturnType<typeof getModuleConfig>): boolean {
  const week = config.data[weekKey];
  return week.queue.some((video) => video.id === videoId) || week.resources.some((r) => r.id === videoId);
}

function normalizeWeekParam(week: ModuleWeekKey | string, config: ReturnType<typeof getModuleConfig>): ModuleWeekKey {
  if (week in config.data) {
    return week as ModuleWeekKey;
  }

  const fromSlug = config.toWeekKeyFromSlug(week);
  if (fromSlug) return fromSlug;

  throw new Error('Invalid week parameter');
}

export const modulesAPI = {
  async getModules(moduleType?: ModuleType): Promise<ModulesResponse> {
    const config = getModuleConfig(moduleType);
    const record = await getProgressRecord(config);

    const summary = await saveModuleSummary(record, config);

    return {
      endpoint: '/api/modules',
      modules: config.weekOrder.map((weekKey) =>
        buildModuleWithProgress(weekKey, record, config),
      ),
      summary,
    };
  },

  async getModuleWeek(
    week: ModuleWeekKey | string,
  ): Promise<ModuleWeekResponse> {
    const config = getModuleConfig();
    const weekKey = normalizeWeekParam(week, config);
    const record = await getProgressRecord(config);

    return {
      endpoint: '/api/modules/:week',
      module: buildModuleWithProgress(weekKey, record, config),
      summary: calculateSummary(record, config),
    };
  },

  async postVideoProgress(
    week: ModuleWeekKey | string,
    videoId: string,
    body: { watchedPercent: number },
  ): Promise<ProgressPostResponse> {
    const config = getModuleConfig();
    const weekKey = normalizeWeekParam(week, config);

    if (!findVideoInWeek(weekKey, videoId, config)) {
      throw new Error('Video not found for this week');
    }

    const record = await getProgressRecord(config);

    if (!record.weekStartedAt[weekKey]) {
      record.weekStartedAt[weekKey] = new Date().toISOString();
    }

    const watchedPercent = clampPercent(body.watchedPercent);
    const previous = record.videos[videoId];
    const nextWatched = watchedPercent >= 80;

    const updatedProgress: VideoProgress = {
      watchedPercent,
      watched: nextWatched,
      watchedAt: nextWatched
        ? previous?.watchedAt ?? new Date().toISOString()
        : previous?.watchedAt ?? null,
    };

    record.videos[videoId] = updatedProgress;

    await saveProgressRecord(record, config);

    const summary = await saveModuleSummary(record, config);

    return {
      endpoint: '/api/modules/:week/:videoId/progress',
      module: buildModuleWithProgress(weekKey, record, config),
      updatedProgress,
      summary,
    };
  },

  async getProgressSummary() {
    const config = getModuleConfig();
    const record = await getProgressRecord(config);
    const summary = await saveModuleSummary(record, config);

    return {
      endpoint: '/api/modules/progress/summary',
      ...calculateSummary(record, config),
    };
  },

  async getFirstStartedAt(moduleType: ModuleType) {
    const config = getModuleConfig(moduleType);
    const record = await getProgressRecord(config);

    const dates = Object.values(record.weekStartedAt)
      .map(date => new Date(date).getTime())
      .filter(date => !Number.isNaN(date));

    return dates.length > 0 ? Math.min(...dates) : null;
  },

};

