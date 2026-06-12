import { useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  Heart,
  Bell,
  LogOut,
  Home,
  BarChart3,
  Users,
  BookOpen,
  Settings,
  Menu,
  X,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';
import { useMessaging } from '../../hooks/useMessaging';

interface CarePartnerLayoutProps {
  children: ReactNode;
}

export default function CarePartnerLayout({ children }: CarePartnerLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signout } = useAuth();
  const { unreadCount } = useMessaging();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const rawView = pathSegments[1] || 'dashboard';
  const currentView = rawView === 'sleep-logs' ? 'sleep-data' : rawView;

  const userName = user?.name || 'Care Partner';

  const navigationItems = [
    {
      label: 'Dashboard',
      icon: Home,
      path: '/caregiver',
      view: 'dashboard',
    },
    {
      label: 'My Patients',
      icon: Users,
      path: '/caregiver/patients',
      view: 'patients',
    },
    {
      label: 'Sleep Data',
      icon: BarChart3,
      path: '/caregiver/sleep-data',
      view: 'sleep-data',
    },
    {
      label: 'Messages',
      icon: MessageSquare,
      path: '/caregiver/messages',
      view: 'messages',
      badge: unreadCount,
    },
    {
      label: 'Resources',
      icon: BookOpen,
      path: '/caregiver/resources',
      view: 'resources',
    },
  ];

  const handleSignOut = async () => {
    try {
      await signout();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="nondashboard-ds min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl" style={{ color: '#1f1f3d' }}>
                    Sleep Intervention
                  </h1>
                  <p className="text-sm text-gray-500">Care Partner Portal</p>
                </div>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-teal-500 rounded-full"></span>
              </button>
              <div className="hidden md:flex items-center space-x-3 pl-4 border-l border-gray-200">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                  <span className="text-white text-lg">{userName.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm" style={{ color: '#1f1f3d' }}>
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500">Care Partner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed lg:sticky top-20 left-0 h-[calc(100vh-5rem)] bg-white border-r border-gray-200 transition-all duration-300 z-30 ${
            sidebarOpen ? 'w-64' : 'w-0 lg:w-20'
          } overflow-hidden`}
        >
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-6 h-6 flex-shrink-0" />
                    <span
                      className={`text-base whitespace-nowrap ${
                        sidebarOpen ? 'opacity-100' : 'lg:opacity-0'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  {item.badge && item.badge > 0 && (
                    <div className="bg-teal-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 space-y-2">
            <button
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                currentView === 'settings' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => {
                navigate('/caregiver/settings');
                setSidebarOpen(false);
              }}
            >
              <Settings className="w-6 h-6 flex-shrink-0" />
              <span
                className={`text-base whitespace-nowrap ${
                  sidebarOpen ? 'opacity-100' : 'lg:opacity-0'
                }`}
              >
                Settings
              </span>
            </button>
            <button
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
              onClick={handleSignOut}
            >
              <LogOut className="w-6 h-6 flex-shrink-0" />
              <span
                className={`text-base whitespace-nowrap ${
                  sidebarOpen ? 'opacity-100' : 'lg:opacity-0'
                }`}
              >
                Sign Out
              </span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
