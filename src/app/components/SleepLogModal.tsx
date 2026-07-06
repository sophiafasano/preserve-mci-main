import { useMemo, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface SleepLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SleepLogData) => void;
  existingLogs?: { date: string }[];
}

export interface SleepLogData {
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

function timeToMinutes(time?: string): number | null {
  if (!time) return null;
  const parts = time.split(':');
  if (parts.length < 2) return null;
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

function toHours(bed?: string, wake?: string): number {
  if (!bed || !wake) return 0;
  const bedDate = new Date(`2000-01-01T${bed}:00`);
  let wakeDate = new Date(`2000-01-01T${wake}:00`);
  if (wakeDate < bedDate) wakeDate = new Date(`2000-01-02T${wake}:00`);
  const diff = wakeDate.getTime() - bedDate.getTime();
  return Math.max(0, Math.round((diff / (1000 * 60 * 60)) * 10) / 10);
}

const EMOTIONS = [
  'Helplessness', 'Anxiety', 'Anger', 'Sadness',
  'Happiness', 'Fear', 'Surprise', 'Disgust',
];

const STEPS = ['Sleep Diary', 'Stimulus Control', 'Sleep Hygiene', 'Thought Record'];

const purple = '#6D28D9';
const purpleHover = '#5B21B6';
const gradient = 'linear-gradient(90deg, #6D28D9 0%, #5B21B6 100%)';
const borderColor = '#E9D5FF';

function YesNoButtons({
  value,
  onChange,
  disabled = false,
}: {
  value: boolean | null | undefined;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2 mt-1">
      {[true, false].map((v) => (
        <button
          key={String(v)}
          type="button"
          disabled={disabled}
          onClick={() => onChange(v)}
          className="px-5 py-2 rounded-lg text-sm transition-all duration-200"
          style={{
            backgroundColor:
              value === v ? (v ? '#DCFCE7' : '#FEE2E2') : disabled ? '#F3F4F6' : '#F9F7FF',
            color:
              value === v ? (v ? '#166534' : '#991B1B') : disabled ? '#9CA3AF' : '#6B7280',
            border: `0.5px solid ${value === v ? (v ? '#86EFAC' : '#FCA5A5') : disabled ? '#E5E7EB' : borderColor}`,
            fontWeight: value === v ? 600 : 400,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {v ? 'Yes' : 'No'}
        </button>
      ))}
    </div>
  );
}

function Question({
  label,
  children,
  disabled = false,
}: {
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className={disabled ? 'opacity-40' : ''}>
      <label className="block text-sm" style={{ color: '#1A1A2E' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function SleepLogModal({
  isOpen,
  onClose,
  onSubmit,
  existingLogs = [],
}: SleepLogModalProps) {
  const [step, setStep] = useState(0);

  // Step 1 — Sleep Diary
  const [napMinutes, setNapMinutes] = useState('');
  const [napTimeOfDay, setNapTimeOfDay] = useState('Did not nap');
  const [bedtime, setBedtime] = useState('');
  const [timeToFallAsleep, setTimeToFallAsleep] = useState('');
  const [nightAwakenings, setNightAwakenings] = useState('');
  const [timeAwakeDuringNight, setTimeAwakeDuringNight] = useState('');
  const [waketime, setWaketime] = useState('');
  const [timeOutOfBed, setTimeOutOfBed] = useState('');
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);

  // Step 2 — Stimulus Control
  const [scAvoidBedroom, setScAvoidBedroom] = useState<boolean | null>(null);
  const [scFellAsleep, setScFellAsleep] = useState<boolean | null>(null);
  const [scGotUpCantSleep, setScGotUpCantSleep] = useState<boolean | null>(null);
  const [scSleptThrough, setScSleptThrough] = useState<boolean | null>(null);
  const [scGotUpAwakening, setScGotUpAwakening] = useState<boolean | null>(null);
  const [scAvoidedNapping, setScAvoidedNapping] = useState<boolean | null>(null);

  // Step 3 — Sleep Hygiene
  const [shCaffeine, setShCaffeine] = useState<boolean | null>(null);
  const [shExercise, setShExercise] = useState<boolean | null>(null);
  const [shNicotine, setShNicotine] = useState<boolean | null>(null);
  const [shAlcohol, setShAlcohol] = useState<boolean | null>(null);
  const [shHeavyMeals, setShHeavyMeals] = useState<boolean | null>(null);
  const [shPleasantActivity, setShPleasantActivity] = useState<boolean | null>(null);

  // Step 4 — Thought Record
  const [trSituation, setTrSituation] = useState('');
  const [trThoughts, setTrThoughts] = useState('');
  const [trEmotion, setTrEmotion] = useState('');
  const [trIntensity, setTrIntensity] = useState<number | null>(null);

  const hoursSlept = useMemo(() => toHours(bedtime, waketime), [bedtime, waketime]);

  const hasLoggedToday = useMemo(() => {
    const today = new Date().toDateString();
    return existingLogs.some((log) => new Date(log.date).toDateString() === today);
  }, [existingLogs]);

  const resetForm = () => {
    setStep(0);
    setNapMinutes(''); setNapTimeOfDay('Did not nap'); setBedtime('');
    setTimeToFallAsleep(''); setNightAwakenings(''); setTimeAwakeDuringNight('');
    setWaketime(''); setTimeOutOfBed(''); setSleepQuality(null);
    setScAvoidBedroom(null); setScFellAsleep(null); setScGotUpCantSleep(null);
    setScSleptThrough(null); setScGotUpAwakening(null); setScAvoidedNapping(null);
    setShCaffeine(null); setShExercise(null); setShNicotine(null);
    setShAlcohol(null); setShHeavyMeals(null); setShPleasantActivity(null);
    setTrSituation(''); setTrThoughts(''); setTrEmotion(''); setTrIntensity(null);
  };

  const handleNext = () => {
    if (step === 0 && sleepQuality == null) {
      toast.error('Please select a sleep quality rating');
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = () => {
    const bedtimeMinutes = timeToMinutes(bedtime);
    const wakeTimeMinutes = timeToMinutes(waketime);
    const oobMinutes = timeToMinutes(timeOutOfBed);
    const sleepOnsetLatency = timeToFallAsleep ? Number(timeToFallAsleep) : null;
    const awakeDuringNight = timeAwakeDuringNight ? Number(timeAwakeDuringNight) : null;

    let ema: number | null = null;
    if (wakeTimeMinutes != null && oobMinutes != null) {
      const diff = oobMinutes >= wakeTimeMinutes
        ? oobMinutes - wakeTimeMinutes
        : oobMinutes + 1440 - wakeTimeMinutes;
      if (diff >= 0 && diff <= 180) ema = diff;
    }

    let bedToWake: number | null = null;
    if (bedtimeMinutes != null && wakeTimeMinutes != null) {
      bedToWake = wakeTimeMinutes < bedtimeMinutes
        ? wakeTimeMinutes + 1440 - bedtimeMinutes
        : wakeTimeMinutes - bedtimeMinutes;
    }

    const timeInBed = bedToWake != null ? bedToWake + (ema ?? 0) : null;

    let totalSleepMinutes: number | null = null;
    if (bedToWake != null && sleepOnsetLatency != null && awakeDuringNight != null) {
      const computed = bedToWake - sleepOnsetLatency - awakeDuringNight;
      if (Number.isFinite(computed) && computed >= 0) totalSleepMinutes = computed;
    }

    let sleepEfficiency: number | null = null;
    if (timeInBed != null && timeInBed > 0 && totalSleepMinutes != null) {
      sleepEfficiency = Math.max(0, Math.min(100, Math.round((totalSleepMinutes / timeInBed) * 100)));
    }

    const hasTWT = sleepOnsetLatency != null || awakeDuringNight != null || ema != null;
    const totalWakeMinutes = hasTWT
      ? (sleepOnsetLatency ?? 0) + (awakeDuringNight ?? 0) + (ema ?? 0)
      : null;

    const computedHoursSlept = totalSleepMinutes != null
      ? Math.round((totalSleepMinutes / 60) * 10) / 10
      : hoursSlept;

    onSubmit({
      date: new Date().toISOString(),
      hoursSlept: computedHoursSlept,
      sleepQuality: sleepQuality!,
      notes: '',
      bedtime: bedtime || undefined,
      waketime: waketime || undefined,
      timeOutOfBed: timeOutOfBed || undefined,
      napMinutes: napMinutes ? Number(napMinutes) : undefined,
      napTimeOfDay,
      timeToFallAsleep: sleepOnsetLatency ?? undefined,
      nightAwakenings: nightAwakenings ? Number(nightAwakenings) : undefined,
      timeAwakeDuringNight: awakeDuringNight ?? undefined,
      totalSleepMinutes,
      sleepEfficiency,
      totalWakeMinutes: totalWakeMinutes ?? undefined,
      sc_avoid_bedroom_activities: scAvoidBedroom,
      sc_fell_asleep_within_20min: scFellAsleep,
      sc_got_up_if_couldnt_sleep: scGotUpCantSleep,
      sc_slept_through_night: scSleptThrough,
      sc_got_up_after_awakening: scGotUpAwakening,
      sc_avoided_napping: scAvoidedNapping,
      sh_avoided_caffeine: shCaffeine,
      sh_avoided_exercise: shExercise,
      sh_avoided_nicotine: shNicotine,
      sh_avoided_alcohol: shAlcohol,
      sh_avoided_heavy_meals: shHeavyMeals,
      sh_pleasant_activity: shPleasantActivity,
      tr_situation: trSituation || undefined,
      tr_automatic_thoughts: trThoughts || undefined,
      tr_emotion: trEmotion || undefined,
      tr_emotion_intensity: trIntensity,
    });

    toast.success('Sleep log saved', {
      position: 'bottom-center',
      duration: 3000,
      style: { background: '#1A1A2E', color: '#FFFFFF', borderRadius: '8px', padding: '10px 20px', fontSize: '13px' },
    });

    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-[560px] rounded-2xl bg-white p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A2E' }}>
              Daily Sleep Log
            </h2>
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
              Step {step + 1} of {STEPS.length} — {STEPS[step]}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 transition-all duration-200 hover:bg-[#F3E8FF] hover:scale-105 active:scale-100"
          >
            <X size={18} strokeWidth={1.5} color="#1A1A2E" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-6 flex gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ backgroundColor: i <= step ? purple : '#E9D5FF' }}
            />
          ))}
        </div>

        {/* Already logged */}
        {hasLoggedToday ? (
          <div className="py-8 text-center">
            <p style={{ fontSize: '15px', color: '#1A1A2E', fontWeight: 600, marginBottom: '8px' }}>
              You've already logged today
            </p>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>Come back tomorrow to log again.</p>
          </div>
        ) : (
          <>
            {/* ── STEP 1: Sleep Diary ── */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>
                    How many minutes total did you nap yesterday?
                  </label>
                  <input
                    type="number" min={0} placeholder="0" value={napMinutes}
                    onChange={(e) => setNapMinutes(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor }}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>
                    What time of day did you nap?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Morning', 'Afternoon', 'Evening', 'Did not nap'].map((opt) => (
                      <button
                        key={opt} type="button" onClick={() => setNapTimeOfDay(opt)}
                        className="rounded-full px-3 py-1.5 text-sm transition-all duration-200 hover:-translate-y-px"
                        style={{
                          backgroundColor: napTimeOfDay === opt ? purple : '#FFFFFF',
                          color: napTimeOfDay === opt ? '#FFFFFF' : '#6B7280',
                          border: napTimeOfDay === opt ? 'none' : `0.5px solid ${borderColor}`,
                        }}
                      >{opt}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>What time did you go to bed?</label>
                  <input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor }} />
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>How long (minutes) to fall asleep?</label>
                  <input type="number" min={0} value={timeToFallAsleep} onChange={(e) => setTimeToFallAsleep(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor }} />
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>How many times did you wake up?</label>
                  <input type="number" min={0} value={nightAwakenings} onChange={(e) => setNightAwakenings(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor }} />
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>Total minutes awake during the night?</label>
                  <input type="number" min={0} value={timeAwakeDuringNight} onChange={(e) => setTimeAwakeDuringNight(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor }} />
                  <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>Used to calculate sleep trends</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>What time did you wake up?</label>
                  <input type="time" value={waketime} onChange={(e) => setWaketime(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor }} />
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>When did you get out of bed?</label>
                  <input type="time" value={timeOutOfBed} onChange={(e) => setTimeOutOfBed(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor }} />
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>Rate your sleep quality</label>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px' }}>1 = poor, 10 = great</p>
                  <div className="grid grid-cols-10 gap-2">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((r) => {
                      const sel = sleepQuality === r;
                      const selStyle: React.CSSProperties = sel
                        ? r <= 3 ? { backgroundColor: '#FEE2E2', color: '#991B1B' }
                          : r <= 6 ? { backgroundColor: '#FEF9C3', color: '#854D0E' }
                          : { backgroundColor: '#DCFCE7', color: '#166534' }
                        : { backgroundColor: '#F9F7FF', border: `0.5px solid ${borderColor}`, color: '#6B7280' };
                      return (
                        <button key={r} type="button" onClick={() => setSleepQuality(r)}
                          className="h-9 rounded-md text-sm transition-all duration-200 hover:-translate-y-px hover:shadow-sm"
                          style={selStyle}>{r}</button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Stimulus Control ── */}
            {step === 1 && (
              <div className="space-y-5">
                <Question label="1. Did you avoid bedroom activities besides sleep and sex yesterday?">
                  <YesNoButtons value={scAvoidBedroom} onChange={setScAvoidBedroom} />
                </Question>

                <Question label="2. Did it take less than 15–20 minutes to fall asleep after first going to bed?">
                  <YesNoButtons value={scFellAsleep} onChange={setScFellAsleep} />
                </Question>

                <Question
                  label="3. If No to #2 — Did you get up within 20 minutes and return to bed only when sleepy?"
                  disabled={scFellAsleep !== false}
                >
                  <YesNoButtons value={scGotUpCantSleep} onChange={setScGotUpCantSleep} disabled={scFellAsleep !== false} />
                </Question>

                <Question label="4. Did you sleep through the night, or fall back asleep within 15–20 minutes after each awakening?">
                  <YesNoButtons value={scSleptThrough} onChange={setScSleptThrough} />
                </Question>

                <Question
                  label="5. If No to #4 — Did you get up within 20 minutes and return to bed only when sleepy?"
                  disabled={scSleptThrough !== false}
                >
                  <YesNoButtons value={scGotUpAwakening} onChange={setScGotUpAwakening} disabled={scSleptThrough !== false} />
                </Question>

                <Question label="6. Did you avoid napping yesterday?">
                  <YesNoButtons value={scAvoidedNapping} onChange={setScAvoidedNapping} />
                </Question>
              </div>
            )}

            {/* ── STEP 3: Sleep Hygiene ── */}
            {step === 2 && (
              <div className="space-y-5">
                <Question label="1. Did you avoid caffeine after noon?">
                  <YesNoButtons value={shCaffeine} onChange={setShCaffeine} />
                </Question>
                <Question label="2. Did you avoid exercise within 2 hours of bedtime?">
                  <YesNoButtons value={shExercise} onChange={setShExercise} />
                </Question>
                <Question label="3. Did you avoid nicotine within 2 hours of bedtime?">
                  <YesNoButtons value={shNicotine} onChange={setShNicotine} />
                </Question>
                <Question label="4. Did you avoid alcohol within 2 hours of bedtime?">
                  <YesNoButtons value={shAlcohol} onChange={setShAlcohol} />
                </Question>
                <Question label="5. Did you avoid heavy meals within 2 hours of bedtime?">
                  <YesNoButtons value={shHeavyMeals} onChange={setShHeavyMeals} />
                </Question>
                <Question label="6. Did you engage in a pleasant activity today?">
                  <YesNoButtons value={shPleasantActivity} onChange={setShPleasantActivity} />
                </Question>
              </div>
            )}

            {/* ── STEP 4: Thought Record ── */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>
                    1. What situation came up yesterday that led to an unpleasant emotion?
                  </label>
                  <textarea
                    rows={3} value={trSituation} onChange={(e) => setTrSituation(e.target.value)}
                    placeholder="Describe the situation..."
                    className="w-full rounded-lg border px-3 py-2 text-sm resize-none"
                    style={{ borderColor }}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>
                    2. What automatic thoughts or images came to mind?
                  </label>
                  <textarea
                    rows={3} value={trThoughts} onChange={(e) => setTrThoughts(e.target.value)}
                    placeholder="Describe your thoughts..."
                    className="w-full rounded-lg border px-3 py-2 text-sm resize-none"
                    style={{ borderColor }}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>
                    3. What was your emotional reaction?
                  </label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {EMOTIONS.map((em) => (
                      <button
                        key={em} type="button" onClick={() => setTrEmotion(em)}
                        className="rounded-full px-3 py-1.5 text-sm transition-all duration-200 hover:-translate-y-px"
                        style={{
                          backgroundColor: trEmotion === em ? purple : '#F9F7FF',
                          color: trEmotion === em ? '#FFFFFF' : '#6B7280',
                          border: trEmotion === em ? 'none' : `0.5px solid ${borderColor}`,
                        }}
                      >{em}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>
                    4. Rate the intensity of the emotion (1–100%)
                  </label>
                  <div className="flex items-center gap-4 mt-1">
                    <input
                      type="range" min={1} max={100} value={trIntensity ?? 50}
                      onChange={(e) => setTrIntensity(Number(e.target.value))}
                      className="flex-1 accent-[#6D28D9]"
                    />
                    <span className="w-12 text-center rounded-lg py-1 text-sm font-semibold"
                      style={{ backgroundColor: '#F3E8FF', color: purple }}>
                      {trIntensity ?? '—'}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between gap-3">
              {step > 0 ? (
                <button
                  type="button" onClick={handleBack}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm transition-all duration-200 hover:bg-[#F3E8FF]"
                  style={{ color: purple, border: `0.5px solid ${borderColor}` }}
                >
                  <ChevronLeft size={16} /> Back
                </button>
              ) : <div />}

              {step < STEPS.length - 1 ? (
                <button
                  type="button" onClick={handleNext}
                  className="flex items-center gap-1 px-6 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:shadow-md"
                  style={{ backgroundImage: gradient }}
                >
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button" onClick={handleSubmit}
                  className="flex-1 rounded-[10px] text-white py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-px hover:shadow-md"
                  style={{ backgroundImage: gradient }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundImage = `linear-gradient(90deg, ${purpleHover} 0%, #4C1D95 100%)`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundImage = gradient; }}
                >
                  Save Entry
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
