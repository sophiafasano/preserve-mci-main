import { useNavigate } from 'react-router';
import {
  BarChart2,
  AlertTriangle,
  Users,
  Activity,
  Moon,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  PlayCircle,
  Gauge,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { useCaregiverPatients } from '../../hooks/useCaregiverPatients';
import { formatDistanceToNow } from 'date-fns';

const token = {
  white: '#FFFFFF',
  purple100: '#F3E9FB',
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

const renderStars = (quality?: number) => {
  if (quality == null) return <span className="text-[#9CA3AF] text-[12px]">—</span>;
  const stars = Math.round(quality / 2);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={11}
          fill={s <= stars ? '#F59E0B' : 'none'}
          color={s <= stars ? '#F59E0B' : '#D1D5DB'}
        />
      ))}
    </div>
  );
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function SleepBarTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div
      className="px-3 py-2 rounded-[10px] shadow-sm text-[12px]"
      style={{ backgroundColor: token.white, border: `0.5px solid ${token.purple100}` }}
    >
      <p className="font-[500] text-[#1A1A2E] mb-0.5">{label}</p>
      <p style={{ color: val >= 7 ? '#059669' : val >= 6 ? '#B45309' : '#EF4444' }}>
        {val}h avg
      </p>
      <p className="text-[#9CA3AF] text-[11px]">{val >= 7 ? 'On target' : 'Below target'}</p>
    </div>
  );
}

export default function CaregiverSleepData() {
  const navigate = useNavigate();
  const { patients, stats } = useCaregiverPatients();

  const activeRate =
    stats.totalPatients > 0
      ? Math.round((stats.activePatients / stats.totalPatients) * 100)
      : 0;

  const avgSleepAll =
    patients.filter((p) => p.avgSleepHours != null).length > 0
      ? (
          patients
            .filter((p) => p.avgSleepHours != null)
            .reduce((s, p) => s + p.avgSleepHours!, 0) /
          patients.filter((p) => p.avgSleepHours != null).length
        ).toFixed(1)
      : null;

  const totalVideosAcrossPatients = patients.reduce(
    (sum, p) => sum + p.moduleVideosTotal,
    0,
  );
  const watchedVideosAcrossPatients = patients.reduce(
    (sum, p) => sum + p.moduleVideosWatched,
    0,
  );
  const videosLeftAcrossPatients = Math.max(0, totalVideosAcrossPatients - watchedVideosAcrossPatients);
  const moduleCompletionAcrossPatients =
    totalVideosAcrossPatients > 0
      ? Math.round((watchedVideosAcrossPatients / totalVideosAcrossPatients) * 100)
      : 0;
  const patientsWithProgress = patients.filter((p) => p.moduleVideosWatched > 0).length;
  const patientsCompletedProgram = patients.filter(
    (p) => p.moduleVideosTotal > 0 && p.moduleVideosLeft === 0,
  ).length;

  const chartData = patients
    .filter((p) => p.avgSleepHours != null)
    .map((p) => ({
      name: p.name.split(' ')[0],
      fullName: p.name,
      patientId: p.patientId,
      avgHours: parseFloat(p.avgSleepHours!.toFixed(1)),
      avgQuality: p.avgSleepQuality,
    }))
    .sort((a, b) => b.avgHours - a.avgHours);

  const sortedPatients = [...patients].sort((a, b) => {
    const aTime = a.lastActive ? new Date(a.lastActive).getTime() : 0;
    const bTime = b.lastActive ? new Date(b.lastActive).getTime() : 0;
    return bTime - aTime;
  });

  const summaryCards = [
    {
      label: 'Active Rate',
      value: `${activeRate}%`,
      sub: 'Active past 7 days',
      icon: Activity,
    },
    {
      label: 'Total Patients',
      value: stats.totalPatients,
      sub: 'Connected',
      icon: Users,
    },
    {
      label: 'Need Attention',
      value: stats.patientsNeedingAttention,
      sub: 'Inactive > 3 days',
      icon: AlertTriangle,
    },
    {
      label: 'Avg Sleep',
      value: avgSleepAll ? `${avgSleepAll}h` : '—',
      sub: 'Across all patients',
      icon: Moon,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-[700] text-[#1A1A2E] mb-1">Sleep Data</h1>
        <p className="text-[14px] text-[#6B7280] font-[400]">
          Overview of your patients' sleep activity and trends.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} style={cardStyle} className="flex flex-col justify-between min-h-[120px]">
              <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-3"
                style={{ backgroundColor: token.gray100 }}
              >
                <Icon size={18} strokeWidth={1.5} color={token.gray600} />
              </div>
              <div>
                <p className="text-[13px] mb-0.5" style={{ color: token.gray600 }}>{card.label}</p>
                <p className="text-[24px] font-[500] leading-none mb-1" style={{ color: token.text }}>{card.value}</p>
                <p className="text-[11px]" style={{ color: token.gray400 }}>{card.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Care Program Progress Tracker */}
      <div style={cardStyle}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: token.gray100 }}>
            <PlayCircle size={16} strokeWidth={1.5} color={token.gray600} />
          </div>
          <div>
            <h2 className="text-[16px] font-[500] text-[#1A1A2E]">Intervention Progress Tracker</h2>
          </div>
        </div>
        <p className="text-[12px] text-[#9CA3AF] mb-4 pl-10">
          Videos completed vs left across your connected patients.
        </p>

        {patients.length === 0 ? (
          <div className="flex items-start gap-3 p-4 rounded-[10px]" style={{ backgroundColor: token.gray50, border: `0.5px solid ${token.purple100}` }}>
            <Users size={16} strokeWidth={1.5} color={token.gray400} className="flex-shrink-0 mt-0.5" />
            <p className="text-[13px]" style={{ color: token.gray600 }}>
              Add at least one patient to start tracking care-program video completion.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <div className="p-3 rounded-[10px]" style={{ backgroundColor: token.gray50, border: `0.5px solid ${token.purple100}` }}>
                <p className="text-[11px] text-[#9CA3AF] mb-1">Completed Videos</p>
                <p className="text-[20px] font-[600] text-[#1A1A2E]">{watchedVideosAcrossPatients}</p>
              </div>
              <div className="p-3 rounded-[10px]" style={{ backgroundColor: token.gray50, border: `0.5px solid ${token.purple100}` }}>
                <p className="text-[11px] text-[#9CA3AF] mb-1">Videos Left</p>
                <p className="text-[20px] font-[600] text-[#1A1A2E]">{videosLeftAcrossPatients}</p>
              </div>
              <div className="p-3 rounded-[10px]" style={{ backgroundColor: token.gray50, border: `0.5px solid ${token.purple100}` }}>
                <p className="text-[11px] text-[#9CA3AF] mb-1">Patients In Progress</p>
                <p className="text-[20px] font-[600] text-[#1A1A2E]">{patientsWithProgress}</p>
              </div>
              <div className="p-3 rounded-[10px]" style={{ backgroundColor: token.gray50, border: `0.5px solid ${token.purple100}` }}>
                <p className="text-[11px] text-[#9CA3AF] mb-1">Program Completed</p>
                <p className="text-[20px] font-[600] text-[#1A1A2E]">{patientsCompletedProgram}</p>
              </div>
            </div>

            <div className="p-4 rounded-[10px]" style={{ backgroundColor: token.gray50, border: `0.5px solid ${token.purple100}` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Gauge size={14} strokeWidth={1.8} color="#6D28D9" />
                  <p className="text-[13px] font-[500] text-[#1A1A2E]">Overall Video Completion</p>
                </div>
                <p className="text-[13px] font-[600] text-[#6D28D9]">{moduleCompletionAcrossPatients}%</p>
              </div>
              <div className="w-full h-2 rounded-full bg-[#EDE9FE] overflow-hidden">
                <div
                  className="h-2 rounded-full bg-[#6D28D9] transition-all duration-500"
                  style={{ width: `${moduleCompletionAcrossPatients}%` }}
                />
              </div>
              <p className="text-[11px] text-[#9CA3AF] mt-2">
                {watchedVideosAcrossPatients} of {totalVideosAcrossPatients} tracked videos completed.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Aggregate Bar Chart */}
      {chartData.length > 0 && (
        <div style={cardStyle}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: token.gray100 }}>
              <BarChart2 size={16} strokeWidth={1.5} color={token.gray600} />
            </div>
            <div>
              <h2 className="text-[16px] font-[500] text-[#1A1A2E]">Average Sleep Hours by Patient</h2>
            </div>
          </div>
          <p className="text-[12px] text-[#9CA3AF] mb-4 pl-10">
            Dashed line shows the 7-hour recommended target
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3E9FB" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 12]}
                ticks={[0, 3, 6, 7, 9, 12]}
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip content={<SleepBarTooltip />} cursor={{ fill: '#F3E9FB' }} />
              <ReferenceLine
                y={7}
                stroke="#0D9488"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{ value: '7h', position: 'right', fontSize: 10, fill: '#0D9488' }}
              />
              <Bar dataKey="avgHours" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.patientId}
                    fill={entry.avgHours >= 7 ? '#6D28D9' : entry.avgHours >= 6 ? '#F59E0B' : '#EF4444'}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#F3E9FB]">
            {[
              { color: '#6D28D9', label: '≥ 7h (on target)' },
              { color: '#F59E0B', label: '6–7h (near target)' },
              { color: '#EF4444', label: '< 6h (below target)' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                <span className="text-[11px]" style={{ color: token.gray600 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patient Sleep + Program Roster */}
      <div style={cardStyle} className="!p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F3E9FB]">
          <div className="flex items-center gap-2">
            <Users size={18} strokeWidth={1.5} color={token.gray600} />
            <h2 className="text-[16px] font-[500] text-[#1A1A2E]">Patient Sleep & Program Roster</h2>
          </div>
          <p className="text-[12px] text-[#9CA3AF] mt-0.5">
            Click a patient to view detailed sleep analytics and engagement details
          </p>
        </div>

        {patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-8">
            <div className="w-14 h-14 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-3">
              <Users size={24} strokeWidth={1.5} color="#9CA3AF" />
            </div>
            <p className="text-[14px] text-[#6B7280] mb-1">No patients connected</p>
            <button
              onClick={() => navigate('/caregiver/patients')}
              className="mt-3 text-[13px] font-[500] text-[#7200CA] hover:underline"
            >
              Add patients →
            </button>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-12 px-5 py-2 bg-[#FAFAFA] border-b border-[#F3E9FB]">
              <p className="col-span-3 text-[11px] font-[600] text-[#9CA3AF] uppercase tracking-wide">Patient</p>
              <p className="col-span-2 text-[11px] font-[600] text-[#9CA3AF] uppercase tracking-wide">Last Active</p>
              <p className="col-span-2 text-[11px] font-[600] text-[#9CA3AF] uppercase tracking-wide text-center">Avg Sleep</p>
              <p className="col-span-1 text-[11px] font-[600] text-[#9CA3AF] uppercase tracking-wide text-center">Quality</p>
              <p className="col-span-2 text-[11px] font-[600] text-[#9CA3AF] uppercase tracking-wide">Videos</p>
              <p className="col-span-2 text-[11px] font-[600] text-[#9CA3AF] uppercase tracking-wide text-right">Status</p>
            </div>

            <div className="divide-y divide-[#F3E9FB]">
              {sortedPatients.map((patient) => {
                const daysSince = patient.lastActive
                  ? Math.floor((Date.now() - new Date(patient.lastActive).getTime()) / 86400000)
                  : 999;
                const needsAttention = daysSince > 3;
                const isActive = daysSince <= 7;

                const sleepColor =
                  patient.avgSleepHours == null ? token.gray400
                  : patient.avgSleepHours >= 7 ? '#059669'
                  : patient.avgSleepHours >= 6 ? '#B45309'
                  : '#EF4444';

                const trendVal = patient.avgSleepHours;
                const TrendIcon =
                  trendVal == null ? Minus
                  : trendVal >= 7 ? TrendingUp
                  : TrendingDown;
                const trendColor2 =
                  trendVal == null ? token.gray400
                  : trendVal >= 7 ? '#059669'
                  : '#EF4444';

                return (
                  <button
                    key={patient.patientId}
                    onClick={() => navigate(`/caregiver/patients/${patient.patientId}`)}
                    className="w-full grid grid-cols-12 px-5 py-3.5 hover:bg-[#FAFAFA] transition-colors text-left items-center"
                  >
                    {/* Patient name */}
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[13px] font-[500] text-[#1A1A2E]">{patient.name}</p>
                        <p className="text-[11px] text-[#9CA3AF] capitalize">{patient.relationshipType}</p>
                      </div>
                    </div>

                    {/* Last active */}
                    <p className="col-span-2 text-[12px] text-[#6B7280]">
                      {patient.lastActive
                        ? formatDistanceToNow(new Date(patient.lastActive), { addSuffix: true })
                        : 'Never'}
                    </p>

                    {/* Avg sleep */}
                    <div className="col-span-2 flex items-center justify-center gap-1">
                      <TrendIcon size={12} strokeWidth={2} color={trendColor2} />
                      <p className="text-[13px] font-[500]" style={{ color: sleepColor }}>
                        {patient.avgSleepHours != null ? `${patient.avgSleepHours.toFixed(1)}h` : '—'}
                      </p>
                    </div>

                    {/* Sleep quality stars */}
                    <div className="col-span-1 flex justify-center">
                      {renderStars(patient.avgSleepQuality)}
                    </div>

                    {/* Video progress */}
                    <div className="col-span-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-[500] text-[#1A1A2E]">
                          {patient.moduleVideosWatched}/{patient.moduleVideosTotal}
                        </p>
                        <p className="text-[10px] text-[#9CA3AF]">{patient.moduleVideosLeft} left</p>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#EDE9FE] mt-1 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full bg-[#6D28D9]"
                          style={{ width: `${patient.moduleCompletionPercent}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-[#9CA3AF] mt-1">
                        {patient.moduleCompletedWeeks}/4 weeks complete
                      </p>
                    </div>

                    {/* Status badge */}
                    <div className="col-span-2 flex justify-end">
                      {needsAttention ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-[500] bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle size={10} strokeWidth={2} />
                          Attention
                        </span>
                      ) : isActive ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-[500] bg-green-50 text-green-700 border border-green-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-[500] bg-gray-50 text-gray-600 border border-gray-200">
                          Inactive
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
