import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  Home,
  MessageCircle,
  Menu,
  X,
  LogOut,
  Settings,
  Users,
  BarChart2,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../contexts/useAuth';
import CaregiverOverview from './care-partner/CaregiverOverview';
import CaregiverPatients from './care-partner/CaregiverPatients';
import CaregiverPatientDetail from './care-partner/CaregiverPatientDetail';
import CaregiverSleepData from './care-partner/CaregiverSleepData';
import CareResources from './care-partner/CareResources';
import CaregiverSettingsPage from './care-partner/SettingsPage';
import MessagesCenter from './MessagesCenter';
import { useMessaging } from '../hooks/useMessaging';
import { useCaregiverPatients } from '../hooks/useCaregiverPatients';

const PlainLayout = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const ROUTES = {
  dashboard: '/caregiver',
  patients:  '/caregiver/patients',
  sleepData: '/caregiver/sleep-data',
  messages:  '/caregiver/messages',
  resources: '/caregiver/resources',
  settings:  '/caregiver/settings',
} as const;

export default function CarePartnerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signout } = useAuth();
  const { unreadCount } = useMessaging();
  const { loading } = useCaregiverPatients();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [manualView, setManualView] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signout();
    navigate('/');
  };

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const rawView = pathSegments[1] || 'dashboard';
  const viewAliases: Record<string, string> = {
    'sleep-logs': 'sleep-data',
    'sleep-analytics': 'sleep-data',
    analytics: 'sleep-data',
    progress: 'patients',
  };
  const pathView = viewAliases[rawView] || rawView;
  const currentView = manualView || pathView;
  const patientIdFromPath =
    pathView === 'patients' && pathSegments[2] ? pathSegments[2] : null;

  useEffect(() => {
    setManualView(null);
  }, [location.pathname]);

  const navItems = [
    { label: 'Dashboard',   icon: Home,          path: ROUTES.dashboard, view: 'dashboard' },
    { label: 'My Patients', icon: Users,         path: ROUTES.patients,  view: 'patients'  },
    { label: 'Sleep Data',  icon: BarChart2,     path: ROUTES.sleepData, view: 'sleep-data' },
    { label: 'Messages',    icon: MessageCircle, path: ROUTES.messages,  view: 'messages',  badge: unreadCount },
    { label: 'Resources',   icon: BookOpen,      path: ROUTES.resources, view: 'resources' },
  ];

  const renderContent = () => {
    if (currentView === 'patients' && patientIdFromPath) {
      return loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <CaregiverPatientDetail patientId={patientIdFromPath} />
      );
    }
    switch (currentView) {
      case 'patients':   return <CaregiverPatients />;
      case 'sleep-data': return <CaregiverSleepData />;
      case 'messages':
        return (
          <MessagesCenter
            dashboardPath="/caregiver"
            layoutComponent={PlainLayout}
            hint="To start a conversation, go to the patient profile."
            embedded
          />
        );
      case 'resources':  return <CareResources />;
      case 'settings':   return <CaregiverSettingsPage />;
      default:           return <CaregiverOverview />;
    }
  };

  const showSidebarLabels = sidebarOpen || sidebarHovered;
  const token = {
    white: '#FFFFFF',
    purple100: '#F3E9FB',
    sidebarInactive: '#888780',
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
          <div className={`px-4 pb-2 ${showSidebarLabels ? 'block' : 'hidden'}`} />
          <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    setManualView(item.view);
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  title={item.label}
                  className={`w-full flex items-center py-3 rounded-xl transition-all duration-200 hover:bg-[#F3E8FF] hover:translate-x-0.5 ${
                    showSidebarLabels ? 'justify-start space-x-3 px-4' : 'justify-center px-2'
                  }`}
                  style={{
                    fontSize: '15px',
                    fontWeight: 400,
                    color: isActive ? '#6D28D9' : token.sidebarInactive,
                    borderLeft: isActive ? '2px solid #6D28D9' : '2px solid transparent',
                  }}
                >
                  <div className="relative flex-shrink-0">
                    <Icon size={18} strokeWidth={1.5} color={isActive ? '#6D28D9' : '#6B7280'} />
                    {'badge' in item && item.badge != null && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-[#6D28D9] rounded-full flex items-center justify-center text-[9px] text-white font-bold">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </div>
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
              onClick={() => {
                setManualView('settings');
                navigate(ROUTES.settings);
                setSidebarOpen(false);
              }}
              title="Settings"
              className={`w-full flex items-center py-3 rounded-xl transition-all duration-200 hover:bg-[#F3E8FF] hover:translate-x-0.5 ${
                showSidebarLabels ? 'justify-start space-x-3 px-4' : 'justify-center px-2'
              }`}
              style={{
                fontSize: '15px',
                color: currentView === 'settings' ? '#6D28D9' : token.sidebarInactive,
                borderLeft: currentView === 'settings' ? '2px solid #6D28D9' : '2px solid transparent',
              }}
            >
              <Settings
                size={18}
                strokeWidth={1.5}
                color={currentView === 'settings' ? '#6D28D9' : '#6B7280'}
                className="flex-shrink-0"
              />
              <span
                className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${
                  showSidebarLabels ? 'max-w-[160px] opacity-100' : 'max-w-0 opacity-0'
                }`}
              >
                Settings
              </span>
            </button>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className={`w-full flex items-center py-3 rounded-xl transition-all duration-200 hover:bg-[#F3E8FF] hover:translate-x-0.5 ${
                showSidebarLabels ? 'justify-start space-x-3 px-4' : 'justify-center px-2'
              }`}
              style={{ fontSize: '15px', color: token.sidebarInactive }}
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

        <main className="flex-1 lg:pl-24 p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderContent()}
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/25 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
