import { type ReactNode, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  BarChart2,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  NotebookPen,
  Settings,
  TrendingUp,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';

interface PatientSidebarShellProps {
  children: ReactNode;
}

const token = {
  white: '#FFFFFF',
  purple100: '#F3E9FB',
  sidebarInactive: '#888780',
};

const navigationItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/patient/dashboard' },
  { label: 'Sleep Modules', icon: BookOpen, path: '/modules' },
  { label: 'Sleep Log', icon: NotebookPen, path: '/patient/dashboard' },
  { label: 'Sleep Analytics', icon: BarChart2, path: '/patient/sleep-analytics' },
  { label: 'My Progress', icon: TrendingUp, path: '/patient/progress' },
  { label: 'Messages', icon: MessageCircle, path: '/patient/messages' },
];

export default function PatientSidebarShell({ children }: PatientSidebarShellProps) {
  const navigate = useNavigate();
  const { signout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);

  const showSidebarLabels = sidebarOpen || sidebarHovered;

  const handleSignOut = async () => {
    await signout();
    navigate('/');
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#F9FAFB' }}>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-40 lg:hidden p-2.5 rounded-lg transition-all duration-200 hover:bg-[#F3E8FF] hover:shadow-sm active:scale-95"
        style={{ backgroundColor: token.white, border: `0.5px solid ${token.purple100}` }}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? (
          <X size={18} strokeWidth={1.5} color="#6B7280" />
        ) : (
          <Menu size={18} strokeWidth={1.5} color="#6B7280" />
        )}
      </button>

      <div className="flex min-h-screen">
        <aside
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
          className={`group fixed top-0 left-0 h-screen flex flex-col transition-all duration-300 z-30 w-72 ${
            sidebarHovered ? 'lg:w-72' : 'lg:w-24'
          } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
          style={{ backgroundColor: token.white, borderRight: `0.5px solid ${token.purple100}` }}
        >
          <div className={`px-4 pb-2 ${showSidebarLabels ? 'block' : 'hidden'}`}></div>
          <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  title={item.label}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center py-3 rounded-xl transition-all duration-200 hover:bg-[#F3E8FF] hover:translate-x-0.5 ${
                    showSidebarLabels ? 'justify-start space-x-3 px-4' : 'justify-center px-2'
                  }`}
                  style={{
                    fontSize: '15px',
                    fontWeight: 400,
                    color: token.sidebarInactive,
                    borderLeft: '2px solid transparent',
                  }}
                >
                  <Icon size={18} strokeWidth={1.5} color="#6B7280" className="flex-shrink-0" />
                  <span
                    className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${
                      showSidebarLabels ? 'max-w-[160px] opacity-100' : 'max-w-0 opacity-0'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          <div
            className="mt-auto p-4 space-y-2 shrink-0"
            style={{ borderTop: `0.5px solid ${token.purple100}` }}
          >
            <button
              title="Settings"
              className={`w-full flex items-center py-3 rounded-xl transition-all duration-200 hover:bg-[#F3E8FF] hover:translate-x-0.5 ${
                showSidebarLabels ? 'justify-start space-x-3 px-4' : 'justify-center px-2'
              }`}
              style={{ fontSize: '15px', color: token.sidebarInactive }}
              onClick={() => navigate('/patient/settings')}
            >
              <Settings size={18} strokeWidth={1.5} color="#6B7280" className="flex-shrink-0" />
              <span
                className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${
                  showSidebarLabels ? 'max-w-[160px] opacity-100' : 'max-w-0 opacity-0'
                }`}
              >
                Settings
              </span>
            </button>
            <button
              title="Sign Out"
              className={`w-full flex items-center py-3 rounded-xl transition-all duration-200 hover:bg-[#F3E8FF] hover:translate-x-0.5 ${
                showSidebarLabels ? 'justify-start space-x-3 px-4' : 'justify-center px-2'
              }`}
              style={{ fontSize: '15px', color: token.sidebarInactive }}
              onClick={handleSignOut}
            >
              <LogOut size={18} strokeWidth={1.5} color="#6B7280" className="flex-shrink-0" />
              <span
                className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${
                  showSidebarLabels ? 'max-w-[160px] opacity-100' : 'max-w-0 opacity-0'
                }`}
              >
                Sign Out
              </span>
            </button>
          </div>
        </aside>

        <main className="flex-1 lg:pl-24">{children}</main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/25 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
