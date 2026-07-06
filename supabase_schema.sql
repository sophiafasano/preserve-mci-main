-- ============================================================
-- Complete Supabase Schema — Sleep Tracker Web App
-- Run this in the Supabase SQL Editor 

-- ── 0. Custom types ────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('patient', 'clinician', 'caregiver', 'care_partner');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── 1. Helper functions (must exist before triggers) ───────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_last_active()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.last_active = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, mobile_number)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')::public.user_role,
    COALESCE(NEW.raw_user_meta_data->>'mobile_number', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_clinician_for_patient(clinician_uuid uuid, patient_uuid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clinician_patients cp
    WHERE cp.clinician_id = clinician_uuid AND cp.patient_id = patient_uuid
  );
$$;

CREATE OR REPLACE FUNCTION public.is_caregiver_for_patient(caregiver_uuid uuid, patient_uuid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.caregiver_patients cvp
    WHERE cvp.caregiver_id = caregiver_uuid AND cvp.patient_id = patient_uuid
  );
$$;

CREATE OR REPLACE FUNCTION public.is_assigned_care_team_member(member_uuid uuid, patient_uuid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clinician_patients cp
    WHERE cp.patient_id = patient_uuid AND cp.clinician_id = member_uuid
  ) OR EXISTS (
    SELECT 1 FROM public.caregiver_patients cvp
    WHERE cvp.patient_id = patient_uuid AND cvp.caregiver_id = member_uuid
  );
$$;

-- ── 2. profiles ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL DEFAULT '',
  full_name     TEXT NOT NULL DEFAULT 'User',
  role          public.user_role NOT NULL DEFAULT 'patient',
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  mobile_number TEXT DEFAULT '',
  age           INTEGER,
  last_active   TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_last_active ON public.profiles;
CREATE TRIGGER set_last_active
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_last_active();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profiles policies
DROP POLICY IF EXISTS "profiles: own read" ON public.profiles;
CREATE POLICY "profiles: own read" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles: own insert" ON public.profiles;
CREATE POLICY "profiles: own insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles: own update" ON public.profiles;
CREATE POLICY "profiles: own update" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles: clinician reads patient" ON public.profiles;
CREATE POLICY "profiles: clinician reads patient" ON public.profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.clinician_patients cp WHERE cp.clinician_id = auth.uid() AND cp.patient_id = profiles.id));

DROP POLICY IF EXISTS "profiles: caregiver reads patient" ON public.profiles;
CREATE POLICY "profiles: caregiver reads patient" ON public.profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.caregiver_patients cvp WHERE cvp.caregiver_id = auth.uid() AND cvp.patient_id = profiles.id));

DROP POLICY IF EXISTS "profiles: caregiver discover patients" ON public.profiles;
CREATE POLICY "profiles: caregiver discover patients" ON public.profiles FOR SELECT
  USING (role::text = 'patient' AND public.current_user_role() IN ('caregiver', 'care_partner'));

DROP POLICY IF EXISTS "profiles: clinician discover patients" ON public.profiles;
CREATE POLICY "profiles: clinician discover patients" ON public.profiles FOR SELECT
  USING (role::text = 'patient' AND public.current_user_role() = 'clinician');

DROP POLICY IF EXISTS "profiles: clinician searches patients" ON public.profiles;
CREATE POLICY "profiles: clinician searches patients" ON public.profiles FOR SELECT
  USING (role::text = 'patient' AND public.current_user_role() = 'clinician');

DROP POLICY IF EXISTS "Caregivers can search patient profiles for connection" ON public.profiles;
CREATE POLICY "Caregivers can search patient profiles for connection" ON public.profiles FOR SELECT
  USING (
    (id = auth.uid())
    OR (role::text = 'patient')
    OR (EXISTS (SELECT 1 FROM clinician_patients WHERE clinician_patients.clinician_id = auth.uid() AND clinician_patients.patient_id = profiles.id))
    OR (EXISTS (SELECT 1 FROM caregiver_patients WHERE caregiver_patients.caregiver_id = auth.uid() AND caregiver_patients.patient_id = profiles.id))
  );

DROP POLICY IF EXISTS "profiles: patient reads assigned care team" ON public.profiles;
CREATE POLICY "profiles: patient reads assigned care team" ON public.profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.clinician_patients cp WHERE cp.patient_id = auth.uid() AND cp.clinician_id = profiles.id)
    OR EXISTS (SELECT 1 FROM public.caregiver_patients cvp WHERE cvp.patient_id = auth.uid() AND cvp.caregiver_id = profiles.id)
  );

DROP POLICY IF EXISTS "profiles: message partner read" ON public.profiles;
CREATE POLICY "profiles: message partner read" ON public.profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM messages m
    WHERE (m.sender_id = auth.uid() AND m.recipient_id = profiles.id)
       OR (m.recipient_id = auth.uid() AND m.sender_id = profiles.id)
  ));


-- ── 3. clinician_patients ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clinician_patients (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinician_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status                 TEXT NOT NULL DEFAULT 'active' CHECK (status = ANY (ARRAY['active','completed','inactive'])),
  risk_level             TEXT NOT NULL DEFAULT 'medium' CHECK (risk_level = ANY (ARRAY['low','medium','high'])),
  notes                  TEXT,
  assigned_at            TIMESTAMP WITH TIME ZONE DEFAULT now(),
  prescribed_sleep_hours NUMERIC,
  UNIQUE (clinician_id, patient_id)
);

ALTER TABLE public.clinician_patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clinician_patients: clinician select" ON public.clinician_patients;
CREATE POLICY "clinician_patients: clinician select" ON public.clinician_patients FOR SELECT USING (auth.uid() = clinician_id);

DROP POLICY IF EXISTS "clinician_patients: clinician insert" ON public.clinician_patients;
CREATE POLICY "clinician_patients: clinician insert" ON public.clinician_patients FOR INSERT WITH CHECK (auth.uid() = clinician_id);

DROP POLICY IF EXISTS "clinician_patients: clinician update" ON public.clinician_patients;
CREATE POLICY "clinician_patients: clinician update" ON public.clinician_patients FOR UPDATE USING (auth.uid() = clinician_id);

DROP POLICY IF EXISTS "clinician_patients: clinician delete" ON public.clinician_patients;
CREATE POLICY "clinician_patients: clinician delete" ON public.clinician_patients FOR DELETE USING (auth.uid() = clinician_id);

DROP POLICY IF EXISTS "clinician_patients: patient reads own" ON public.clinician_patients;
CREATE POLICY "clinician_patients: patient reads own" ON public.clinician_patients FOR SELECT USING (auth.uid() = patient_id);

DROP POLICY IF EXISTS "clinician_patients: caregiver reads for patient" ON public.clinician_patients;
CREATE POLICY "clinician_patients: caregiver reads for patient" ON public.clinician_patients FOR SELECT
  USING (
    public.current_user_role() IN ('caregiver', 'care_partner')
    AND EXISTS (SELECT 1 FROM public.caregiver_patients cvp WHERE cvp.caregiver_id = auth.uid() AND cvp.patient_id = clinician_patients.patient_id)
  );


-- ── 4. caregiver_patients ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.caregiver_patients (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
  relationship_type TEXT DEFAULT 'family member',
  UNIQUE (caregiver_id, patient_id)
);

ALTER TABLE public.caregiver_patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "caregiver_patients: caregiver select" ON public.caregiver_patients;
CREATE POLICY "caregiver_patients: caregiver select" ON public.caregiver_patients FOR SELECT USING (auth.uid() = caregiver_id);

DROP POLICY IF EXISTS "caregiver_patients: caregiver insert" ON public.caregiver_patients;
CREATE POLICY "caregiver_patients: caregiver insert" ON public.caregiver_patients FOR INSERT WITH CHECK (auth.uid() = caregiver_id);

DROP POLICY IF EXISTS "caregiver_patients: caregiver update" ON public.caregiver_patients;
CREATE POLICY "caregiver_patients: caregiver update" ON public.caregiver_patients FOR UPDATE USING (auth.uid() = caregiver_id);

DROP POLICY IF EXISTS "caregiver_patients: caregiver delete" ON public.caregiver_patients;
CREATE POLICY "caregiver_patients: caregiver delete" ON public.caregiver_patients FOR DELETE USING (auth.uid() = caregiver_id);

DROP POLICY IF EXISTS "caregiver_patients: patient reads own" ON public.caregiver_patients;
CREATE POLICY "caregiver_patients: patient reads own" ON public.caregiver_patients FOR SELECT USING (auth.uid() = patient_id);

DROP POLICY IF EXISTS "caregiver_patients: clinician reads for patient" ON public.caregiver_patients;
CREATE POLICY "caregiver_patients: clinician reads for patient" ON public.caregiver_patients FOR SELECT
  USING (
    public.current_user_role() = 'clinician'
    AND EXISTS (SELECT 1 FROM public.clinician_patients cp WHERE cp.clinician_id = auth.uid() AND cp.patient_id = caregiver_patients.patient_id)
  );


-- ── 5. clinician_notes ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clinician_notes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinician_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note         TEXT NOT NULL,
  type         TEXT NOT NULL DEFAULT 'general' CHECK (type = ANY (ARRAY['general','concern','progress','follow-up','recommendation'])),
  read         BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.clinician_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clinician_notes: clinician select" ON public.clinician_notes;
CREATE POLICY "clinician_notes: clinician select" ON public.clinician_notes FOR SELECT USING (auth.uid() = clinician_id);

DROP POLICY IF EXISTS "clinician_notes: clinician insert" ON public.clinician_notes;
CREATE POLICY "clinician_notes: clinician insert" ON public.clinician_notes FOR INSERT WITH CHECK (auth.uid() = clinician_id);

DROP POLICY IF EXISTS "clinician_notes: clinician update" ON public.clinician_notes;
CREATE POLICY "clinician_notes: clinician update" ON public.clinician_notes FOR UPDATE USING (auth.uid() = clinician_id);

DROP POLICY IF EXISTS "clinician_notes: patient reads own" ON public.clinician_notes;
CREATE POLICY "clinician_notes: patient reads own" ON public.clinician_notes FOR SELECT USING (auth.uid() = patient_id);

DROP POLICY IF EXISTS "clinician_notes: patient marks read" ON public.clinician_notes;
CREATE POLICY "clinician_notes: patient marks read" ON public.clinician_notes FOR UPDATE
  USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id AND read = true);


-- ── 6. sleep_logs ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sleep_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date          TIMESTAMP WITH TIME ZONE NOT NULL,
  hours_slept   NUMERIC DEFAULT 0,
  sleep_quality INTEGER DEFAULT 0 CHECK (sleep_quality >= 0 AND sleep_quality <= 10),
  notes         TEXT DEFAULT '',
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT now(),
  local_id      TEXT UNIQUE
);

ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sleep_logs: patient own" ON public.sleep_logs;
CREATE POLICY "sleep_logs: patient own" ON public.sleep_logs FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "sleep_logs: clinician reads patient" ON public.sleep_logs;
CREATE POLICY "sleep_logs: clinician reads patient" ON public.sleep_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.clinician_patients cp WHERE cp.clinician_id = auth.uid() AND cp.patient_id = sleep_logs.user_id));

DROP POLICY IF EXISTS "sleep_logs: caregiver reads patient" ON public.sleep_logs;
CREATE POLICY "sleep_logs: caregiver reads patient" ON public.sleep_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.caregiver_patients cvp WHERE cvp.caregiver_id = auth.uid() AND cvp.patient_id = sleep_logs.user_id));


-- ── 7. messages ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject      TEXT NOT NULL DEFAULT 'No subject',
  content      TEXT NOT NULL,
  attachments  JSONB NOT NULL DEFAULT '[]',
  reply_to_id  UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  read         BOOLEAN NOT NULL DEFAULT false,
  read_at      TIMESTAMP WITH TIME ZONE,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages: sender or recipient select" ON public.messages;
CREATE POLICY "messages: sender or recipient select" ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "messages: sender insert" ON public.messages;
CREATE POLICY "messages: sender insert" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "messages: recipient update" ON public.messages;
CREATE POLICY "messages: recipient update" ON public.messages FOR UPDATE
  USING (auth.uid() = recipient_id OR auth.uid() = sender_id)
  WITH CHECK (auth.uid() = recipient_id OR auth.uid() = sender_id);

DROP POLICY IF EXISTS "messages: sender or recipient delete" ON public.messages;
CREATE POLICY "messages: sender or recipient delete" ON public.messages FOR DELETE
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;

ALTER TABLE public.messages REPLICA IDENTITY FULL;

CREATE INDEX IF NOT EXISTS messages_recipient_id_created_at_idx ON public.messages (recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_sender_id_created_at_idx ON public.messages (sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_conversation_pair_idx ON public.messages (sender_id, recipient_id, created_at ASC);
CREATE INDEX IF NOT EXISTS messages_unread_recipient_idx ON public.messages (recipient_id, read) WHERE read = false;


-- ── 8. app_data ────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS public.app_data_id_seq;

CREATE TABLE IF NOT EXISTS public.app_data (
  id         BIGINT PRIMARY KEY DEFAULT nextval('public.app_data_id_seq'),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_key   TEXT NOT NULL,
  value      JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, data_key)
);

ALTER SEQUENCE public.app_data_id_seq OWNED BY public.app_data.id;

CREATE INDEX IF NOT EXISTS idx_app_data_user_id ON public.app_data USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_app_data_user_key ON public.app_data USING btree (user_id, data_key);
CREATE INDEX IF NOT EXISTS idx_app_data_key_prefix ON public.app_data USING btree (data_key);

DROP TRIGGER IF EXISTS trg_app_data_updated_at ON public.app_data;
CREATE TRIGGER trg_app_data_updated_at
  BEFORE UPDATE ON public.app_data
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.app_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_data: own" ON public.app_data;
CREATE POLICY "app_data: own" ON public.app_data FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "app_data: caregiver/clinician reads module progress" ON public.app_data;
CREATE POLICY "app_data: caregiver/clinician reads module progress" ON public.app_data FOR SELECT
  USING (
    data_key = 'modules_progress_v1'
    AND (
      EXISTS (SELECT 1 FROM public.caregiver_patients cvp WHERE cvp.caregiver_id = auth.uid() AND cvp.patient_id = app_data.user_id)
      OR EXISTS (SELECT 1 FROM public.clinician_patients cp WHERE cp.clinician_id = auth.uid() AND cp.patient_id = app_data.user_id)
    )
  );
