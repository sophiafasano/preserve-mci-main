import { useCallback, useMemo, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../utils/storage';
import { supabase } from '../utils/supabaseClient';

export interface SleepLogData {
  id?: string;
  date: string;
  hoursSlept: number;
  sleepQuality: number;
  notes: string;
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

/* ── Supabase sync helpers ─────────────────────────────────── */

async function syncAddToSupabase(log: SleepLogData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('sleep_logs').upsert({
      local_id: log.id,
      user_id: user.id,
      date: log.date,
      hours_slept: log.hoursSlept,
      sleep_quality: log.sleepQuality,
      notes: log.notes ?? '',
    }, { onConflict: 'user_id,local_id' });
  } catch (e) {
    console.warn('sleep_logs sync failed:', e);
  }
}

async function syncUpdateToSupabase(id: string, updates: Partial<SleepLogData>) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const patch: Record<string, unknown> = {};
    if (updates.hoursSlept !== undefined) patch.hours_slept = updates.hoursSlept;
    if (updates.sleepQuality !== undefined) patch.sleep_quality = updates.sleepQuality;
    if (updates.notes !== undefined) patch.notes = updates.notes;
    if (updates.date !== undefined) patch.date = updates.date;
    if (!Object.keys(patch).length) return;
    await supabase.from('sleep_logs').update(patch).eq('local_id', id).eq('user_id', user.id);
  } catch (e) {
    console.warn('sleep_logs update sync failed:', e);
  }
}

async function syncDeleteFromSupabase(id: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
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
