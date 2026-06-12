-- ============================================================
-- Complete Supabase Schema — Sleep Tracker Web App
-- Run this in the Supabase SQL Editor (safe to re-run; uses
-- IF NOT EXISTS / IF EXISTS guards throughout).
-- ============================================================

-- ── 1. profiles ────────────────────────────────────────────
-- Maps 1-to-1 with auth.users. Created/updated on signup and
-- every sign-in via api.ts → upsertOwnProfile().
CREATE TABLE IF NOT EXISTS public.profiles (
    id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email         TEXT NOT NULL DEFAULT '',
    full_name     TEXT NOT NULL DEFAULT 'User',
    role          TEXT NOT NULL DEFAULT 'patient'
                  CHECK (role IN ('patient', 'clinician', 'caregiver', 'care_partner')),
    mobile_number TEXT NOT NULL DEFAULT '',
    age           INTEGER,
    last_active   TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read and write their own profile
CREATE POLICY IF NOT EXISTS "profiles: own read"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "profiles: own insert"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "profiles: own update"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Clinicians can read profiles of their assigned patients
CREATE POLICY IF NOT EXISTS "profiles: clinician reads patient"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.clinician_patients cp
            WHERE cp.clinician_id = auth.uid()
              AND cp.patient_id   = profiles.id
        )
    );

-- Caregivers can read profiles of their assigned patients
CREATE POLICY IF NOT EXISTS "profiles: caregiver reads patient"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.caregiver_patients cvp
            WHERE cvp.caregiver_id = auth.uid()
              AND cvp.patient_id   = profiles.id
        )
    );

-- Caregivers/care partners can discover patient profiles before linking
CREATE POLICY IF NOT EXISTS "profiles: caregiver discover patients"
    ON public.profiles FOR SELECT
    USING (
        role = 'patient'
        AND EXISTS (
            SELECT 1 FROM public.profiles me
            WHERE me.id = auth.uid()
              AND me.role IN ('caregiver', 'care_partner')
        )
    );

-- Clinicians can discover patient profiles before assignment
CREATE POLICY IF NOT EXISTS "profiles: clinician discover patients"
    ON public.profiles FOR SELECT
    USING (
        role = 'patient'
        AND EXISTS (
            SELECT 1 FROM public.profiles me
            WHERE me.id = auth.uid()
              AND me.role = 'clinician'
        )
    );

-- Patients can read profiles of assigned care team members (for messaging labels)
CREATE POLICY IF NOT EXISTS "profiles: patient reads assigned care team"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.clinician_patients cp
            WHERE cp.patient_id = auth.uid()
              AND cp.clinician_id = profiles.id
        )
        OR EXISTS (
            SELECT 1 FROM public.caregiver_patients cvp
            WHERE cvp.patient_id = auth.uid()
              AND cvp.caregiver_id = profiles.id
        )
    );


-- ── 2. clinician_patients ──────────────────────────────────
-- Links a clinician to each patient they manage.
CREATE TABLE IF NOT EXISTS public.clinician_patients (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinician_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status                TEXT NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active', 'completed', 'inactive')),
    risk_level            TEXT NOT NULL DEFAULT 'medium'
                          CHECK (risk_level IN ('low', 'medium', 'high')),
    notes                 TEXT,
    prescribed_sleep_hours NUMERIC(4,1),
    assigned_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (clinician_id, patient_id)
);

-- Migration: add column if table already exists
ALTER TABLE public.clinician_patients
    ADD COLUMN IF NOT EXISTS prescribed_sleep_hours NUMERIC(4,1);

ALTER TABLE public.clinician_patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "clinician_patients: clinician select"
    ON public.clinician_patients FOR SELECT
    USING (auth.uid() = clinician_id);

CREATE POLICY IF NOT EXISTS "clinician_patients: clinician insert"
    ON public.clinician_patients FOR INSERT
    WITH CHECK (auth.uid() = clinician_id);

CREATE POLICY IF NOT EXISTS "clinician_patients: clinician update"
    ON public.clinician_patients FOR UPDATE
    USING (auth.uid() = clinician_id);

CREATE POLICY IF NOT EXISTS "clinician_patients: clinician delete"
    ON public.clinician_patients FOR DELETE
    USING (auth.uid() = clinician_id);


-- ── 3. caregiver_patients ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.caregiver_patients (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caregiver_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL DEFAULT 'family member',
    assigned_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (caregiver_id, patient_id)
);

-- Migration: add relationship_type if the table already exists without it
ALTER TABLE public.caregiver_patients
    ADD COLUMN IF NOT EXISTS relationship_type TEXT NOT NULL DEFAULT 'family member';

ALTER TABLE public.caregiver_patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "caregiver_patients: caregiver select"
    ON public.caregiver_patients FOR SELECT
    USING (auth.uid() = caregiver_id);

CREATE POLICY IF NOT EXISTS "caregiver_patients: caregiver insert"
    ON public.caregiver_patients FOR INSERT
    WITH CHECK (auth.uid() = caregiver_id);

CREATE POLICY IF NOT EXISTS "caregiver_patients: caregiver update"
    ON public.caregiver_patients FOR UPDATE
    USING (auth.uid() = caregiver_id);

CREATE POLICY IF NOT EXISTS "caregiver_patients: caregiver delete"
    ON public.caregiver_patients FOR DELETE
    USING (auth.uid() = caregiver_id);

-- Patients can read their own caregiver assignments.
-- Required so the "profiles: patient reads assigned care team" policy works —
-- its subquery on caregiver_patients would otherwise return empty due to RLS.
DROP POLICY IF EXISTS "caregiver_patients: patient reads own" ON public.caregiver_patients;
CREATE POLICY "caregiver_patients: patient reads own"
    ON public.caregiver_patients FOR SELECT
    USING (auth.uid() = patient_id);

-- Clinicians can read caregiver assignments for their own patients
-- (so the patient list can display which care partner is linked).
DROP POLICY IF EXISTS "caregiver_patients: clinician reads for patient" ON public.caregiver_patients;
CREATE POLICY "caregiver_patients: clinician reads for patient"
    ON public.caregiver_patients FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.clinician_patients cp
            WHERE cp.clinician_id = auth.uid()
              AND cp.patient_id = caregiver_patients.patient_id
        )
    );


-- Patients can read their own clinician assignments.
-- Required so the "profiles: patient reads assigned care team" policy works —
-- its subquery on clinician_patients would otherwise return empty due to RLS.
DROP POLICY IF EXISTS "clinician_patients: patient reads own" ON public.clinician_patients;
CREATE POLICY "clinician_patients: patient reads own"
    ON public.clinician_patients FOR SELECT
    USING (auth.uid() = patient_id);

-- Caregivers can read clinician assignments for their own patients
-- (so patient-detail pages can show which clinician is assigned).
DROP POLICY IF EXISTS "clinician_patients: caregiver reads for patient" ON public.clinician_patients;
CREATE POLICY "clinician_patients: caregiver reads for patient"
    ON public.clinician_patients FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.caregiver_patients cvp
            WHERE cvp.caregiver_id = auth.uid()
              AND cvp.patient_id = clinician_patients.patient_id
        )
    );


-- ── 4. clinician_notes ─────────────────────────────────────
-- Clinical notes and recommendations written by clinicians.
CREATE TABLE IF NOT EXISTS public.clinician_notes (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinician_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    note         TEXT NOT NULL,
    type         TEXT NOT NULL DEFAULT 'general'
                 CHECK (type IN ('general', 'concern', 'progress', 'follow-up', 'recommendation')),
    read         BOOLEAN NOT NULL DEFAULT false,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.clinician_notes ENABLE ROW LEVEL SECURITY;

-- Clinician can fully manage notes they wrote
CREATE POLICY IF NOT EXISTS "clinician_notes: clinician select"
    ON public.clinician_notes FOR SELECT
    USING (auth.uid() = clinician_id);

CREATE POLICY IF NOT EXISTS "clinician_notes: clinician insert"
    ON public.clinician_notes FOR INSERT
    WITH CHECK (auth.uid() = clinician_id);

CREATE POLICY IF NOT EXISTS "clinician_notes: clinician update"
    ON public.clinician_notes FOR UPDATE
    USING (auth.uid() = clinician_id);

-- Patients can read notes written about them (so they see recommendations)
CREATE POLICY IF NOT EXISTS "clinician_notes: patient reads own"
    ON public.clinician_notes FOR SELECT
    USING (auth.uid() = patient_id);

-- Patients can mark their own notes as read
CREATE POLICY IF NOT EXISTS "clinician_notes: patient marks read"
    ON public.clinician_notes FOR UPDATE
    USING (auth.uid() = patient_id);


-- ── 5. sleep_logs ──────────────────────────────────────────
-- Logged by patients via the app; synced from localStorage.
-- local_id is the client-generated ID used for upsert dedup.
CREATE TABLE IF NOT EXISTS public.sleep_logs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    local_id      TEXT,
    user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date          TEXT NOT NULL,
    hours_slept   NUMERIC(4,2) NOT NULL DEFAULT 0,
    sleep_quality INTEGER NOT NULL DEFAULT 0
                  CHECK (sleep_quality BETWEEN 0 AND 10),
    notes         TEXT NOT NULL DEFAULT '',
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, local_id)
);

-- Migration: widen quality constraint from 0-5 to 0-10 (form uses 1-10 scale)
ALTER TABLE public.sleep_logs
    DROP CONSTRAINT IF EXISTS sleep_logs_sleep_quality_check;
ALTER TABLE public.sleep_logs
    ADD CONSTRAINT sleep_logs_sleep_quality_check CHECK (sleep_quality BETWEEN 0 AND 10);

ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "sleep_logs: patient own"
    ON public.sleep_logs FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Clinicians can read sleep logs for their assigned patients
CREATE POLICY IF NOT EXISTS "sleep_logs: clinician reads patient"
    ON public.sleep_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.clinician_patients cp
            WHERE cp.clinician_id = auth.uid()
              AND cp.patient_id   = sleep_logs.user_id
        )
    );

-- Caregivers can read sleep logs for their assigned patients
CREATE POLICY IF NOT EXISTS "sleep_logs: caregiver reads patient"
    ON public.sleep_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.caregiver_patients cvp
            WHERE cvp.caregiver_id = auth.uid()
              AND cvp.patient_id   = sleep_logs.user_id
        )
    );


-- ── 6. messages ────────────────────────────────────────────
-- Direct messages between any two users (patient ↔ clinician,
-- patient ↔ caregiver, etc.). No separate conversations table
-- needed — conversations are derived from (sender, recipient) pairs.
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
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "messages: sender or recipient select"
    ON public.messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY IF NOT EXISTS "messages: sender insert"
    ON public.messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- Recipient can mark message as read; sender can delete
CREATE POLICY IF NOT EXISTS "messages: recipient update"
    ON public.messages FOR UPDATE
    USING (auth.uid() = recipient_id OR auth.uid() = sender_id);

CREATE POLICY IF NOT EXISTS "messages: sender or recipient delete"
    ON public.messages FOR DELETE
    USING (auth.uid() = sender_id OR auth.uid() = recipient_id);


-- ── 6b. messages — real-time & indexes ────────────────────
-- Enable Supabase real-time replication for instant cross-user updates.
-- Without this, new messages only appear after a page reload.
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- FULL replica identity ensures all row columns are present in the WAL event
-- for both INSERT and UPDATE. Required for real-time row-level filters on
-- non-PK columns (sender_id, recipient_id) to work reliably on UPDATE events.
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Index for the per-user inbox/outbox queries used by getConversations()
CREATE INDEX IF NOT EXISTS messages_recipient_id_created_at_idx
    ON public.messages (recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS messages_sender_id_created_at_idx
    ON public.messages (sender_id, created_at DESC);

-- Composite index for the per-conversation thread query used by getConversation()
CREATE INDEX IF NOT EXISTS messages_conversation_pair_idx
    ON public.messages (sender_id, recipient_id, created_at ASC);

-- Fast unread count lookup
CREATE INDEX IF NOT EXISTS messages_unread_recipient_idx
    ON public.messages (recipient_id, read)
    WHERE read = false;


-- ── 7. app_data ────────────────────────────────────────────
-- Generic key-value store for per-user app preferences and data.
CREATE TABLE IF NOT EXISTS public.app_data (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    data_key TEXT NOT NULL,
    value    JSONB,
    UNIQUE (user_id, data_key)
);

ALTER TABLE public.app_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "app_data: own"
    ON public.app_data FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Caregivers and clinicians can read assigned patients' module progress only.
CREATE POLICY IF NOT EXISTS "app_data: caregiver/clinician reads module progress"
    ON public.app_data FOR SELECT
    USING (
        data_key = 'modules_progress_v1'
        AND (
            EXISTS (
                SELECT 1 FROM public.caregiver_patients cvp
                WHERE cvp.caregiver_id = auth.uid()
                  AND cvp.patient_id   = app_data.user_id
            )
            OR EXISTS (
                SELECT 1 FROM public.clinician_patients cp
                WHERE cp.clinician_id = auth.uid()
                  AND cp.patient_id   = app_data.user_id
            )
        )
    );
