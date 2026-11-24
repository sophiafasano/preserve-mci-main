import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, publicAnonKey } from '../../../utils/supabase/info';

if (!supabaseUrl || !publicAnonKey) {
  throw new Error(
    'Supabase is not configured. Set VITE_SUPABASE_URL (or VITE_SUPABASE_PROJECT_ID) and VITE_SUPABASE_ANON_KEY in .env.',
  );
}

export const supabase = createClient(supabaseUrl, publicAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
