import { useNavigate } from 'react-router';
import { Users, AlertTriangle, MessageSquare, Clock, Inbox } from 'lucide-react';
import { useClinicianPatients } from '../../hooks/useClinicianPatients';
import { useMessaging } from '../../hooks/useMessaging';

export default function ClinicianOverview() {
  const navigate = useNavigate();
  const { patients, stats } = useClinicianPatients();
  const { unreadCount } = useMessaging();

  const statCards = [
    {
      title: 'Total Patients',
      value: patients.length,
      subtext: 'Active in program',
      linkText: 'View all →',
      linkAction: () => navigate('/clinician/patients'),
      icon: Users,
    },
    {
      title: 'Pending Reviews',
      value: stats.patientsNeedingAttention || 0,
      subtext: 'Awaiting your review',
      linkText: 'Review now →',
      linkAction: () => navigate('/clinician/patients'),
      icon: AlertTriangle,
    },
    {
      title: 'Messages',
      value: unreadCount,
      subtext: 'Unread messages',
      linkText: 'Open messages →',
      linkAction: () => navigate('/clinician/messages'),
      icon: MessageSquare,
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

  // Build a real activity feed from enrolled patients
  const recentActivity = patients
    .map((p) => {
      const daysSince = Math.floor(
        (Date.now() - new Date(p.lastActive).getTime()) / 86400000
      );
      let action = 'was last active';
      if (daysSince === 0) action = 'was active today';
      else if (daysSince === 1) action = 'was active yesterday';
      else action = `was active ${daysSince} days ago`;

      return {
        id: p.id,
        patientName: p.name,
        action,
        timestamp: daysSince === 0 ? 'Today' : daysSince === 1 ? 'Yesterday' : `${daysSince}d ago`,
        patientId: p.id,
        daysSince,
      };
    })
    .sort((a, b) => a.daysSince - b.daysSince)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-[700] text-[#1A1A2E] mb-1">
          Clinician Dashboard
        </h1>
        <p className="text-[14px] text-[#6B7280] font-[400]">
          Overview of your patients and pending tasks.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                <p className="text-[26px] font-[500] text-[#1A1A2E] leading-none mb-1">{card.value}</p>
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

      {/* Patient Activity Feed */}
      <div style={cardStyle}>
        <h2 className="text-[18px] font-[500] text-[#1A1A2E] mb-4">Patient Activity Feed</h2>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-center justify-between py-3 border-b border-[#F3E8FF] last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-sm">
                    {activity.patientName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[14px] font-[500] text-[#1A1A2E]">
                      {activity.patientName} <span className="font-[400] text-[#6B7280]">{activity.action}</span>
                    </p>
                    <p className="text-[12px] text-[#9CA3AF] flex items-center mt-0.5">
                      <Clock size={12} className="mr-1" /> {activity.timestamp}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/clinician/patients/${activity.patientId}`)}
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
            <p className="text-[14px] text-[#6B7280] mb-1">No patient activity yet</p>
            <p className="text-[12px] text-[#9CA3AF]">Activity will appear here when patients are enrolled.</p>
          </div>
        )}
      </div>
    </div>
  );
}
