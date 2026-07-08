import { type ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  BarChart2,
  BookOpen,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  NotebookPen,
  Settings,
  TrendingUp,
  Bell,
  X,
  BedDouble,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';
import SleepLogModal from '../SleepLogModal';
import { useSleepLogs } from '../../hooks/useSleepLogs';
import { toast } from 'sonner';

interface PatientSidebarShellProps {
  children: ReactNode;
}

const token = {
  white: '#FFFFFF',
  purple100: '#F3E9FB',
  sidebarInactive: '#888780',
};

export default function PatientSidebarShell({ children }: PatientSidebarShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signout } = useAuth();
  const [sleepLogOpen, setSleepLogOpen] = useState(false);
  const { logs, addSleepLog } = useSleepLogs();
  const [sleepTipsOpen, setSleepTipsOpen] = useState(false);

  useEffect(() => {
    const handler = () => setSleepTipsOpen(true);
    window.addEventListener('open-sleep-tips', handler);
    return () => window.removeEventListener('open-sleep-tips', handler);
  }, []);

  useEffect(() => {
    const handleOpenSleepLog = () => {
      const today = new Date().toDateString();
      const hasLoggedToday = logs.some((log) => new Date(log.date).toDateString() === today);
      if (hasLoggedToday) {
        toast.error("You've already logged your sleep for today");
      } else {
        setSleepLogOpen(true);
      }
    };
    window.addEventListener('open-sleep-log', handleOpenSleepLog);
    return () => window.removeEventListener('open-sleep-log', handleOpenSleepLog);
  }, [logs]);

  const navigationItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/patient/dashboard', action: null },
    { label: 'Weekly Sleep Modules', icon: BookOpen, path: '/modules', action: null },
    { label: 'Sleep Log', icon: NotebookPen, path: null, action: () => {
      console.log(logs)
      const today = new Date().toDateString();
      const hasLoggedToday = logs.some((log) => new Date(log.date).toDateString() === today);
      if (hasLoggedToday) {
        toast.error("You've already logged your sleep for today");
      } else {
        setSleepLogOpen(true);
      }
    }},
    { label: 'Sleep Analysis', icon: BarChart2, path: '/patient/sleep-analytics', action: null },
    { label: 'My Progress', icon: TrendingUp, path: '/patient/progress', action: null },
    { label: 'Messages', icon: MessageCircle, path: '/patient/messages', action: null },
    { label: 'Reminders', icon: Bell, path: '/patient/reminders', action: null },
  ];

  const handleSignOut = async () => {
    await signout();
    navigate('/');
  };

  const navButtonStyle = (isActive: boolean) => ({
    fontSize: '15px',
    fontWeight: 400,
    color: isActive ? '#6D28D9' : token.sidebarInactive,
    borderLeft: isActive ? '2px solid #6D28D9' : '2px solid transparent',
    borderRadius: '10px',
    paddingTop: '10px',
    paddingBottom: '10px',
    paddingLeft: '16px',
    paddingRight: '16px',
  });

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      <aside
        className="relative flex flex-col w-72 min-h-screen shrink-0"
        style={{ backgroundColor: token.white, borderRight: `0.5px solid ${token.purple100}` }}
      >
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.action 
              ? sleepLogOpen 
              : !sleepLogOpen && location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else if (item.path) {
                    navigate(item.path);
                  }
                }}
                className="w-full flex items-center justify-start space-x-3 rounded-xl transition-all duration-200 hover:bg-[#F3E8FF]"
                style={navButtonStyle(isActive)}
              >
                <Icon size={18} strokeWidth={1.5} color={isActive ? '#6D28D9' : '#6B7280'} className="flex-shrink-0" />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto p-4 space-y-2 shrink-0" style={{ borderTop: `0.5px solid ${token.purple100}` }}>
          <button
            onClick={() => navigate('/patient/settings')}
            className="w-full flex items-center justify-start space-x-3 rounded-xl transition-all duration-200 hover:bg-[#F3E8FF]"
            style={navButtonStyle(location.pathname === '/patient/settings')}
          >
            <Settings size={18} strokeWidth={1.5} color={location.pathname === '/patient/settings' ? '#6D28D9' : '#6B7280'} className="flex-shrink-0" />
            <span className="whitespace-nowrap">Settings</span>
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-start space-x-3 rounded-xl transition-all duration-200 hover:bg-[#F3E8FF]"
            style={navButtonStyle(false)}
          >
            <LogOut size={18} strokeWidth={1.5} color="#6B7280" className="flex-shrink-0" />
            <span className="whitespace-nowrap">Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
      <SleepLogModal
        isOpen={sleepLogOpen}
        onClose={() => setSleepLogOpen(false)}
        onSubmit={async (data) => {
          await addSleepLog(data);
          setSleepLogOpen(false);
        }}
      />
      {sleepTipsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSleepTipsOpen(false)} />
            <div className="relative w-full max-w-[480px] rounded-2xl bg-white p-7">
              <div className="mb-4 flex items-center justify-between">
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A2E' }}>Sleep Tips</h3>
                <button
                  onClick={() => setSleepTipsOpen(false)}
                  className="rounded-md p-1 transition-all duration-200 hover:bg-[#F3E8FF] hover:scale-105 active:scale-100"
                >
                  <X size={18} strokeWidth={1.5} color="#1A1A2E" />
                </button>
              </div>
              <details open className="mb-4">
                <summary className="flex cursor-pointer items-center gap-2"
                  style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A2E', padding: '12px 0', borderBottom: '0.5px solid #F3E8FF' }}
                >
                  <BedDouble size={16} strokeWidth={1.5} color="#6B7280" />
                  Stimulus Control
                </summary>
                <ul className="mt-3 list-disc pl-6" style={{ color: '#4B5563', fontSize: '13px', lineHeight: 1.7 }}>
                  <li>Don&apos;t use your bed for anything other than sleep and sex</li>
                  <li>If you can&apos;t fall asleep within 15–20 min, leave the bed and do something relaxing in another room. Return only when sleepy</li>
                  <li>If you wake up and can&apos;t fall back asleep within 20 minutes, follow the rule above</li>
                  <li>Avoid napping during the day</li>
                  <li>Maintain a regular bedtime and wake time every day</li>
                </ul>
              </details>
              <details open>
                <summary className="flex cursor-pointer items-center gap-2"
                  style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A2E', padding: '12px 0', borderBottom: '0.5px solid #F3E8FF' }}
                >
                  <Sparkles size={16} strokeWidth={1.5} color="#6B7280" />
                  Sleep Hygiene
                </summary>
                <ul className="mt-3 list-disc pl-6" style={{ color: '#4B5563', fontSize: '13px', lineHeight: 1.7 }}>
                  <li>Avoid caffeine after noon</li>
                  <li>Avoid exercise within 2 hours of bedtime</li>
                  <li>Avoid nicotine within 2 hours of bedtime</li>
                  <li>Avoid alcohol within 2 hours of bedtime</li>
                  <li>Avoid heavy meals within 2 hours of bedtime</li>
                  <li>Avoid screen time within 1 hour of bedtime</li>
                </ul>
              </details>
            </div>
          </div>
        )}
    </div>
  );
}