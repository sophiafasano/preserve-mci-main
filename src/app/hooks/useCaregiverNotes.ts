import { useState, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/useAuth';

export interface CaregiverNote {
  id: string;
  note: string;
  type: 'general' | 'encouragement' | 'concern' | 'check-in';
  timestamp: string;
}

export function useCaregiverNotes(patientId: string) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<CaregiverNote[]>([]);
  const [loading, setLoading] = useState(false);

  const dataKey = `caregiver_obs_${patientId}`;

  const fetchNotes = useCallback(async () => {
    if (!user || !patientId) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('app_data')
        .select('value')
        .eq('user_id', user.id)
        .eq('data_key', dataKey)
        .maybeSingle();

      setNotes(Array.isArray(data?.value) ? (data.value as CaregiverNote[]) : []);
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [user, patientId, dataKey]);

  const addNote = useCallback(
    async (noteText: string, type: CaregiverNote['type']) => {
      if (!user || !patientId) throw new Error('Not authenticated');

      const newNote: CaregiverNote = {
        id: crypto.randomUUID(),
        note: noteText,
        type,
        timestamp: new Date().toISOString(),
      };

      const updatedNotes = [newNote, ...notes];

      const { error } = await supabase.from('app_data').upsert(
        { user_id: user.id, data_key: dataKey, value: updatedNotes },
        { onConflict: 'user_id,data_key' }
      );

      if (error) throw error;
      setNotes(updatedNotes);
      return newNote;
    },
    [user, patientId, dataKey, notes]
  );

  const deleteNote = useCallback(
    async (noteId: string) => {
      if (!user || !patientId) return;

      const updatedNotes = notes.filter((n) => n.id !== noteId);

      const { error } = await supabase.from('app_data').upsert(
        { user_id: user.id, data_key: dataKey, value: updatedNotes },
        { onConflict: 'user_id,data_key' }
      );

      if (error) throw error;
      setNotes(updatedNotes);
    },
    [user, patientId, dataKey, notes]
  );

  return { notes, loading, fetchNotes, addNote, deleteNote };
}
