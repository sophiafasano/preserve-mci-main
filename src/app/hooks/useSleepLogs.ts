import { useCallback, useMemo, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../utils/storage';
import { supabase } from '../utils/supabaseClient';

export interface SleepLogData {
  id?: string;
  date: string;
  hoursSlept: number;
  sleepQuality: number;
  bedtime?: string;
  waketime?: string;
  timeOutOfBed?: string;
  napMinutes?: number;
  napTimeOfDay?: string;
  timeToFallAsleep?: number;
  nightAwakenings?: number;
  timeAwakeDuringNight?: number;
  totalSleepMinutes?: number | null;
  sleepEfficiency?: number | null;
  totalWakeMinutes?: number | null;
  // Stimulus Control
  sc_avoid_bedroom_activities?: boolean | null;
  sc_fell_asleep_within_20min?: boolean | null;
  sc_got_up_if_couldnt_sleep?: boolean | null;
  sc_slept_through_night?: boolean | null;
  sc_got_up_after_awakening?: boolean | null;
  sc_avoided_napping?: boolean | null;
  // Sleep Hygiene
  sh_avoided_caffeine?: boolean | null;
  sh_avoided_exercise?: boolean | null;
  sh_avoided_nicotine?: boolean | null;
  sh_avoided_alcohol?: boolean | null;
  sh_avoided_heavy_meals?: boolean | null;
  sh_pleasant_activity?: boolean | null;
  // Thought Record
  tr_situation?: string;
  tr_automatic_thoughts?: string;
  tr_emotion?: string;
  tr_emotion_intensity?: number | null;
}

export interface SleepLogsStorage {
  logs: SleepLogData[];
}

export interface SleepStats {
  averageHours: number;
  averageQuality: number;
  totalLogs: number;
  currentStreak: number;
  bestNight: SleepLogData | null;
  worstNight: SleepLogData | null;
  last7Days: SleepLogData[];
}

/* ── Supabase sync helpers ─────────────────────────────────────────
   Data is split across four tables: the core diary (sleep_logs) plus
   one table per questionnaire, each linked back via (user_id, local_id).
   ─────────────────────────────────────────────────────────────────── */

function toSleepLogRow(log: SleepLogData, userId: string) {
  return {
    local_id: log.id,
    user_id: userId,
    date: log.date,
    hours_slept: log.hoursSlept,
    sleep_quality: log.sleepQuality,
    bedtime: log.bedtime ?? null,
    waketime: log.waketime ?? null,
    time_out_of_bed: log.timeOutOfBed ?? null,
    nap_minutes: log.napMinutes ?? null,
    nap_time_of_day: log.napTimeOfDay ?? null,
    time_to_fall_asleep: log.timeToFallAsleep ?? null,
    night_awakenings: log.nightAwakenings ?? null,
    time_awake_during_night: log.timeAwakeDuringNight ?? null,
    total_sleep_minutes: log.totalSleepMinutes ?? null,
    sleep_efficiency: log.sleepEfficiency ?? null,
    total_wake_minutes: log.totalWakeMinutes ?? null,
  };
}

function toStimulusControlRow(log: SleepLogData, userId: string) {
  return {
    user_id: userId,
    sleep_log_local_id: log.id,
    avoid_bedroom_activities: log.sc_avoid_bedroom_activities ?? null,
    fell_asleep_within_20min: log.sc_fell_asleep_within_20min ?? null,
    got_up_if_couldnt_sleep: log.sc_got_up_if_couldnt_sleep ?? null,
    slept_through_night: log.sc_slept_through_night ?? null,
    got_up_after_awakening: log.sc_got_up_after_awakening ?? null,
    avoided_napping: log.sc_avoided_napping ?? null,
  };
}

function toSleepHygieneRow(log: SleepLogData, userId: string) {
  return {
    user_id: userId,
    sleep_log_local_id: log.id,
    avoided_caffeine: log.sh_avoided_caffeine ?? null,
    avoided_exercise: log.sh_avoided_exercise ?? null,
    avoided_nicotine: log.sh_avoided_nicotine ?? null,
    avoided_alcohol: log.sh_avoided_alcohol ?? null,
    avoided_heavy_meals: log.sh_avoided_heavy_meals ?? null,
    pleasant_activity: log.sh_pleasant_activity ?? null,
  };
}

function toThoughtRecordRow(log: SleepLogData, userId: string) {
  return {
    user_id: userId,
    sleep_log_local_id: log.id,
    situation: log.tr_situation ?? null,
    automatic_thoughts: log.tr_automatic_thoughts ?? null,
    emotion: log.tr_emotion ?? null,
    emotion_intensity: log.tr_emotion_intensity ?? null,
  };
}

async function syncAddToSupabase(log: SleepLogData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // sleep_logs must land first — the questionnaire tables have a foreign
    // key on (user_id, local_id) and will fail if the parent row isn't there yet.
    const { error: parentError } = await supabase
      .from('sleep_logs')
      .upsert(toSleepLogRow(log, user.id), { onConflict: 'user_id,local_id' });
    if (parentError) throw parentError;

    await Promise.all([
      supabase
        .from('stimulus_control_responses')
        .upsert(toStimulusControlRow(log, user.id), { onConflict: 'user_id,sleep_log_local_id' }),
      supabase
        .from('sleep_hygiene_responses')
        .upsert(toSleepHygieneRow(log, user.id), { onConflict: 'user_id,sleep_log_local_id' }),
      supabase
        .from('thought_records')
        .upsert(toThoughtRecordRow(log, user.id), { onConflict: 'user_id,sleep_log_local_id' }),
    ]);
  } catch (e) {
    console.warn('sleep_logs sync failed:', e);
  }
}

const SLEEP_LOG_FIELD_MAP: Partial<Record<keyof SleepLogData, string>> = {
  date: 'date',
  hoursSlept: 'hours_slept',
  sleepQuality: 'sleep_quality',
  bedtime: 'bedtime',
  waketime: 'waketime',
  timeOutOfBed: 'time_out_of_bed',
  napMinutes: 'nap_minutes',
  napTimeOfDay: 'nap_time_of_day',
  timeToFallAsleep: 'time_to_fall_asleep',
  nightAwakenings: 'night_awakenings',
  timeAwakeDuringNight: 'time_awake_during_night',
  totalSleepMinutes: 'total_sleep_minutes',
  sleepEfficiency: 'sleep_efficiency',
  totalWakeMinutes: 'total_wake_minutes',
};

const STIMULUS_CONTROL_FIELD_MAP: Partial<Record<keyof SleepLogData, string>> = {
  sc_avoid_bedroom_activities: 'avoid_bedroom_activities',
  sc_fell_asleep_within_20min: 'fell_asleep_within_20min',
  sc_got_up_if_couldnt_sleep: 'got_up_if_couldnt_sleep',
  sc_slept_through_night: 'slept_through_night',
  sc_got_up_after_awakening: 'got_up_after_awakening',
  sc_avoided_napping: 'avoided_napping',
};

const SLEEP_HYGIENE_FIELD_MAP: Partial<Record<keyof SleepLogData, string>> = {
  sh_avoided_caffeine: 'avoided_caffeine',
  sh_avoided_exercise: 'avoided_exercise',
  sh_avoided_nicotine: 'avoided_nicotine',
  sh_avoided_alcohol: 'avoided_alcohol',
  sh_avoided_heavy_meals: 'avoided_heavy_meals',
  sh_pleasant_activity: 'pleasant_activity',
};

const THOUGHT_RECORD_FIELD_MAP: Partial<Record<keyof SleepLogData, string>> = {
  tr_situation: 'situation',
  tr_automatic_thoughts: 'automatic_thoughts',
  tr_emotion: 'emotion',
  tr_emotion_intensity: 'emotion_intensity',
};

function buildPatch(
  updates: Partial<SleepLogData>,
  fieldMap: Partial<Record<keyof SleepLogData, string>>,
): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  (Object.keys(updates) as (keyof SleepLogData)[]).forEach((key) => {
    if (updates[key] === undefined) return;
    const column = fieldMap[key];
    if (column) patch[column] = updates[key];
  });
  return patch;
}

async function syncUpdateToSupabase(id: string, updates: Partial<SleepLogData>) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const sleepLogPatch = buildPatch(updates, SLEEP_LOG_FIELD_MAP);
    const stimulusControlPatch = buildPatch(updates, STIMULUS_CONTROL_FIELD_MAP);
    const sleepHygienePatch = buildPatch(updates, SLEEP_HYGIENE_FIELD_MAP);
    const thoughtRecordPatch = buildPatch(updates, THOUGHT_RECORD_FIELD_MAP);

    if (Object.keys(sleepLogPatch).length) {
      await supabase.from('sleep_logs').update(sleepLogPatch).eq('local_id', id).eq('user_id', user.id);
    }
    if (Object.keys(stimulusControlPatch).length) {
      await supabase
        .from('stimulus_control_responses')
        .update(stimulusControlPatch)
        .eq('sleep_log_local_id', id)
        .eq('user_id', user.id);
    }
    if (Object.keys(sleepHygienePatch).length) {
      await supabase
        .from('sleep_hygiene_responses')
        .update(sleepHygienePatch)
        .eq('sleep_log_local_id', id)
        .eq('user_id', user.id);
    }
    if (Object.keys(thoughtRecordPatch).length) {
      await supabase
        .from('thought_records')
        .update(thoughtRecordPatch)
        .eq('sleep_log_local_id', id)
        .eq('user_id', user.id);
    }
  } catch (e) {
    console.warn('sleep_logs update sync failed:', e);
  }
}

async function syncDeleteFromSupabase(id: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // Deleting the parent row cascades to the questionnaire tables automatically.
    await supabase.from('sleep_logs').delete().eq('local_id', id).eq('user_id', user.id);
  } catch (e) {
    console.warn('sleep_logs delete sync failed:', e);
  }
}

/* ── Hook ──────────────────────────────────────────────────── */

export function useSleepLogs() {
  const [storage, setStorage] = useLocalStorage<SleepLogsStorage>(
    STORAGE_KEYS.SLEEP_LOGS,
    { logs: [] }
  );

  // On mount: push any un-synced local logs to Supabase
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch IDs already in Supabase for this user
      const { data: existing } = await supabase
        .from('sleep_logs')
        .select('local_id')
        .eq('user_id', user.id);

      const syncedIds = new Set((existing ?? []).map((r: { local_id: string }) => r.local_id));

      // Push any local logs not yet in Supabase
      const unsynced = storage.logs.filter((l) => l.id && !syncedIds.has(l.id));
      for (const log of unsynced) {
        await syncAddToSupabase(log);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addSleepLog = useCallback(
    (logData: Omit<SleepLogData, 'id'>) => {
      const newLog: SleepLogData = { ...logData, id: generateId() };
      setStorage((prev) => ({
        logs: [newLog, ...prev.logs].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
      }));
      syncAddToSupabase(newLog);
      return newLog;
    },
    [setStorage]
  );

  const updateSleepLog = useCallback(
    (id: string, updates: Partial<SleepLogData>) => {
      setStorage((prev) => ({
        logs: prev.logs.map((log) => (log.id === id ? { ...log, ...updates } : log)),
      }));
      syncUpdateToSupabase(id, updates);
    },
    [setStorage]
  );

  const deleteSleepLog = useCallback(
    (id: string) => {
      setStorage((prev) => ({ logs: prev.logs.filter((log) => log.id !== id) }));
      syncDeleteFromSupabase(id);
    },
    [setStorage]
  );

  const getLogsByDateRange = useCallback(
    (startDate: Date, endDate: Date) =>
      storage.logs.filter((log) => {
        const d = new Date(log.date);
        return d >= startDate && d <= endDate;
      }),
    [storage.logs]
  );

  const getLastNDays = useCallback(
    (days: number) => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);
      return getLogsByDateRange(start, end);
    },
    [getLogsByDateRange]
  );

  const stats: SleepStats = useMemo(() => {
    const logs = storage.logs;
    if (logs.length === 0) {
      return { averageHours: 0, averageQuality: 0, totalLogs: 0, currentStreak: 0, bestNight: null, worstNight: null, last7Days: [] };
    }
    const totalHours = logs.reduce((s, l) => s + l.hoursSlept, 0);
    const totalQuality = logs.reduce((s, l) => s + l.sleepQuality, 0);
    const sorted = [...logs].sort((a, b) => b.sleepQuality - a.sleepQuality);
    const end = new Date(); const start = new Date(); start.setDate(start.getDate() - 7);
    return {
      averageHours: Math.round((totalHours / logs.length) * 10) / 10,
      averageQuality: Math.round((totalQuality / logs.length) * 10) / 10,
      totalLogs: logs.length,
      currentStreak: calculateCurrentStreak(logs),
      bestNight: sorted[0],
      worstNight: sorted[sorted.length - 1],
      last7Days: logs.filter((l) => { const d = new Date(l.date); return d >= start && d <= end; }),
    };
  }, [storage.logs]);

  const getChartData = useCallback(
    (days = 7) => {
      const logs = getLastNDays(days);
      const end = new Date();
      return Array.from({ length: days }, (_, i) => {
        const date = new Date(end);
        date.setDate(date.getDate() - (days - 1 - i));
        const dateStr = date.toISOString().split('T')[0];
        const log = logs.find((l) => l.date.split('T')[0] === dateStr);
        return {
          id: dateStr,
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          fullDate: dateStr,
          hours: log ? Number(log.hoursSlept.toFixed(1)) : 0,
          sleepEfficiency: log?.sleepEfficiency ?? null,
          totalWakeMinutes: log?.totalWakeMinutes ?? null,
          hasData: !!log && log.hoursSlept > 0,
        };
      });
    },
    [getLastNDays]
  );

  const clearAllLogs = useCallback(() => setStorage({ logs: [] }), [setStorage]);
  const exportLogs = useCallback(() => JSON.stringify(storage.logs, null, 2), [storage.logs]);

  return {
    logs: storage.logs,
    stats,
    addSleepLog,
    updateSleepLog,
    deleteSleepLog,
    clearAllLogs,
    getLogsByDateRange,
    getLastNDays,
    getChartData,
    exportLogs,
  };
}

function calculateCurrentStreak(logs: SleepLogData[]): number {
  if (!logs.length) return 0;
  const sorted = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  let streak = 0;
  let cur = new Date(); cur.setHours(0, 0, 0, 0);
  for (const log of sorted) {
    const d = new Date(log.date); d.setHours(0, 0, 0, 0);
    const diff = Math.floor((cur.getTime() - d.getTime()) / 86400000);
    if (diff === streak) { streak++; cur = d; } else if (diff > streak) break;
  }
  return streak;
}

function generateId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
