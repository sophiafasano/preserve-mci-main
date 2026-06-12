import { useNavigate } from 'react-router';
import { Moon, Users, Clock, AlertTriangle, ArrowLeft, ChevronRight } from 'lucide-react';
import { useClinicianPatients } from '../../hooks/useClinicianPatients';

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

const cardStyle = {
  backgroundColor: token.white,
  border: `0.5px solid ${token.purple100}`,
  borderRadius: '14px',
  padding: '20px',
};

const riskConfig = {
  high:   { label: 'High',   bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA' },
  medium: { label: 'Medium', bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
  low:    { label: 'Low',    bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' },
};

export default function ClinicianSleepData() {
  const navigate = useNavigate();
  const { patients, stats } = useClinicianPatients();

  const now = new Date();
  const getDaysSince = (dateStr: string) =>
    Math.floor((now.getTime() - new Date(dateStr).getTime()) / 86400000);

  // Real adherence rate from patient records
  const adherenceRate = stats.totalPatients > 0
    ? Math.round((stats.activePatients / stats.totalPatients) * 100)
    : 0;

  // Sort patients: most recently active first
  const sortedPatients = [...patients].sort(
    (a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
  );

  const summaryCards = [
    {
      label: 'Active Rate',
      value: stats.totalPatients > 0 ? `${adherenceRate}%` : 'No data',
      sub: 'Active in last 7 days',
      icon: Clock,
    },
    {
      label: 'Total Patients',
      value: stats.totalPatients,
      sub: 'Enrolled in program',
      icon: Users,
    },
    {
      label: 'Inactive',
      value: stats.inactivePatients,
      sub: 'No activity > 7 days',
      icon: Moon,
    },
    {
      label: 'Need Attention',
      value: stats.patientsNeedingAttention,
      sub: 'High risk or > 3 days inactive',
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back to Dashboard */}
      <button
        onClick={() => navigate('/clinician')}
        className="inline-flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white transition-colors"
        aria-label="Back to Dashboard"
      >
        <ArrowLeft size={18} color="#7200CA" />
        <span style={{ fontSize: '14px', fontWeight: 500, color: token.gray600 }}>Back to Dashboard</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="text-[22px] font-[700] text-[#1A1A2E] mb-1">Sleep Data</h1>
        <p className="text-[14px] text-[#6B7280] font-[400]">
          Patient engagement and activity overview.
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
                <Icon size={17} strokeWidth={1.5} color={token.gray600} />
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


      {/* Per-patient sleep data notice */}
      <div style={cardStyle}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: token.gray100 }}>
            <Moon size={16} strokeWidth={1.5} color={token.gray600} />
          </div>
          <div>
            <h2 className="text-[16px] font-[600]" style={{ color: token.text }}>Patient Sleep Data</h2>
            <p className="text-[11px]" style={{ color: token.gray400 }}>Individual logged sleep entries</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-[10px]" style={{ backgroundColor: token.gray50, border: `0.5px solid ${token.purple100}` }}>
          <Moon size={16} strokeWidth={1.5} color={token.gray400} className="flex-shrink-0 mt-0.5" />
          <p className="text-[13px]" style={{ color: token.gray600 }}>
            Sleep chart data is available per patient. Open a patient profile from the list below or from{' '}
            <button
              onClick={() => navigate('/clinician/patients')}
              className="underline font-[500]"
              style={{ color: token.purple700 }}
            >
              My Patients
            </button>{' '}
            to view their full sleep history and analytics.
          </p>
        </div>
      </div>

      {/* Patient Activity Roster */}
      <div style={cardStyle}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: token.gray100 }}>
            <Users size={16} strokeWidth={1.5} color={token.gray600} />
          </div>
          <h2 className="text-[16px] font-[600]" style={{ color: token.text }}>Patient Activity</h2>
        </div>

        {sortedPatients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: token.gray100 }}>
              <Users size={20} strokeWidth={1.5} color={token.gray400} />
            </div>
            <p className="text-[14px]" style={{ color: token.gray600 }}>No patients enrolled yet.</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div
              className="grid grid-cols-4 gap-4 px-4 py-2 rounded-[8px] mb-1"
              style={{ backgroundColor: token.gray50 }}
            >
              <p className="text-[11px] font-[600] uppercase tracking-wider" style={{ color: token.gray400 }}>Patient</p>
              <p className="text-[11px] font-[600] uppercase tracking-wider" style={{ color: token.gray400 }}>Last Active</p>
              <p className="text-[11px] font-[600] uppercase tracking-wider" style={{ color: token.gray400 }}>Risk</p>
              <p className="text-[11px] font-[600] uppercase tracking-wider" style={{ color: token.gray400 }}>Status</p>
            </div>

            <ul>
              {sortedPatients.map((patient, idx) => {
                const days = getDaysSince(patient.lastActive);
                const risk = riskConfig[patient.riskLevel];
                const isActive = days <= 7;
                const needsAttention = days > 3 || patient.riskLevel === 'high';
                const lastActiveLabel = days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days}d ago`;

                return (
                  <li
                    key={patient.id}
                    className="grid grid-cols-4 gap-4 items-center px-4 py-3 hover:bg-[#F9F5FF] transition-colors cursor-pointer rounded-[8px]"
                    style={{ borderBottom: idx < sortedPatients.length - 1 ? `0.5px solid ${token.purple100}` : 'none' }}
                    onClick={() => navigate(`/clinician/patients/${patient.id}`)}
                  >
                    {/* Name */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-[12px] font-[600] flex-shrink-0">
                        {patient.name.charAt(0)}
                      </div>
                      <p className="text-[13px] font-[500] truncate" style={{ color: token.text }}>{patient.name}</p>
                    </div>

                    {/* Last active */}
                    <p className="text-[13px]" style={{ color: token.gray600 }}>{lastActiveLabel}</p>

                    {/* Risk badge */}
                    <span
                      className="text-[11px] font-[500] px-2 py-0.5 rounded-full w-fit"
                      style={{ backgroundColor: risk.bg, color: risk.color, border: `0.5px solid ${risk.border}` }}
                    >
                      {risk.label}
                    </span>

                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[11px] font-[500] px-2 py-0.5 rounded-full"
                        style={
                          needsAttention
                            ? { backgroundColor: '#FEF2F2', color: '#B91C1C' }
                            : isActive
                            ? { backgroundColor: token.gray100, color: token.gray600 }
                            : { backgroundColor: token.gray100, color: token.gray400 }
                        }
                      >
                        {needsAttention ? 'Needs Attention' : isActive ? 'Active' : 'Inactive'}
                      </span>
                      <ChevronRight size={14} strokeWidth={1.5} color={token.gray400} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
