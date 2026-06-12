import { dataAPI } from './api';
import {
  moduleData,
  moduleWeekOrder,
  toWeekKeyFromSlug,
  type ModuleQueueVideo,
  type ModuleResource,
  type ModuleWeekKey,
  type WeekModuleData,
  weekNumberFromKey,
} from '../data/moduleData';

const MODULE_PROGRESS_KEY = 'modules_progress_v1';

export interface VideoProgress {
  watched: boolean;
  watchedAt: string | null;
  watchedPercent: number;
}

export interface UserModuleProgressRecord {
  videos: Record<string, VideoProgress>;
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

function buildDefaultProgress(): UserModuleProgressRecord {
  return {
    videos: {},
    updatedAt: new Date().toISOString(),
  };
}

function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

async function getProgressRecord(): Promise<UserModuleProgressRecord> {
  const data = await dataAPI.get(MODULE_PROGRESS_KEY);

  if (!data || typeof data !== 'object') {
    return buildDefaultProgress();
  }

  const raw = data as Partial<UserModuleProgressRecord>;
  return {
    videos: raw.videos ?? {},
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
  };
}

async function saveProgressRecord(record: UserModuleProgressRecord): Promise<void> {
  await dataAPI.save(MODULE_PROGRESS_KEY, {
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
): boolean {
  const queue = moduleData[weekKey].queue;
  return queue.every((video) => videoProgressFromRecord(video.id, record).watched);
}

function isWeekUnlocked(weekKey: ModuleWeekKey, record: UserModuleProgressRecord): boolean {
  if (weekKey === 'week1') return true;

  const index = moduleWeekOrder.indexOf(weekKey);
  if (index <= 0) return true;
  const previousWeek = moduleWeekOrder[index - 1];
  return computeModuleCompletion(previousWeek, record);
}

function buildModuleWithProgress(
  weekKey: ModuleWeekKey,
  record: UserModuleProgressRecord,
): ModuleWithProgress {
  const base = moduleData[weekKey];
  const queue: QueueVideoWithProgress[] = base.queue.map((video) => ({
    ...video,
    progress: videoProgressFromRecord(video.id, record),
  }));
  const resources: ResourceWithProgress[] = base.resources.map((resource) => ({
    ...resource,
    progress: videoProgressFromRecord(resource.id, record),
  }));
  const watchedCount = queue.filter((video) => video.progress.watched).length;
  const isCompleted = watchedCount === queue.length;
  const overallPercent = queue.length > 0 ? Math.round((watchedCount / queue.length) * 100) : 0;

  return {
    ...base,
    weekKey,
    weekNumber: weekNumberFromKey(weekKey),
    unlocked: isWeekUnlocked(weekKey, record),
    isLocked: !isWeekUnlocked(weekKey, record),
    completed: isCompleted,
    completionStatus: isCompleted ? 'completed' : watchedCount > 0 ? 'in_progress' : 'not_started',
    overallPercent,
    queue,
    resources,
  };
}

function calculateSummary(record: UserModuleProgressRecord): ModulesSummary {
  const modules = moduleWeekOrder.map((weekKey) => buildModuleWithProgress(weekKey, record));
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

  const totalVideos = moduleWeekOrder.reduce(
    (count, weekKey) => count + moduleData[weekKey].queue.length,
    0,
  );
  const watchedVideos = moduleWeekOrder.reduce((count, weekKey) => {
    return (
      count +
      moduleData[weekKey].queue.filter((video) => videoProgressFromRecord(video.id, record).watched)
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

function findVideoInWeek(weekKey: ModuleWeekKey, videoId: string): boolean {
  const week = moduleData[weekKey];
  return week.queue.some((video) => video.id === videoId) || week.resources.some((r) => r.id === videoId);
}

function normalizeWeekParam(week: ModuleWeekKey | string): ModuleWeekKey {
  if (week in moduleData) {
    return week as ModuleWeekKey;
  }

  const fromSlug = toWeekKeyFromSlug(week);
  if (fromSlug) return fromSlug;

  throw new Error('Invalid week parameter');
}

export const modulesAPI = {
  async getModules(): Promise<ModulesResponse> {
    const record = await getProgressRecord();
    return {
      endpoint: '/api/modules',
      modules: moduleWeekOrder.map((weekKey) => buildModuleWithProgress(weekKey, record)),
      summary: calculateSummary(record),
    };
  },

  async getModuleWeek(week: ModuleWeekKey | string): Promise<ModuleWeekResponse> {
    const weekKey = normalizeWeekParam(week);
    const record = await getProgressRecord();
    return {
      endpoint: '/api/modules/:week',
      module: buildModuleWithProgress(weekKey, record),
      summary: calculateSummary(record),
    };
  },

  async postVideoProgress(
    week: ModuleWeekKey | string,
    videoId: string,
    body: { watchedPercent: number },
  ): Promise<ProgressPostResponse> {
    const weekKey = normalizeWeekParam(week);
    if (!findVideoInWeek(weekKey, videoId)) {
      throw new Error('Video not found for this week');
    }

    const record = await getProgressRecord();
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

    await saveProgressRecord(record);

    return {
      endpoint: '/api/modules/:week/:videoId/progress',
      module: buildModuleWithProgress(weekKey, record),
      updatedProgress,
      summary: calculateSummary(record),
    };
  },

  async getProgressSummary(): Promise<ModulesSummary & { endpoint: '/api/modules/progress/summary' }> {
    const record = await getProgressRecord();
    return {
      endpoint: '/api/modules/progress/summary',
      ...calculateSummary(record),
    };
  },
};
