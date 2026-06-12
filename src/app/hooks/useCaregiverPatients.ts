import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/useAuth';
import { moduleData, moduleWeekOrder } from '../data/moduleData';

const MODULE_PROGRESS_KEY = 'modules_progress_v1';
const TOTAL_MODULE_VIDEOS = moduleWeekOrder.reduce(
  (count, weekKey) => count + moduleData[weekKey].queue.length,
  0,
);

export interface CaregiverPatient {
  id: string;
  patientId: string;
  name: string;
  email: string;
  age?: number;
  dateConnected: string;
  lastActive?: string;
  relationshipType: string;
  sleepLogsCount: number;
  avgSleepHours?: number;
  avgSleepQuality?: number;
  lastSleepLog?: {
    date: string;
    hoursSlept: number;
    sleepQuality: number;
  };
  moduleVideosWatched: number;
  moduleVideosTotal: number;
  moduleVideosLeft: number;
  moduleCompletionPercent: number;
  moduleCompletedWeeks: number;
}

export interface CaregiverStats {
  totalPatients: number;
  activePatients: number;
  patientsNeedingAttention: number;
}

type LogRow = {
  user_id: string;
  date: string;
  hours_slept: number;
  sleep_quality: number;
  created_at: string;
};

type ModuleProgressRecord = {
  videos?: Record<string, { watched?: boolean; watchedPercent?: number }>;
};

type ModuleProgressRow = {
  user_id: string;
  value: ModuleProgressRecord | null;
};

function isVideoWatched(progress?: { watched?: boolean; watchedPercent?: number }) {
  if (!progress) return false;
  if (typeof progress.watched === 'boolean') return progress.watched;
  return (progress.watchedPercent ?? 0) >= 80;
}

function getModuleMetrics(progress: ModuleProgressRecord | undefined) {
  const videos = progress?.videos ?? {};

  let watchedVideos = 0;
  for (const weekKey of moduleWeekOrder) {
    for (const video of moduleData[weekKey].queue) {
      if (isVideoWatched(videos[video.id])) {
        watchedVideos += 1;
      }
    }
  }

  const completedWeeks = moduleWeekOrder.reduce((count, weekKey) => {
    const weekComplete = moduleData[weekKey].queue.every((video) => isVideoWatched(videos[video.id]));
    return weekComplete ? count + 1 : count;
  }, 0);

  const videosLeft = Math.max(0, TOTAL_MODULE_VIDEOS - watchedVideos);
  const completionPercent =
    TOTAL_MODULE_VIDEOS > 0 ? Math.round((watchedVideos / TOTAL_MODULE_VIDEOS) * 100) : 0;

  return {
    watchedVideos,
    videosLeft,
    completionPercent,
    completedWeeks,
  };
}

export function useCaregiverPatients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<CaregiverPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CaregiverStats>({
    totalPatients: 0,
    activePatients: 0,
    patientsNeedingAttention: 0,
  });

  const fetchPatients = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: cpRows, error } = await supabase
        .from('caregiver_patients')
        .select('id, patient_id, assigned_at, relationship_type')
        .eq('caregiver_id', user.id);

      if (error) throw error;
      if (!cpRows || cpRows.length === 0) {
        setPatients([]);
        setStats({ totalPatients: 0, activePatients: 0, patientsNeedingAttention: 0 });
        setLoading(false);
        return;
      }

      const patientIds = cpRows.map((r) => r.patient_id);

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, age, last_active')
        .in('id', patientIds);
      if (profilesError) throw profilesError;

      const { data: sleepLogs, error: logsError } = await supabase
        .from('sleep_logs')
        .select('user_id, date, hours_slept, sleep_quality, created_at')
        .in('user_id', patientIds)
        .order('created_at', { ascending: false });
      if (logsError) throw logsError;

      const { data: moduleProgressRows, error: moduleProgressError } = await supabase
        .from('app_data')
        .select('user_id, value')
        .eq('data_key', MODULE_PROGRESS_KEY)
        .in('user_id', patientIds);

      if (moduleProgressError) {
        console.warn('Unable to load patient module progress:', moduleProgressError.message);
      }

      const logsByPatient: Record<string, LogRow[]> = {};
      for (const log of (sleepLogs ?? []) as LogRow[]) {
        if (!logsByPatient[log.user_id]) logsByPatient[log.user_id] = [];
        logsByPatient[log.user_id].push(log);
      }

      const moduleProgressByPatient = new Map<string, ModuleProgressRecord>();
      for (const row of (moduleProgressRows ?? []) as ModuleProgressRow[]) {
        if (!row.value || typeof row.value !== 'object') continue;
        moduleProgressByPatient.set(row.user_id, row.value);
      }

      const now = new Date();
      let active = 0;
      let needsAttention = 0;

      const enriched: CaregiverPatient[] = cpRows.map((row) => {
        const profile = profiles?.find((p) => p.id === row.patient_id);
        const logs = logsByPatient[row.patient_id] ?? [];
        const lastLog = logs[0];
        const lastActive = profile?.last_active;
        const daysSinceActive = lastActive
          ? Math.floor((now.getTime() - new Date(lastActive).getTime()) / 86400000)
          : 999;

        if (daysSinceActive <= 7) active++;
        if (daysSinceActive > 3) needsAttention++;

        const avgHours =
          logs.length > 0
            ? logs.reduce((s, l) => s + l.hours_slept, 0) / logs.length
            : undefined;
        const avgQuality =
          logs.length > 0
            ? logs.reduce((s, l) => s + l.sleep_quality, 0) / logs.length
            : undefined;

        const moduleMetrics = getModuleMetrics(moduleProgressByPatient.get(row.patient_id));

        return {
          id: row.id,
          patientId: row.patient_id,
          name: profile?.full_name ?? 'Unknown Patient',
          email: profile?.email ?? '',
          age: profile?.age,
          dateConnected: row.assigned_at,
          lastActive,
          relationshipType: row.relationship_type ?? 'family member',
          sleepLogsCount: logs.length,
          avgSleepHours: avgHours,
          avgSleepQuality: avgQuality,
          lastSleepLog: lastLog
            ? {
                date: lastLog.date,
                hoursSlept: lastLog.hours_slept,
                sleepQuality: lastLog.sleep_quality,
              }
            : undefined,
          moduleVideosWatched: moduleMetrics.watchedVideos,
          moduleVideosTotal: TOTAL_MODULE_VIDEOS,
          moduleVideosLeft: moduleMetrics.videosLeft,
          moduleCompletionPercent: moduleMetrics.completionPercent,
          moduleCompletedWeeks: moduleMetrics.completedWeeks,
        };
      });

      setPatients(enriched);
      setStats({
        totalPatients: enriched.length,
        activePatients: active,
        patientsNeedingAttention: needsAttention,
      });
    } catch (err) {
      console.error('Failed to fetch caregiver patients:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const searchUnassignedPatients = async (query: string) => {
    if (!query.trim() || !user) return [];
    const sanitized = query.trim().replace(/[,%]/g, '');
    const currentIds = patients.map((p) => p.patientId);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'patient')
      .or(`full_name.ilike.%${sanitized}%,email.ilike.%${sanitized}%`)
      .limit(20);
    if (error) throw error;
    return (data ?? []).filter((p) => !currentIds.includes(p.id));
  };

  const addPatient = async (patientId: string, relationshipType = 'family member') => {
    if (!user) throw new Error('Not authenticated');
    const { error } = await supabase.from('caregiver_patients').insert({
      caregiver_id: user.id,
      patient_id: patientId,
      relationship_type: relationshipType,
    });
    if (error) {
      // Already connected: keep UI in sync and treat as idempotent success.
      if ((error as { code?: string }).code === '23505') {
        await fetchPatients();
        return;
      }
      throw error;
    }
    await fetchPatients();
  };

  const getPatientById = (patientId: string) =>
    patients.find((p) => p.patientId === patientId);

  return {
    patients,
    loading,
    stats,
    addPatient,
    getPatientById,
    searchUnassignedPatients,
    refreshPatients: fetchPatients,
  };
}
