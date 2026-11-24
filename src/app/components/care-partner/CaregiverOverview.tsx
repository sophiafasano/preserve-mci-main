import { useNavigate } from 'react-router';
import { Users, AlertTriangle, MessageCircle, Clock, Inbox, Moon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useCaregiverPatients } from '../../hooks/useCaregiverPatients';
import { useMessaging } from '../../hooks/useMessaging';
import { useAuth } from '../../contexts/useAuth';

export default function CaregiverOverview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { patients, stats } = useCaregiverPatients();
  const { unreadCount } = useMessaging();

  const firstName = user?.name?.split(' ')[0] || 'Care Partner';

  const patientsWithLogs = patients.filter((p) => p.avgSleepHours != null);
  const avgSleepAll =
    patientsWithLogs.length > 0
      ? (
          patientsWithLogs.reduce((s, p) => s + p.avgSleepHours!, 0) /
          patientsWithLogs.length
        ).toFixed(1)
      : null;

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      subtext: 'Connected patients',
      linkText: 'View all →',
      linkAction: () => navigate('/caregiver/patients'),
      icon: Users,
    },
    {
      title: 'Need Attention',
      value: stats.patientsNeedingAttention,
      subtext: 'Inactive > 3 days',
      linkText: 'Review now →',
      linkAction: () => navigate('/caregiver/patients'),
      icon: AlertTriangle,
    },
    {
      title: 'Messages',
      value: unreadCount,
      subtext: 'Unread messages',
      linkText: 'Open messages →',
      linkAction: () => navigate('/caregiver/messages'),
      icon: MessageCircle,
    },
    {
      title: 'Avg Sleep',
      value: avgSleepAll ? `${avgSleepAll}h` : '—',
      subtext: 'Across all patients',
      linkText: 'View sleep data →',
      linkAction: () => navigate('/caregiver/sleep-data'),
      icon: Moon,
    },
  ];

  const token = {
    white: '#FFFFFF',
    purple100: '#F3E9FB',
  };

  const cardStyle = {
    backgroundColor: token.white,
    border: `0.5px solid ${token.purple100}`,
    borderRadius: '14px',
    padding: '18px 20px',
  };

  const recentActivity = patients
    .filter((p) => p.lastActive)
    .map((p) => {
      const daysSince = Math.floor(
        (Date.now() - new Date(p.lastActive!).getTime()) / 86400000
      );
      const action =
        daysSince === 0
          ? 'was active today'
          : daysSince === 1
          ? 'was active yesterday'
          : `was active ${daysSince} days ago`;
      const timestamp =
        daysSince === 0 ? 'Today' : daysSince === 1 ? 'Yesterday' : `${daysSince}d ago`;
      return { patientId: p.patientId, name: p.name, action, timestamp, daysSince };
    })
    .sort((a, b) => a.daysSince - b.daysSince)
    .slice(0, 5);

  const sleepInsights = patients
    .filter((p) => p.avgSleepHours != null)
    .map((p) => {
      const hrs = p.avgSleepHours!;
      const onTarget = hrs >= 7;
      const TrendIcon = onTarget ? TrendingUp : hrs >= 6 ? Minus : TrendingDown;
      const trendColor = onTarget ? '#059669' : hrs >= 6 ? '#B45309' : '#EF4444';
      return { patientId: p.patientId, name: p.name, hrs, onTarget, TrendIcon, trendColor };
    })
    .sort((a, b) => b.hrs - a.hrs);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-[700] text-[#1A1A2E] mb-1">
          Welcome back, {firstName}
        </h1>
        <p className="text-[14px] text-[#6B7280] font-[400]">
          Here's an overview of your patients' progress.
        </p>
      </div>

      {/* Stat Cards — 4-column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} style={cardStyle} className="flex flex-col justify-between min-h-[140px]">
              <div className="flex items-start justify-between mb-2">
                <div className="w-9 h-9 rounded-[10px] bg-[#F3F4F6] flex items-center justify-center">
                  <Icon size={18} strokeWidth={1.5} color="#6B7280" />
                </div>
              </div>
              <div>
                <p className="text-[13px] text-[#1A1A2E] mb-1">{card.title}</p>
                <p className="text-[26px] font-[500] text-[#1A1A2E] leading-none mb-1">
                  {card.value}
                </p>
                <p className="text-[12px] text-[#9CA3AF] mb-3">{card.subtext}</p>
              </div>
              <button
                onClick={card.linkAction}
                className="text-left text-[12px] font-[500] text-[#7200CA] hover:text-[#5B21B6] transition-colors"
              >
                {card.linkText}
              </button>
            </div>
          );
        })}
      </div>

      {/* Two-column: Activity Feed + Sleep Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Patient Activity Feed */}
        <div style={cardStyle}>
          <h2 className="text-[18px] font-[500] text-[#1A1A2E] mb-4">Patient Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.patientId}
                  className="flex items-center justify-between py-3 border-b border-[#F3E8FF] last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                      {activity.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[14px] font-[500] text-[#1A1A2E]">
                        {activity.name}{' '}
                        <span className="font-[400] text-[#6B7280]">{activity.action}</span>
                      </p>
                      <p className="text-[12px] text-[#9CA3AF] flex items-center mt-0.5">
                        <Clock size={12} className="mr-1" />
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/caregiver/patients/${activity.patientId}`)}
                    className="px-4 py-2 rounded-lg text-[13px] font-[500] border border-[#E9D5FF] text-[#7200CA] hover:bg-[#F3E8FF] transition-all bg-white"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-3">
                <Inbox size={24} strokeWidth={1.5} color="#9CA3AF" />
              </div>
              <p className="text-[14px] text-[#6B7280] mb-1">No patients connected yet</p>
              <p className="text-[12px] text-[#9CA3AF]">
                Activity will appear here once you connect to a patient.
              </p>
              <button
                onClick={() => navigate('/caregiver/patients')}
                className="mt-4 px-4 py-2 rounded-lg text-[13px] font-[500] text-white transition-all"
                style={{ backgroundColor: '#6D28D9' }}
              >
                Add a Patient
              </button>
            </div>
          )}
        </div>

        {/* Sleep Snapshot */}
        <div style={cardStyle}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-[8px] bg-[#F3F4F6] flex items-center justify-center">
              <Moon size={16} strokeWidth={1.5} color="#6B7280" />
            </div>
            <h2 className="text-[18px] font-[500] text-[#1A1A2E]">Sleep Snapshot</h2>
          </div>

          {sleepInsights.length > 0 ? (
            <div className="space-y-3">
              {sleepInsights.map((s) => {
                const TrendIcon = s.TrendIcon;
                return (
                  <button
                    key={s.patientId}
                    onClick={() => navigate(`/caregiver/patients/${s.patientId}`)}
                    className="w-full flex items-center justify-between py-3 border-b border-[#F3E8FF] last:border-0 last:pb-0 text-left hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                        {s.name.charAt(0)}
                      </div>
                      <p className="text-[14px] font-[500] text-[#1A1A2E]">{s.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendIcon size={14} strokeWidth={2} color={s.trendColor} />
                      <p className="text-[14px] font-[500]" style={{ color: s.trendColor }}>
                        {s.hrs.toFixed(1)}h
                      </p>
                      <span
                        className="text-[11px] px-2 py-0.5 rounded-full font-[500]"
                        style={
                          s.onTarget
                            ? { backgroundColor: '#F0FDF4', color: '#166534' }
                            : s.hrs >= 6
                            ? { backgroundColor: '#FFFBEB', color: '#B45309' }
                            : { backgroundColor: '#FEF2F2', color: '#B91C1C' }
                        }
                      >
                        {s.onTarget ? 'On target' : s.hrs >= 6 ? 'Near target' : 'Below target'}
                      </span>
                    </div>
                  </button>
                );
              })}
              <button
                onClick={() => navigate('/caregiver/sleep-data')}
                className="mt-2 text-[12px] font-[500] text-[#7200CA] hover:text-[#5B21B6] transition-colors"
              >
                View full sleep data →
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-3">
                <Moon size={24} strokeWidth={1.5} color="#9CA3AF" />
              </div>
              <p className="text-[14px] text-[#6B7280] mb-1">No sleep data yet</p>
              <p className="text-[12px] text-[#9CA3AF]">
                Sleep data will appear here when patients start logging.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
