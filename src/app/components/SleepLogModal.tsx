import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface SleepLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SleepLogData) => void;
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
}

function timeToMinutes(time?: string): number | null {
  if (!time) return null;
  const parts = time.split(':');
  if (parts.length < 2) return null;
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return (hours * 60) + minutes;
}

function toHours(bed?: string, wake?: string): number {
  if (!bed || !wake) return 0;
  const bedDate = new Date(`2000-01-01T${bed}:00`);
  let wakeDate = new Date(`2000-01-01T${wake}:00`);
  if (wakeDate < bedDate) {
    wakeDate = new Date(`2000-01-02T${wake}:00`);
  }
  const diff = wakeDate.getTime() - bedDate.getTime();
  return Math.max(0, Math.round((diff / (1000 * 60 * 60)) * 10) / 10);
}

export default function SleepLogModal({ isOpen, onClose, onSubmit }: SleepLogModalProps) {
  const homepagePurple = '#6D28D9';
  const homepagePurpleHover = '#5B21B6';
  const homepageButtonGradient = 'linear-gradient(90deg, #6D28D9 0%, #5B21B6 100%)';

  const [napMinutes, setNapMinutes] = useState<string>('');
  const [napTimeOfDay, setNapTimeOfDay] = useState<string>('Did not nap');
  const [bedtime, setBedtime] = useState<string>('');
  const [timeToFallAsleep, setTimeToFallAsleep] = useState<string>('');
  const [nightAwakenings, setNightAwakenings] = useState<string>('');
  const [timeAwakeDuringNight, setTimeAwakeDuringNight] = useState<string>('');
  const [waketime, setWaketime] = useState<string>('');
  const [timeOutOfBed, setTimeOutOfBed] = useState<string>('');
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);

  const hoursSlept = useMemo(() => toHours(bedtime, waketime), [bedtime, waketime]);

  const resetForm = () => {
    setNapMinutes('');
    setNapTimeOfDay('Did not nap');
    setBedtime('');
    setTimeToFallAsleep('');
    setNightAwakenings('');
    setTimeAwakeDuringNight('');
    setWaketime('');
    setTimeOutOfBed('');
    setSleepQuality(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (sleepQuality == null) {
      toast.error('Please select a sleep quality rating');
      return;
    }

    const bedtimeMinutes = timeToMinutes(bedtime);
    const wakeTimeMinutes = timeToMinutes(waketime);
    const oobMinutes = timeToMinutes(timeOutOfBed);
    const sleepOnsetLatency = timeToFallAsleep ? Number(timeToFallAsleep) : null;   // SOL
    const awakeDuringNight = timeAwakeDuringNight ? Number(timeAwakeDuringNight) : null; // WASO

    // EMA = minutes from wake time to actually getting out of bed
    let ema: number | null = null;
    if (wakeTimeMinutes != null && oobMinutes != null) {
      const diff = oobMinutes >= wakeTimeMinutes
        ? oobMinutes - wakeTimeMinutes
        : (oobMinutes + 1440) - wakeTimeMinutes;
      if (diff >= 0 && diff <= 180) ema = diff;
    }

    // Raw bed-to-wake span (handles midnight wrap)
    let bedToWake: number | null = null;
    if (bedtimeMinutes != null && wakeTimeMinutes != null) {
      bedToWake = wakeTimeMinutes < bedtimeMinutes
        ? (wakeTimeMinutes + 1440) - bedtimeMinutes
        : wakeTimeMinutes - bedtimeMinutes;
    }

    // TIB = (waketime − bedtime) + EMA  (bedtime → out-of-bed)
    const timeInBed = bedToWake != null ? bedToWake + (ema ?? 0) : null;

    // TST = (waketime − bedtime) − SOL − WASO
    let totalSleepMinutes: number | null = null;
    if (bedToWake != null && sleepOnsetLatency != null && awakeDuringNight != null) {
      const computed = bedToWake - sleepOnsetLatency - awakeDuringNight;
      if (Number.isFinite(computed) && computed >= 0) totalSleepMinutes = computed;
    }

    // Sleep Efficiency = TST / TIB × 100
    let sleepEfficiency: number | null = null;
    if (timeInBed != null && timeInBed > 0 && totalSleepMinutes != null) {
      sleepEfficiency = Math.max(0, Math.min(100, Math.round((totalSleepMinutes / timeInBed) * 100)));
    }

    // TWT = SOL + WASO + EMA
    const hasTWT = sleepOnsetLatency != null || awakeDuringNight != null || ema != null;
    const totalWakeMinutes = hasTWT
      ? (sleepOnsetLatency ?? 0) + (awakeDuringNight ?? 0) + (ema ?? 0)
      : null;

    const computedHoursSlept = totalSleepMinutes != null
      ? Math.round(((totalSleepMinutes / 60) * 10)) / 10
      : hoursSlept;

    onSubmit({
      date: new Date().toISOString(),
      hoursSlept: computedHoursSlept,
      sleepQuality,
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
      totalWakeMinutes: totalWakeMinutes != null ? totalWakeMinutes : undefined,
    });

    toast.success('Sleep logged successfully', {
      position: 'bottom-center',
      duration: 3000,
      style: {
        background: '#1A1A2E',
        color: '#FFFFFF',
        borderRadius: '8px',
        padding: '10px 20px',
        fontSize: '13px',
      },
    });

    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

      <div className="relative w-full max-w-[560px] rounded-2xl bg-white p-8 max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A2E' }}>Log Last Night&apos;s Sleep</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 transition-all duration-200 hover:bg-[#F3E8FF] hover:scale-105 active:scale-100"
          >
            <X size={18} strokeWidth={1.5} color="#1A1A2E" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>How many minutes total did you nap yesterday?</label>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={napMinutes}
              onChange={(e) => setNapMinutes(e.target.value)}
              className="w-full rounded-lg border border-[#E9D5FF] px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>What time of the day did you take your nap?</label>
            <div className="flex flex-wrap gap-2">
              {['Morning', 'Afternoon', 'Evening', 'Did not nap'].map((option) => {
                const selected = napTimeOfDay === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setNapTimeOfDay(option)}
                    className="rounded-full px-3 py-1.5 text-sm transition-all duration-200 hover:-translate-y-px hover:shadow-sm active:translate-y-0"
                    style={{
                      backgroundColor: selected ? homepagePurple : '#FFFFFF',
                      color: selected ? '#FFFFFF' : '#6B7280',
                      border: selected ? 'none' : '0.5px solid #E9D5FF',
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>What time did you go to bed last night?</label>
            <input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} className="w-full rounded-lg border border-[#E9D5FF] px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>How long (in minutes) did it take you to fall asleep?</label>
            <input type="number" min={0} value={timeToFallAsleep} onChange={(e) => setTimeToFallAsleep(e.target.value)} className="w-full rounded-lg border border-[#E9D5FF] px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>How many times did you wake up?</label>
            <input type="number" min={0} value={nightAwakenings} onChange={(e) => setNightAwakenings(e.target.value)} className="w-full rounded-lg border border-[#E9D5FF] px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>How many minutes in total did you spend awake?</label>
            <input type="number" min={0} value={timeAwakeDuringNight} onChange={(e) => setTimeAwakeDuringNight(e.target.value)} className="w-full rounded-lg border border-[#E9D5FF] px-3 py-2 text-sm" />
            <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '6px' }}>
              This is used to calculate your sleep trends
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>What time did you wake up this morning?</label>
            <input type="time" value={waketime} onChange={(e) => setWaketime(e.target.value)} className="w-full rounded-lg border border-[#E9D5FF] px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>When did you actually get out of bed after waking up?</label>
            <input type="time" value={timeOutOfBed} onChange={(e) => setTimeOutOfBed(e.target.value)} className="w-full rounded-lg border border-[#E9D5FF] px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>Rate your sleep quality</label>
            <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px' }}>1 = poor, 10 = great</p>
            <div className="grid grid-cols-10 gap-2">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((rating) => {
                const selected = sleepQuality === rating;
                let selectedStyle: React.CSSProperties = {};
                let selectedClass = '';

                if (selected && rating <= 3) {
                  selectedStyle = { backgroundColor: '#FEE2E2', color: '#991B1B' };
                } else if (selected && rating <= 6) {
                  selectedStyle = { backgroundColor: '#FEF9C3', color: '#854D0E' };
                } else if (selected) {
                  selectedStyle = { backgroundColor: '#DCFCE7', color: '#166534' };
                }

                return (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setSleepQuality(rating)}
                    className={`h-9 rounded-md text-sm transition-all duration-200 hover:-translate-y-px hover:shadow-sm active:translate-y-0 ${selectedClass}`}
                    style={
                      selected
                        ? selectedStyle
                        : {
                            backgroundColor: '#F9F7FF',
                            border: '0.5px solid #E9D5FF',
                            color: '#6B7280',
                          }
                    }
                  >
                    {rating}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-[10px] text-white transition-all duration-200 hover:-translate-y-px hover:shadow-md active:translate-y-0"
            style={{
              padding: '12px',
              fontSize: '14px',
              fontWeight: 600,
              border: 'none',
              backgroundImage: homepageButtonGradient,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundImage = `linear-gradient(90deg, ${homepagePurpleHover} 0%, #4C1D95 100%)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundImage = homepageButtonGradient;
            }}
          >
            Save Entry
          </button>
        </form>
      </div>
    </div>
  );
}
