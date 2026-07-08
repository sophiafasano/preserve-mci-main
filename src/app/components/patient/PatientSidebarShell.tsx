import { type ReactNode, useState } from 'react';
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
  Bell
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
    </div>
  );
}