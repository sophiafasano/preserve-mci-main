import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  AlertTriangle,
  MessageCircle,
  X,
  Send,
  Loader2,
  Star,
  Moon,
  TrendingUp,
  Activity,
  Calendar,
  FileText,
  Heart,
  Trash2,
  Inbox,
  Flame,
  BarChart2,
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
import { supabase } from '../../utils/supabaseClient';
import { useCaregiverPatients } from '../../hooks/useCaregiverPatients';
import { useCaregiverNotes } from '../../hooks/useCaregiverNotes';
import { useMessaging } from '../../hooks/useMessaging';
import { calculateSleepAnalytics, type SleepLog } from '../../utils/sleepAnalytics';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';

interface Props {
  patientId: string;
}

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

const noteTypeConfig: Record<string, { bg: string; color: string; label: string }> = {
  general:      { bg: token.gray100,  color: token.gray600,  label: 'General'      },
  encouragement:{ bg: '#F0FDF4',       color: '#166534',       label: 'Encouragement' },
  concern:      { bg: '#FEF2F2',       color: '#B91C1C',       label: 'Concern'      },
  'check-in':   { bg: '#FFFBEB',       color: '#B45309',       label: 'Check-in'     },
};

const NOTE_TYPES = ['general', 'encouragement', 'concern', 'check-in'] as const;

const renderStars = (quality: number) => {
  const stars = Math.round(quality / 2);
  return [1, 2, 3, 4, 5].map((s) => (
    <Star
      key={s}
      size={14}
      fill={s <= stars ? '#F59E0B' : 'none'}
      color={s <= stars ? '#F59E0B' : '#D1D5DB'}
    />
  ));
};

export default function CaregiverPatientDetail({ patientId }: Props) {
  const navigate = useNavigate();
  const { getPatientById, loading: patientsLoading } = useCaregiverPatients();
  const { sendMessage } = useMessaging();
  const { notes, loading: notesLoading, fetchNotes, addNote, deleteNote } = useCaregiverNotes(patientId);

  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [msgOpen, setMsgOpen] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);

  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState<typeof NOTE_TYPES[number]>('general');
  const [savingNote, setSavingNote] = useState(false);

  const patient = getPatientById(patientId);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoadingLogs(true);
      try {
        const { data } = await supabase
          .from('sleep_logs')
          .select('date, hours_slept, sleep_quality, notes')
          .eq('user_id', patientId)
          .order('date', { ascending: true });

        setSleepLogs(
          (data ?? []).map((l) => ({
            date: l.date,
            hoursSlept: l.hours_slept,
            sleepQuality: l.sleep_quality,
            notes: l.notes,
          }))
        );
      } catch (err) {
        console.error('Failed to fetch sleep logs:', err);
      } finally {
        setLoadingLogs(false);
      }
    };
    fetchLogs();
    fetchNotes();
  }, [patientId, fetchNotes]);

  const handleSendMessage = async () => {
    if (!msgText.trim()) return;
    setSending(true);
    try {
      await sendMessage(patientId, msgText.trim());
      toast.success('Message sent!');
      setMsgText('');
      setMsgOpen(false);
    } catch {
      toast.error('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      await addNote(noteText.trim(), noteType);
      toast.success('Observation saved.');
      setNoteText('');
    } catch {
      toast.error('Failed to save observation.');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      toast.success('Observation removed.');
    } catch {
      toast.error('Failed to remove observation.');
    }
  };

  if (patientsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-[14px] text-[#6B7280]">Patient not found.</p>
        <button
          onClick={() => navigate('/caregiver/patients')}
          className="mt-3 text-[13px] text-[#7200CA] hover:underline"
        >
          Back to patients
        </button>
      </div>
    );
  }

  const analytics = calculateSleepAnalytics(sleepLogs);
  const chartData = sleepLogs.slice(-14).map((l) => ({
    date: format(new Date(l.date + 'T12:00:00'), 'MMM d'),
    hours: l.hoursSlept,
    quality: l.sleepQuality,
  }));

  const daysSinceActive = patient.lastActive
    ? Math.floor((Date.now() - new Date(patient.lastActive).getTime()) / 86400000)
    : 999;
  const needsAttention = daysSinceActive > 3;

  const trendLabel =
    analytics.patterns.trend === 'improving' ? 'Improving'
    : analytics.patterns.trend === 'declining' ? 'Declining'
    : 'Stable';

  const trendColor =
    analytics.patterns.trend === 'improving' ? '#10B981'
    : analytics.patterns.trend === 'declining' ? '#EF4444'
    : '#6B7280';

  const daysConnected = Math.floor(
    (Date.now() - new Date(patient.dateConnected).getTime()) / 86400000
  );

  const logsPerWeek =
    daysConnected > 0
      ? ((patient.sleepLogsCount / daysConnected) * 7).toFixed(1)
      : '0';

  return (
    <div className="space-y-6">
      {/* Back breadcrumb */}
      <button
        onClick={() => navigate('/caregiver/patients')}
        className="inline-flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white transition-colors"
      >
        <ArrowLeft size={18} color="#7200CA" />
        <span style={{ fontSize: '14px', fontWeight: 500, color: token.gray600 }}>My Patients</span>
      </button>

      {/* Header */}
      <div style={cardStyle} className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xl font-semibold flex-shrink-0">
            {patient.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-[22px] font-[700] text-[#1A1A2E] mb-0.5">{patient.name}</h1>
            <p className="text-[13px] text-[#9CA3AF] capitalize">{patient.relationshipType}</p>
            <p className="text-[12px] text-[#9CA3AF]">
              Connected{' '}
              {formatDistanceToNow(new Date(patient.dateConnected), { addSuffix: true })}
            </p>
          </div>
        </div>
        <button
          onClick={() => setMsgOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-[14px] font-[500] transition-all hover:brightness-95 shrink-0"
          style={{ backgroundColor: token.purple700 }}
        >
          <MessageCircle size={16} strokeWidth={1.5} />
          Message
        </button>
      </div>

      {/* Patient info grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Email',      value: patient.email },
          { label: 'Age',        value: patient.age ? `${patient.age} years` : '—' },
          {
            label: 'Last Active',
            value: patient.lastActive
              ? formatDistanceToNow(new Date(patient.lastActive), { addSuffix: true })
              : 'Never',
          },
          { label: 'Sleep Logs', value: `${patient.sleepLogsCount} entries` },
        ].map((item) => (
          <div key={item.label} style={cardStyle} className="!p-4">
            <p className="text-[11px] text-[#9CA3AF] mb-1 uppercase tracking-wide">{item.label}</p>
            <p className="text-[13px] font-[500] text-[#1A1A2E] break-all">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Attention alert */}
      {needsAttention && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-[12px] bg-amber-50 border border-amber-200">
          <AlertTriangle size={18} color="#D97706" className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[14px] font-[500] text-amber-800">Patient needs attention</p>
            <p className="text-[13px] text-amber-700">
              {patient.name} hasn't been active for {daysSinceActive} days. Consider sending them an encouraging message.
            </p>
          </div>
        </div>
      )}

      {/* Sleep Analytics */}
      {loadingLogs ? (
        <div style={cardStyle} className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : sleepLogs.length === 0 ? (
        <div style={cardStyle} className="flex flex-col items-center justify-center py-12 text-center">
          <Moon size={32} color="#9CA3AF" className="mb-3" />
          <p className="text-[14px] text-[#6B7280]">No sleep logs yet</p>
          <p className="text-[12px] text-[#9CA3AF] mt-1">
            {patient.name} hasn't logged any sleep data.
          </p>
        </div>
      ) : (
        <>
          {/* Metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div style={cardStyle} className="!p-4">
              <div className="flex items-center gap-2 mb-2">
                <Moon size={16} strokeWidth={1.5} color={token.gray600} />
                <p className="text-[12px] text-[#6B7280]">Avg Sleep</p>
              </div>
              <p className="text-[24px] font-[500] text-[#1A1A2E]">
                {analytics.averageHours}<span className="text-[14px] text-[#9CA3AF]">h</span>
              </p>
            </div>
            <div style={cardStyle} className="!p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star size={16} strokeWidth={1.5} color={token.gray600} />
                <p className="text-[12px] text-[#6B7280]">Avg Quality</p>
              </div>
              <div className="flex items-center gap-1 mt-1">{renderStars(analytics.averageQuality)}</div>
              <p className="text-[12px] text-[#9CA3AF] mt-1">{analytics.averageQuality}/10</p>
            </div>
            <div style={cardStyle} className="!p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={16} strokeWidth={1.5} color={token.gray600} />
                <p className="text-[12px] text-[#6B7280]">Consistency</p>
              </div>
              <p className="text-[24px] font-[500] text-[#1A1A2E]">
                {analytics.patterns.consistencyScore}<span className="text-[14px] text-[#9CA3AF]">%</span>
              </p>
            </div>
            <div style={cardStyle} className="!p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} strokeWidth={1.5} color={token.gray600} />
                <p className="text-[12px] text-[#6B7280]">Trend</p>
              </div>
              <p className="text-[18px] font-[500]" style={{ color: trendColor }}>
                {trendLabel}
              </p>
            </div>
          </div>

          {/* Sleep Chart */}
          <div style={cardStyle}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: token.gray100 }}>
                <BarChart2 size={16} strokeWidth={1.5} color={token.gray600} />
              </div>
              <h2 className="text-[16px] font-[500] text-[#1A1A2E]">Sleep Duration — Last 14 Days</h2>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3E9FB" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 12]}
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFF',
                      border: '0.5px solid #F3E9FB',
                      borderRadius: '10px',
                      fontSize: '12px',
                    }}
                    formatter={(v: number) => [`${v}h`, 'Sleep']}
                  />
                  <ReferenceLine
                    y={7}
                    stroke="#0D9488"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{ value: '7h target', position: 'right', fontSize: 10, fill: '#0D9488' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke={token.purple700}
                    strokeWidth={2}
                    dot={{ r: 3, fill: token.purple700, strokeWidth: 0 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-[13px] text-[#9CA3AF] py-6 text-center">
                Not enough data to display chart.
              </p>
            )}
          </div>

          {/* Pattern Analysis + 4-Week Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div style={cardStyle}>
              <h2 className="text-[16px] font-[500] text-[#1A1A2E] mb-4">Pattern Analysis</h2>
              <div className="space-y-3">
                {[
                  { label: 'Weekday Average',  value: `${analytics.patterns.weekdayAverage}h` },
                  { label: 'Weekend Average',  value: `${analytics.patterns.weekendAverage}h` },
                  { label: 'Total Logs',        value: analytics.totalLogs },
                  { label: 'Current Streak',    value: `${analytics.currentStreak} days` },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-2 border-b border-[#F3E9FB] last:border-0"
                  >
                    <p className="text-[13px] text-[#6B7280]">{item.label}</p>
                    <p className="text-[13px] font-[500] text-[#1A1A2E]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={cardStyle}>
              <h2 className="text-[16px] font-[500] text-[#1A1A2E] mb-4">4-Week Summary</h2>
              <div className="space-y-2">
                {analytics.weeklyComparison.map((week) => (
                  <div key={week.week} className="flex items-center justify-between py-2 border-b border-[#F3E9FB] last:border-0">
                    <div className="flex items-center gap-2">
                      <Calendar size={13} strokeWidth={1.5} color="#9CA3AF" />
                      <p className="text-[13px] text-[#6B7280]">{week.week}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-[12px] text-[#9CA3AF]">{week.logsCount} logs</p>
                      <p
                        className="text-[13px] font-[500]"
                        style={{ color: week.avgHours >= 7 ? '#059669' : week.avgHours > 0 ? '#B45309' : token.gray400 }}
                      >
                        {week.avgHours > 0 ? `${week.avgHours}h` : '—'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Engagement + Observations row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Engagement Summary */}
        <div style={cardStyle}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: token.gray100 }}>
              <Flame size={16} strokeWidth={1.5} color={token.gray600} />
            </div>
            <h2 className="text-[16px] font-[500] text-[#1A1A2E]">Engagement Summary</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Days Connected',      value: `${daysConnected}d` },
              { label: 'Total Sleep Logs',    value: patient.sleepLogsCount },
              { label: 'Logs per Week',        value: logsPerWeek },
              { label: 'Current Log Streak',   value: `${analytics.currentStreak} days` },
              {
                label: 'Last Sleep Log',
                value: patient.lastSleepLog
                  ? format(new Date(patient.lastSleepLog.date + 'T12:00:00'), 'MMM d, yyyy')
                  : 'None yet',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-2 border-b border-[#F3E9FB] last:border-0"
              >
                <p className="text-[13px] text-[#6B7280]">{item.label}</p>
                <p className="text-[13px] font-[500] text-[#1A1A2E]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Caregiver Observations */}
        <div style={cardStyle}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: token.gray100 }}>
              <Heart size={16} strokeWidth={1.5} color={token.gray600} />
            </div>
            <h2 className="text-[16px] font-[500] text-[#1A1A2E]">Observations & Check-ins</h2>
          </div>

          {/* Add observation form */}
          <div
            className="mb-4 p-3 rounded-[10px]"
            style={{ backgroundColor: token.gray50, border: `0.5px solid ${token.purple100}` }}
          >
            <label className="block text-[12px] font-[500] mb-1.5" style={{ color: token.gray600 }}>
              Note Type
            </label>
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value as typeof noteType)}
              className="w-full h-9 px-3 rounded-lg text-[13px] mb-2 outline-none"
              style={{ border: `0.5px solid ${token.purple200}`, backgroundColor: token.white, color: token.text }}
            >
              <option value="general">General Observation</option>
              <option value="encouragement">Encouragement</option>
              <option value="concern">Concern</option>
              <option value="check-in">Check-in</option>
            </select>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add an observation or check-in note…"
              className="w-full min-h-[72px] px-3 py-2 rounded-lg text-[13px] mb-2 outline-none resize-none"
              style={{ border: `0.5px solid ${token.purple200}`, backgroundColor: token.white, color: token.text }}
            />
            <button
              onClick={handleAddNote}
              disabled={!noteText.trim() || savingNote}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-[500] transition-colors disabled:opacity-60"
              style={{ backgroundColor: token.purple700, color: token.white }}
            >
              {savingNote ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <FileText size={14} strokeWidth={1.5} />
                  Save Observation
                </>
              )}
            </button>
          </div>

          {/* Notes list */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {notesLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 size={20} className="animate-spin text-purple-400" />
              </div>
            ) : notes.length > 0 ? (
              notes.map((n) => {
                const cfg = noteTypeConfig[n.type] ?? noteTypeConfig.general;
                return (
                  <div
                    key={n.id}
                    className="p-3 rounded-[10px] group relative"
                    style={{ backgroundColor: token.gray50, border: `0.5px solid ${token.purple100}` }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="text-[11px] font-[500] px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: cfg.bg, color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px]" style={{ color: token.gray400 }}>
                          {new Date(n.timestamp).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleDeleteNote(n.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-50"
                          title="Remove observation"
                        >
                          <Trash2 size={12} strokeWidth={1.5} color="#EF4444" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[13px]" style={{ color: token.text }}>{n.note}</p>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center py-8">
                <Inbox size={20} strokeWidth={1.5} color={token.gray400} />
                <p className="text-[12px] mt-2" style={{ color: token.gray400 }}>
                  No observations yet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {msgOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-md rounded-[16px] p-6 shadow-xl"
            style={{ backgroundColor: token.white, border: `0.5px solid ${token.purple100}` }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-[600] text-[#1A1A2E]">Message {patient.name}</h2>
              <button onClick={() => setMsgOpen(false)} className="p-1.5 rounded-lg hover:bg-[#F3E8FF] transition-colors">
                <X size={18} strokeWidth={1.5} color="#6B7280" />
              </button>
            </div>
            <textarea
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              placeholder="Write a message of support, encouragement, or a reminder…"
              rows={5}
              className="w-full px-4 py-3 rounded-[10px] border border-[#F3E9FB] text-[14px] text-[#1A1A2E] placeholder-[#9CA3AF] outline-none focus:border-[#6D28D9] resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setMsgOpen(false)}
                className="flex-1 py-2.5 rounded-lg text-[14px] font-[500] text-[#6B7280] hover:bg-[#F3E8FF] transition-colors border border-[#F3E9FB]"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!msgText.trim() || sending}
                className="flex-1 py-2.5 rounded-lg text-[14px] font-[500] text-white transition-all hover:brightness-95 disabled:opacity-60 inline-flex items-center justify-center gap-2"
                style={{ backgroundColor: token.purple700 }}
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <><Send size={16} strokeWidth={1.5} />Send</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
