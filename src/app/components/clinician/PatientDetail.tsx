import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  Send,
  FileText,
  Calendar,
  User,
  Inbox,
  Plus,
  Check,
  CheckCheck,
  ShieldCheck,
  Moon,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useClinicianPatients } from '../../hooks/useClinicianPatients';
import { useMessaging } from '../../hooks/useMessaging';
import { useAuth } from '../../contexts/useAuth';
import { supabase } from '../../utils/supabaseClient';
import { toast } from 'sonner';

/* ──────────────────────── Design tokens ──────────────────────── */
const token = {
  white: '#FFFFFF',
  purple100: '#F3E9FB',
  purple200: '#E9D5FF',
  purple700: '#6D28D9',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray400: '#9CA3AF',
  gray600: '#6B7280',
  text: '#1A1A2E',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: token.white,
  border: `0.5px solid ${token.purple100}`,
  borderRadius: '14px',
  padding: '18px 20px',
};

const riskConfig = {
  high:   { label: 'High',   bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA' },
  medium: { label: 'Medium', bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
  low:    { label: 'Low',    bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' },
};

type SleepLogEntry = { date: string; hoursSlept: number; sleepQuality: number };

/* ──────────────────────── Component ──────────────────────── */
export default function PatientDetail() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { getPatientById, addNote, getPatientNotes, updatePatient } = useClinicianPatients();
  const { sendMessage } = useMessaging();
  const { user } = useAuth();

  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState<'general' | 'concern' | 'progress' | 'follow-up'>('general');

  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isRecModalOpen, setIsRecModalOpen] = useState(false);
  const [recText, setRecText] = useState('');

  const [prescriptionInput, setPrescriptionInput] = useState('');
  const [prescriptionSaving, setPrescriptionSaving] = useState(false);

  /* ── Sleep logs — fetched from Supabase ── */
  const [sleepLogs, setSleepLogs] = useState<SleepLogEntry[]>([]);
  useEffect(() => {
    if (!patientId) return;
    supabase
      .from('sleep_logs')
      .select('date, hours_slept, sleep_quality')
      .eq('user_id', patientId)
      .order('date', { ascending: true })
      .limit(30)
      .then(({ data }) => {
        setSleepLogs(
          (data ?? []).map((r) => ({
            date: r.date as string,
            hoursSlept: r.hours_slept as number,
            sleepQuality: r.sleep_quality as number,
          }))
        );
      });
  }, [patientId]);

  const patient = patientId ? getPatientById(patientId) : null;
  const patientNotes = patientId ? getPatientNotes(patientId) : [];

  // Seed prescription input when patient data is available
  useEffect(() => {
    if (patient?.prescribedSleepHours != null) {
      setPrescriptionInput(String(patient.prescribedSleepHours));
    }
  }, [patient?.prescribedSleepHours]);
  const recommendations = patientNotes.filter((n) => n.type === 'recommendation');
  const regularNotes = patientNotes.filter((n) => n.type !== 'recommendation');

  /* ── Sleep analytics ── */
  const sleepAvg = useMemo(
    () => sleepLogs.length > 0 ? (sleepLogs.reduce((s: number, l: SleepLogEntry) => s + l.hoursSlept, 0) / sleepLogs.length).toFixed(1) : null,
    [sleepLogs]
  );
  const qualityAvg = useMemo(
    () => sleepLogs.length > 0 ? (sleepLogs.reduce((s: number, l: SleepLogEntry) => s + l.sleepQuality, 0) / sleepLogs.length).toFixed(1) : null,
    [sleepLogs]
  );
  const sleepChartData = useMemo(
    () => sleepLogs.slice(-14).map((log: SleepLogEntry) => ({
      shortDate: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      hours: log.hoursSlept,
    })),
    [sleepLogs]
  );
  const weekdayAvgSleep = useMemo(() => {
    const wd = sleepLogs.filter((l: SleepLogEntry) => { const d = new Date(l.date).getDay(); return d >= 1 && d <= 5; });
    return wd.length > 0 ? (wd.reduce((s: number, l: SleepLogEntry) => s + l.hoursSlept, 0) / wd.length).toFixed(1) : null;
  }, [sleepLogs]);
  const weekendAvgSleep = useMemo(() => {
    const we = sleepLogs.filter((l: SleepLogEntry) => { const d = new Date(l.date).getDay(); return d === 0 || d === 6; });
    return we.length > 0 ? (we.reduce((s: number, l: SleepLogEntry) => s + l.hoursSlept, 0) / we.length).toFixed(1) : null;
  }, [sleepLogs]);
  const sleepConsistency = useMemo(() => {
    if (sleepLogs.length < 3) return null;
    const recent = sleepLogs.slice(-14).map((l: SleepLogEntry) => l.hoursSlept);
    const mean = recent.reduce((s: number, h: number) => s + h, 0) / recent.length;
    const variance = recent.reduce((s: number, h: number) => s + (h - mean) ** 2, 0) / recent.length;
    return Math.max(0, Math.round(100 - Math.sqrt(variance) * 20));
  }, [sleepLogs]);
  const sleepTrend = useMemo(() => {
    if (sleepLogs.length < 7) return 'stable' as const;
    const mid = Math.floor(sleepLogs.length / 2);
    const firstAvg = sleepLogs.slice(0, mid).reduce((s: number, l: SleepLogEntry) => s + l.hoursSlept, 0) / mid;
    const secondAvg = sleepLogs.slice(mid).reduce((s: number, l: SleepLogEntry) => s + l.hoursSlept, 0) / (sleepLogs.length - mid);
    const diff = secondAvg - firstAvg;
    return diff > 0.3 ? 'improving' as const : diff < -0.3 ? 'declining' as const : 'stable' as const;
  }, [sleepLogs]);
  const sleepWeeklyBreakdown = useMemo(() => {
    const now = new Date();
    return [3, 2, 1, 0].map((w) => {
      const start = new Date(now); start.setDate(start.getDate() - (w + 1) * 7);
      const end = new Date(now); end.setDate(end.getDate() - w * 7);
      const wl = sleepLogs.filter((l: SleepLogEntry) => { const d = new Date(l.date); return d >= start && d < end; });
      return {
        label: w === 0 ? 'This week' : w === 1 ? 'Last week' : `${w + 1} weeks ago`,
        logs: wl.length,
        avgHours: wl.length > 0 ? +(wl.reduce((s: number, l: SleepLogEntry) => s + l.hoursSlept, 0) / wl.length).toFixed(1) : 0,
        avgQuality: wl.length > 0 ? +(wl.reduce((s: number, l: SleepLogEntry) => s + l.sleepQuality, 0) / wl.length).toFixed(1) : 0,
      };
    });
  }, [sleepLogs]);

  /* ── Not found ── */
  if (!patient) {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate('/clinician/patients')} className="inline-flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white transition-colors" aria-label="Back to Patients">
          <ArrowLeft size={18} color="#7200CA" />
          <span style={{ fontSize: '14px', fontWeight: 500, color: token.gray600 }}>Back to Patients</span>
        </button>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: token.gray100 }}>
            <User size={24} strokeWidth={1.5} color={token.gray400} />
          </div>
          <h2 className="text-[18px] font-[600] mb-1" style={{ color: token.text }}>Patient Not Found</h2>
          <p className="text-[13px] mb-4" style={{ color: token.gray600 }}>The requested patient could not be found.</p>
          <button onClick={() => navigate('/clinician/patients')} className="px-4 py-2 rounded-lg text-[13px] font-[500] transition-all" style={{ backgroundColor: token.purple700, color: token.white }}>
            View All Patients
          </button>
        </div>
      </div>
    );
  }

  const risk = riskConfig[patient.riskLevel];

  /* ── Real data from patient record ── */
  const daysSinceLastActive = Math.floor((Date.now() - new Date(patient.lastActive).getTime()) / 86400000);
  const daysEnrolled = Math.floor((Date.now() - new Date(patient.dateEnrolled).getTime()) / 86400000);
  const lastActiveLabel = daysSinceLastActive === 0 ? 'Today' : daysSinceLastActive === 1 ? 'Yesterday' : `${daysSinceLastActive} days ago`;

  /* ── Stat cards (all from real patient record) ── */
  const statCards = [
    {
      label: 'Last Active',
      value: daysSinceLastActive === 0 ? 'Today' : daysSinceLastActive === 1 ? '1 day ago' : `${daysSinceLastActive}d ago`,
      sub: daysSinceLastActive <= 3 ? 'Engaging well' : 'Follow-up recommended',
      icon: Clock,
    },
    {
      label: 'Days Enrolled',
      value: String(daysEnrolled),
      sub: 'Days in program',
      icon: Calendar,
    },
    {
      label: 'Clinical Notes',
      value: String(regularNotes.length),
      sub: regularNotes.length > 0 ? 'Notes recorded' : 'No notes yet',
      icon: FileText,
    },
    {
      label: 'Recommendations',
      value: String(recommendations.length),
      sub: `${recommendations.filter((r) => r.read).length} acknowledged`,
      icon: ShieldCheck,
    },
  ];

  /* ── Patient info fields ── */
  const infoFields = [
    { label: 'Patient ID',   value: patient.id },
    { label: 'Age',          value: patient.age ? `${patient.age} years old` : 'Not specified' },
    { label: 'Email',        value: patient.email },
    { label: 'Enrolled',     value: new Date(patient.dateEnrolled).toLocaleDateString() },
    { label: 'Last Active',  value: lastActiveLabel },
    { label: 'Care Partner', value: patient.carePartnerName || 'None assigned' },
  ];

  const noteTypeConfig: Record<string, { bg: string; color: string }> = {
    concern:    { bg: '#FEF2F2', color: '#B91C1C' },
    'follow-up': { bg: '#FFFBEB', color: '#B45309' },
    progress:   { bg: '#F0FDF4', color: '#166534' },
    general:    { bg: token.gray100, color: token.gray600 },
  };

  const handleSavePrescription = async () => {
    if (!patientId) return;
    const val = parseFloat(prescriptionInput);
    if (!Number.isFinite(val) || val <= 0 || val > 24) {
      toast.error('Please enter a valid number of hours (e.g. 7.5)');
      return;
    }
    setPrescriptionSaving(true);
    try {
      await updatePatient(patientId, { prescribedSleepHours: val });
      toast.success(`Sleep prescription set to ${val} hrs for ${patient?.name}`);
    } catch {
      toast.error('Failed to save prescription');
    } finally {
      setPrescriptionSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !patientId) { toast.error('Please enter a note'); return; }
    const saved = await addNote({ patientId, clinicianId: user?.id ?? '', note: noteText, type: noteType });
    if (!saved) { toast.error('Failed to save note'); return; }
    try {
      await sendMessage(patient.id, `Clinical Note (${noteType}): ${noteText.trim()}`);
    } catch {
      // notification failure is non-critical
    }
    toast.success('Note added and patient notified');
    setNoteText('');
  };

  return (
    <div className="space-y-6">
      {/* Back to Dashboard */}
      <button
        onClick={() => navigate('/clinician/patients')}
        className="inline-flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white transition-colors"
        aria-label="Back to Patients"
      >
        <ArrowLeft size={18} color="#7200CA" />
        <span style={{ fontSize: '14px', fontWeight: 500, color: token.gray600 }}>Back to Patients</span>
      </button>

      {/* ── Header row ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-[16px] font-[600] flex-shrink-0">
            {patient.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-[22px] font-[700]" style={{ color: token.text }}>{patient.name}</h1>
            <p className="text-[14px] font-[400]" style={{ color: token.gray600 }}>Patient Details & Progress Monitoring</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMessageModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-[500] transition-colors"
            style={{ backgroundColor: token.purple100, color: token.purple700 }}
          >
            <Send size={14} />
            Message
          </button>

          <select
            value={patient.riskLevel}
            onChange={(e) => { if (patientId) updatePatient(patientId, { riskLevel: e.target.value as 'low' | 'medium' | 'high' }); }}
            className="text-[12px] font-[500] px-3 py-1.5 rounded-full cursor-pointer outline-none"
            style={{ backgroundColor: risk.bg, color: risk.color, border: `0.5px solid ${risk.border}`, minWidth: '90px' }}
          >
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>
        </div>
      </div>

      {/* ── Patient Info Grid ── */}
      <div style={cardStyle}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: token.gray100 }}>
            <User size={16} strokeWidth={1.5} color={token.gray600} />
          </div>
          <h2 className="text-[16px] font-[600]" style={{ color: token.text }}>Patient Information</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {infoFields.map((f) => (
            <div key={f.label}>
              <p className="text-[11px] font-[500] mb-0.5" style={{ color: token.gray400, letterSpacing: '0.03em' }}>{f.label}</p>
              <p className="text-[14px] font-[500]" style={{ color: token.text }}>{f.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sleep Prescription ── */}
      <div style={cardStyle}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: token.gray100 }}>
            <Moon size={16} strokeWidth={1.5} color={token.gray600} />
          </div>
          <div>
            <h2 className="text-[16px] font-[600]" style={{ color: token.text }}>Sleep Prescription</h2>
            <p className="text-[12px]" style={{ color: token.gray400 }}>Target nightly sleep hours shown to the patient on their dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="number"
              min={0.5}
              max={12}
              step={0.5}
              placeholder="e.g. 7.5"
              value={prescriptionInput}
              onChange={(e) => setPrescriptionInput(e.target.value)}
              className="w-28 rounded-lg border border-[#E9D5FF] px-3 py-2 text-[14px] font-[500] outline-none focus:border-[#6D28D9] transition-colors"
              style={{ color: token.text }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px]" style={{ color: token.gray400 }}>hrs</span>
          </div>
          <button
            onClick={handleSavePrescription}
            disabled={prescriptionSaving}
            className="px-4 py-2 rounded-lg text-[13px] font-[500] transition-colors disabled:opacity-60"
            style={{ backgroundColor: token.purple700, color: token.white }}
          >
            {prescriptionSaving ? 'Saving…' : 'Save'}
          </button>
          {patient.prescribedSleepHours != null && (
            <span className="text-[13px]" style={{ color: token.gray600 }}>
              Current: <strong style={{ color: token.purple700 }}>{patient.prescribedSleepHours} hrs</strong>
            </span>
          )}
        </div>
      </div>

      {/* ── Attention Alert ── */}
      {daysSinceLastActive > 3 && (
        <div style={{ ...cardStyle, backgroundColor: '#FFFBEB', border: '0.5px solid #FDE68A' }}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEF3C7' }}>
              <AlertTriangle size={16} strokeWidth={1.5} color="#B45309" />
            </div>
            <div>
              <p className="text-[14px] font-[600] mb-0.5" style={{ color: '#92400E' }}>Patient Requires Follow-up</p>
              <p className="text-[13px]" style={{ color: '#B45309' }}>
                {patient.name} hasn't been active for {daysSinceLastActive} days. Consider reaching out to assess engagement.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} style={cardStyle} className="flex flex-col justify-between min-h-[110px]">
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-3" style={{ backgroundColor: token.gray100 }}>
                <Icon size={17} strokeWidth={1.5} color={token.gray600} />
              </div>
              <div>
                <p className="text-[13px] mb-0.5" style={{ color: token.gray600 }}>{card.label}</p>
                <p className="text-[22px] font-[500] leading-none mb-1" style={{ color: token.text }}>
                  {card.value}
                </p>
                <p className="text-[11px]" style={{ color: token.gray400 }}>{card.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Patient Sleep Analytics ── */}
      <div style={cardStyle}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: token.gray100 }}>
            <Moon size={16} strokeWidth={1.5} color={token.gray600} />
          </div>
          <h2 className="text-[16px] font-[600]" style={{ color: token.text }}>Sleep Analytics</h2>
        </div>
        <p className="text-[11px] mb-4" style={{ color: token.gray400, paddingLeft: '40px' }}>
          {"Patient's logged sleep data."}
        </p>

        {sleepLogs.length === 0 ? (
          <div className="flex flex-col items-center py-8">
            <Moon size={20} strokeWidth={1.5} color={token.gray400} />
            <p className="text-[12px] mt-2 text-center" style={{ color: token.gray400 }}>
              No sleep data available for this patient.
            </p>
          </div>
        ) : (
          <>
            {/* Metric cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              <div className="p-3 rounded-[10px]" style={{ backgroundColor: token.gray50, border: `0.5px solid ${token.purple100}` }}>
                <p className="text-[11px] font-[500] mb-1" style={{ color: token.gray400 }}>Avg Sleep</p>
                <p className="text-[20px] font-[500]" style={{ color: token.text }}>{sleepAvg}h</p>
                <p className="text-[11px]" style={{ color: token.gray400 }}>Target: 7–9h</p>
              </div>
              <div className="p-3 rounded-[10px]" style={{ backgroundColor: token.gray50, border: `0.5px solid ${token.purple100}` }}>
                <p className="text-[11px] font-[500] mb-1" style={{ color: token.gray400 }}>Avg Quality</p>
                <div className="flex items-center gap-0.5 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={13} className={s <= Math.round(Number(qualityAvg) / 2) ? 'text-gray-600 fill-gray-600' : 'text-gray-300'} />
                  ))}
                </div>
                <p className="text-[11px]" style={{ color: token.gray400 }}>{qualityAvg} / 10</p>
              </div>
              <div className="p-3 rounded-[10px]" style={{ backgroundColor: token.gray50, border: `0.5px solid ${token.purple100}` }}>
                <p className="text-[11px] font-[500] mb-1" style={{ color: token.gray400 }}>Consistency</p>
                <p className="text-[20px] font-[500]" style={{ color: token.text }}>{sleepConsistency ?? '—'}</p>
                <p className="text-[11px]" style={{ color: token.gray400 }}>out of 100</p>
              </div>
              <div className="p-3 rounded-[10px]" style={{ backgroundColor: token.gray50, border: `0.5px solid ${token.purple100}` }}>
                <p className="text-[11px] font-[500] mb-1" style={{ color: token.gray400 }}>Weekly Trend</p>
                <div className="flex items-center gap-1 my-0.5">
                  {sleepTrend === 'improving' ? <TrendingUp size={16} color="#059669" /> : sleepTrend === 'declining' ? <TrendingDown size={16} color="#DC2626" /> : <Minus size={16} color={token.gray400} />}
                </div>
                <p className="text-[11px] capitalize" style={{ color: sleepTrend === 'improving' ? '#059669' : sleepTrend === 'declining' ? '#DC2626' : token.gray400 }}>
                  {sleepTrend}
                </p>
              </div>
            </div>

            {/* Sleep duration line chart */}
            <p className="text-[13px] font-[600] mb-3" style={{ color: token.text }}>Sleep Duration — Last 14 Days</p>
            <div style={{ height: 200 }} className="mb-5">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sleepChartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="shortDate" tick={{ fill: '#6b7280', fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} domain={[4, 10]} ticks={[4, 5, 6, 7, 8, 9, 10]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: 10, fontSize: 12 }}
                    labelStyle={{ color: token.text, fontWeight: 500 }}
                    formatter={(v: number) => [`${v}h`, 'Sleep']}
                  />
                  <ReferenceLine y={7} stroke="#14b8a6" strokeDasharray="4 3" label={{ value: '7h target', fill: '#14b8a6', fontSize: 10, position: 'insideTopRight' }} />
                  <Line type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 3 }} activeDot={{ r: 5 }} name="Sleep Hours" isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pattern analysis */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-[10px]" style={{ backgroundColor: token.gray50, border: `0.5px solid ${token.purple100}` }}>
                <p className="text-[11px]" style={{ color: token.gray400 }}>Weekday Avg</p>
                <p className="text-[18px] font-[500] mt-0.5" style={{ color: token.text }}>{weekdayAvgSleep ? `${weekdayAvgSleep}h` : '—'}</p>
                <p className="text-[11px]" style={{ color: token.gray400 }}>Mon–Fri</p>
              </div>
              <div className="p-3 rounded-[10px]" style={{ backgroundColor: token.gray50, border: `0.5px solid ${token.purple100}` }}>
                <p className="text-[11px]" style={{ color: token.gray400 }}>Weekend Avg</p>
                <p className="text-[18px] font-[500] mt-0.5" style={{ color: token.text }}>{weekendAvgSleep ? `${weekendAvgSleep}h` : '—'}</p>
                <p className="text-[11px]" style={{ color: token.gray400 }}>Sat–Sun</p>
              </div>
              <div className="p-3 rounded-[10px]" style={{ backgroundColor: token.gray50, border: `0.5px solid ${token.purple100}` }}>
                <p className="text-[11px]" style={{ color: token.gray400 }}>Total Logs</p>
                <p className="text-[18px] font-[500] mt-0.5" style={{ color: token.text }}>{sleepLogs.length}</p>
                <p className="text-[11px]" style={{ color: token.gray400 }}>Past 30 days</p>
              </div>
            </div>

            {/* 4-week summary */}
            <p className="text-[13px] font-[600] mb-2" style={{ color: token.text }}>4-Week Summary</p>
            <div className="space-y-2">
              {sleepWeeklyBreakdown.map((week, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-[10px]" style={{ backgroundColor: token.gray50, border: `0.5px solid ${token.purple100}` }}>
                  <div className="flex items-center gap-2">
                    <Calendar size={13} strokeWidth={1.5} color={token.gray400} />
                    <p className="text-[12px]" style={{ color: token.text }}>{week.label}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[11px]" style={{ color: token.gray400 }}>{week.logs} log{week.logs !== 1 ? 's' : ''}</span>
                    <span className="text-[12px] font-[500]" style={{ color: week.avgHours >= 7 ? '#059669' : week.avgHours > 0 ? '#B45309' : token.gray400 }}>
                      {week.avgHours > 0 ? `${week.avgHours}h avg` : '—'}
                    </span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={10} className={s <= Math.round(week.avgQuality / 2) ? 'text-gray-500 fill-gray-500' : 'text-gray-200'} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Two-column: Clinical Notes + Recommendations ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Clinical Notes */}
        <div style={cardStyle}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: token.gray100 }}>
              <FileText size={16} strokeWidth={1.5} color={token.gray600} />
            </div>
            <h2 className="text-[16px] font-[600]" style={{ color: token.text }}>Clinical Notes</h2>
          </div>

          {/* Add Note Form */}
          <div className="mb-4 p-3 rounded-[10px]" style={{ backgroundColor: token.gray50, border: `0.5px solid ${token.purple100}` }}>
            <label className="block text-[12px] font-[500] mb-1.5" style={{ color: token.gray600 }}>Note Type</label>
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value as typeof noteType)}
              className="w-full h-9 px-3 rounded-lg text-[13px] mb-2 outline-none"
              style={{ border: `0.5px solid ${token.purple200}`, backgroundColor: token.white, color: token.text }}
            >
              <option value="general">General Note</option>
              <option value="concern">Concern</option>
              <option value="progress">Progress Update</option>
              <option value="follow-up">Follow-up Required</option>
            </select>

            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a clinical note…"
              className="w-full min-h-[80px] px-3 py-2 rounded-lg text-[13px] mb-2 outline-none resize-none"
              style={{ border: `0.5px solid ${token.purple200}`, backgroundColor: token.white, color: token.text }}
            />

            <button
              onClick={handleAddNote}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-[500] transition-colors"
              style={{ backgroundColor: token.purple700, color: token.white }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#5B21B6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = token.purple700)}
            >
              <Send size={14} strokeWidth={1.5} />
              Add Note
            </button>
          </div>

          {/* Notes List */}
          <div className="space-y-2 max-h-[320px] overflow-y-auto">
            {regularNotes.length > 0 ? (
              regularNotes.map((note) => {
                const ntc = noteTypeConfig[note.type] || noteTypeConfig.general;
                return (
                  <div key={note.id} className="p-3 rounded-[10px]" style={{ backgroundColor: token.gray50, border: `0.5px solid ${token.purple100}` }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-[500] px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: ntc.bg, color: ntc.color }}>{note.type}</span>
                      <span className="text-[11px]" style={{ color: token.gray400 }}>{new Date(note.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[13px]" style={{ color: token.text }}>{note.note}</p>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center py-8">
                <Inbox size={20} strokeWidth={1.5} color={token.gray400} />
                <p className="text-[12px] mt-2" style={{ color: token.gray400 }}>No clinical notes yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Clinical Recommendations */}
        <div style={cardStyle}>
          <div className="flex items-center justify-between mb-4 w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: token.gray100 }}>
                <AlertTriangle size={16} strokeWidth={1.5} color={token.gray600} />
              </div>
              <h2 className="text-[16px] font-[600]" style={{ color: token.text }}>Clinical Recommendations</h2>
            </div>
            <button
              onClick={() => setIsRecModalOpen(true)}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              style={{ color: token.purple700 }}
            >
              <Plus size={16} strokeWidth={2} />
            </button>
          </div>

          <div className="space-y-2">
            {recommendations.length > 0 ? (
              <div className="space-y-2">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="p-3 rounded-[10px] relative" style={{ backgroundColor: '#F9F7FF', border: `0.5px solid ${token.purple200}` }}>
                    <p className="text-[13px]" style={{ color: token.text, paddingRight: '20px' }}>{rec.note}</p>
                    <div className="absolute top-3 right-3" title={rec.read ? 'Read by patient' : 'Unread'}>
                      {rec.read ? <CheckCheck size={14} strokeWidth={1.5} color={token.gray600} /> : <Check size={14} strokeWidth={1.5} color={token.gray400} />}
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: token.gray400 }}>{new Date(rec.timestamp).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {daysSinceLastActive > 3 && (
              <div className="p-3 rounded-[10px]" style={{ backgroundColor: '#FFFBEB', border: '0.5px solid #FDE68A' }}>
                <p className="text-[12px]" style={{ color: '#92400E' }}>
                  <strong>Action Required:</strong> Patient has not been active for {daysSinceLastActive} days. Schedule a follow-up call.
                </p>
              </div>
            )}

            {recommendations.length === 0 && daysSinceLastActive <= 3 && (
              <div className="flex flex-col items-center py-8">
                <ShieldCheck size={20} strokeWidth={1.5} color={token.gray400} />
                <p className="text-[12px] mt-2 text-center" style={{ color: token.gray400 }}>
                  No recommendations yet. Use the + button to add one.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Send Message Modal */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-md shadow-xl border border-gray-100">
            <h3 className="text-lg font-semibold mb-3" style={{ color: token.text }}>Send Message to {patient.name}</h3>
            <textarea
              className="w-full h-32 p-3 border rounded-lg resize-none mb-4 outline-none focus:ring-2"
              style={{ borderColor: token.purple200 }}
              placeholder="Type your message here..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsMessageModalOpen(false)} className="px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg" style={{ color: token.gray600 }}>Cancel</button>
              <button
                onClick={async () => {
                  if (!messageText.trim()) return;
                  try {
                    await sendMessage(patient.id, messageText.trim());
                    toast.success('Message sent');
                    setIsMessageModalOpen(false);
                    setMessageText('');
                  } catch {
                    toast.error('Failed to send message');
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                style={{ backgroundColor: token.purple700 }}
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Recommendation Modal */}
      {isRecModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-md shadow-xl border border-gray-100">
            <h3 className="text-lg font-semibold mb-3" style={{ color: token.text }}>Add Clinical Recommendation</h3>
            <textarea
              className="w-full h-32 p-3 border rounded-lg resize-none mb-4 outline-none focus:ring-2"
              style={{ borderColor: token.purple200 }}
              placeholder="Enter your recommendation. It will be sent to the patient as a notification."
              value={recText}
              onChange={(e) => setRecText(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsRecModalOpen(false)} className="px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg" style={{ color: token.gray600 }}>Cancel</button>
              <button
                onClick={async () => {
                  if (!recText.trim() || !patientId) return;
                  const saved = await addNote({ patientId, clinicianId: user?.id ?? '', note: recText.trim(), type: 'recommendation' });
                  if (!saved) { toast.error('Failed to save recommendation'); return; }
                  try {
                    await sendMessage(patient.id, 'Clinical Recommendation: ' + recText.trim());
                  } catch {
                    // non-critical
                  }
                  toast.success('Recommendation sent to patient');
                  setIsRecModalOpen(false);
                  setRecText('');
                }}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                style={{ backgroundColor: token.purple700 }}
              >
                Send Recommendation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
