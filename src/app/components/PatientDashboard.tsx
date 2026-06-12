import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Moon,
  Star,
  Flame,
  BookOpen,
  MessageCircle,
  CalendarCheck,
  ClipboardList,
  Clock,
  LayoutDashboard,
  NotebookPen,
  BarChart2,
  TrendingUp,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  BedDouble,
  Sparkles,
} from 'lucide-react';
import { Button } from './ui/button';
import { useSleepLogs } from '../hooks/useSleepLogs';
import { useAllModulesProgress } from '../hooks/useModuleProgress';
import { moduleData, moduleWeekOrder } from '../data/moduleData';
import { useReminders } from '../hooks/useReminders';
import { useAuth } from '../contexts/useAuth';
import { useMessaging } from '../hooks/useMessaging';
import SleepLogModal, { SleepLogData } from './SleepLogModal';
import { supabase } from '../utils/supabaseClient';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signout } = useAuth();
  const { unreadCount } = useMessaging();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [sleepLogModalOpen, setSleepLogModalOpen] = useState(false);
  const [sleepTipsOpen, setSleepTipsOpen] = useState(false);
  const [sleepTrendMetric, setSleepTrendMetric] = useState<'duration' | 'efficiency' | 'wakeTime'>('duration');
  
  // Use localStorage-backed sleep logs
  const { logs: sleepLogs, addSleepLog, stats: sleepStats, getChartData } = useSleepLogs();
  
  // Use localStorage-backed module progress
  const moduleProgressStats = useAllModulesProgress();

  // Reminders system
  const { activeCount, refreshAutomaticReminders } = useReminders();

  // Refresh reminders when sleep logs or module progress changes
  useEffect(() => {
    const lastLogDate = sleepLogs.length > 0
      ? sleepLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
      : null;

    const incompleteModules = (moduleProgressStats.totalModules || 8) - (moduleProgressStats.completedCount || 0);

    refreshAutomaticReminders(lastLogDate, sleepStats.currentStreak, incompleteModules);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sleepLogs.length, sleepStats.currentStreak, moduleProgressStats.completedCount]);

  const handleSleepLogSubmit = (data: SleepLogData) => {
    addSleepLog(data);
  };

  const userName = user?.name || 'Patient';
  const firstName = userName.trim().split(/\s+/)[0] || 'Patient';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  // Real module progress from localStorage
  const totalWeeks = moduleWeekOrder.length;
  const currentWeekIndex = Math.min(moduleProgressStats.completedCount, totalWeeks - 1);
  const currentWeek = Math.min(moduleProgressStats.completedCount + 1, totalWeeks);
  const currentWeekKey = moduleWeekOrder[currentWeekIndex];
  const currentModuleData = moduleData[currentWeekKey];
  const currentModuleProgress = moduleProgressStats.allModules[currentWeekKey];
  const lessonsCompleted = currentModuleProgress
    ? [currentModuleProgress.videoWatched, currentModuleProgress.quizCompleted, currentModuleProgress.exerciseCompleted].filter(Boolean).length
    : 0;
  const moduleProgress = Math.round(
    moduleWeekOrder.reduce((sum, key) => sum + (moduleProgressStats.allModules[key]?.progress ?? 0), 0) / totalWeeks
  );
  const currentModule = {
    title: currentModuleData.title,
    description: currentModuleData.description,
    lessonsCompleted,
    totalLessons: 3,
    estimatedTime: currentModuleData.duration,
  };

  // Sleep prescription — set by the clinician, fetched from clinician_patients
  const [prescribedSleepHours, setPrescribedSleepHours] = useState<number | null>(null);
  useEffect(() => {
    if (!user) return;
    supabase
      .from('clinician_patients')
      .select('prescribed_sleep_hours')
      .eq('patient_id', user.id)
      .eq('status', 'active')
      .order('assigned_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.prescribed_sleep_hours != null) {
          setPrescribedSleepHours(Number(data.prescribed_sleep_hours));
        }
      });
  }, [user]);

  const sleepStatsData = [
    {
      label: 'Avg Sleep',
      value: sleepStats.averageHours > 0 ? `${sleepStats.averageHours} hrs` : 'No data',
      icon: Moon,
      trend: sleepStats.averageHours >= 7 ? '+0.5' : 'Track more',
    },
    { 
      label: 'Sleep Quality', 
      value: sleepStats.averageQuality > 0 ? `${Math.round(sleepStats.averageQuality * 10)}%` : 'No data',
      icon: Star,
      trend: sleepStats.totalLogs > 3 ? '+5%' : 'Keep logging' 
    },
    { 
      label: 'Current Streak', 
      value: `${sleepStats.currentStreak} day${sleepStats.currentStreak !== 1 ? 's' : ''}`, 
      icon: Flame,
      trend: sleepStats.currentStreak > 0 ? 'Great!' : 'Start now' 
    },
  ];

  // Real chart data from localStorage (last 7 days) - memoized for stability
  const sleepTrendData = useMemo(() => {
    return getChartData(7).map((item, index) => ({
      ...item,
      // Ensure each item has a truly unique key for recharts
      uniqueId: `${item.fullDate}-${index}`,
    }));
  }, [getChartData]);

  const sleepTrendSeries = useMemo(() => {
    return sleepTrendData.map((item) => {
      if (sleepTrendMetric === 'duration') {
        return {
          ...item,
          value: item.hasData ? item.hours : null,
        };
      }

      if (sleepTrendMetric === 'efficiency') {
        return {
          ...item,
          value: typeof item.sleepEfficiency === 'number' ? item.sleepEfficiency : null,
        };
      }

      return {
        ...item,
        value: typeof item.totalWakeMinutes === 'number' ? item.totalWakeMinutes : null,
      };
    });
  }, [sleepTrendData, sleepTrendMetric]);

  const hasTrendDataForMetric = useMemo(() => {
    return sleepTrendSeries.some((item) => typeof item.value === 'number');
  }, [sleepTrendSeries]);

  const sampleTrendSeries = useMemo(() => {
    const sampleDuration = [6.6, 7.1, 6.9, 7.4, 7.2, 7.6, 7.3];
    const sampleEfficiency = [74, 78, 81, 83, 85, 87, 84];
    const sampleWakeTime = [52, 46, 42, 38, 34, 30, 33];

    const sampleValues =
      sleepTrendMetric === 'duration'
        ? sampleDuration
        : sleepTrendMetric === 'efficiency'
          ? sampleEfficiency
          : sampleWakeTime;

    const fallbackDates = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const sourceDates = sleepTrendData.length > 0 ? sleepTrendData.map((item) => item.date) : fallbackDates;

    return sourceDates.slice(0, 7).map((date, index) => ({
      date,
      value: sampleValues[index] ?? sampleValues[sampleValues.length - 1],
    }));
  }, [sleepTrendData, sleepTrendMetric]);

  const displayedTrendSeries = hasTrendDataForMetric ? sleepTrendSeries : sampleTrendSeries;
  const isSamplePreview = !hasTrendDataForMetric;

  const chartConfig = useMemo(() => {
    if (sleepTrendMetric === 'efficiency') {
      return {
        domain: [0, 100] as [number, number],
        ticks: [0, 20, 40, 60, 80, 100],
        label: '%',
        legend: 'Sleep Efficiency',
      };
    }

    if (sleepTrendMetric === 'wakeTime') {
      const sourceValues = isSamplePreview ? sampleTrendSeries : sleepTrendSeries;
      const maxWake = Math.max(30, ...sourceValues.map((item) => item.value || 0));
      const roundedMax = Math.ceil(maxWake / 10) * 10;
      const step = Math.max(10, Math.ceil(roundedMax / 5 / 10) * 10);
      const ticks: number[] = [];
      for (let value = 0; value <= roundedMax; value += step) {
        ticks.push(value);
      }

      return {
        domain: [0, roundedMax] as [number, number],
        ticks,
        label: 'Minutes',
        legend: 'Wake Time',
      };
    }

    return {
      domain: [0, 10] as [number, number],
      ticks: [0, 2, 4, 6, 8, 10],
      label: 'Hours',
      legend: 'Sleep Hours',
    };
  }, [isSamplePreview, sampleTrendSeries, sleepTrendMetric, sleepTrendSeries]);

  const quickActions = [
    { label: 'Log Last Night\'s Sleep', icon: Moon, color: 'purple', action: 'log-sleep' },
    { label: 'View Sleep Tips', icon: BookOpen, color: 'purple', action: 'sleep-tips' },
    { label: 'Message Care Team', icon: MessageCircle, color: 'purple', action: 'messages' },
  ];

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'log-sleep':
        setSleepLogModalOpen(true);
        break;
      case 'sleep-tips':
        setSleepTipsOpen(true);
        break;
      case 'messages':
        navigate('/patient/messages');
        break;
      default:
        break;
    }
  };

  const upcomingItems = useMemo(() => {
    const items: { type: string; title: string; date: string; icon: typeof CalendarCheck }[] = [];
    const today = new Date().toISOString().split('T')[0];
    const hasLoggedToday = sleepLogs.some((l) => l.date?.split('T')[0] === today);
    if (!hasLoggedToday) {
      items.push({ type: 'reminder', title: "Log last night's sleep", date: 'Today', icon: Clock });
    }
    if (activeCount > 0) {
      items.push({
        type: 'reminder',
        title: `${activeCount} active reminder${activeCount !== 1 ? 's' : ''}`,
        date: 'Pending',
        icon: ClipboardList,
      });
    }
    if (items.length === 0) {
      items.push({ type: 'info', title: 'All caught up! Keep logging your sleep.', date: '', icon: CalendarCheck });
    }
    return items;
  }, [sleepLogs, activeCount]);

  const navigationItems: Array<{ label: string; icon: React.ElementType; path: string; action?: string; badge?: number }> = [
    { label: 'Dashboard',      icon: LayoutDashboard, path: '/patient/dashboard' },
    { label: 'Sleep Modules',  icon: BookOpen,        path: '/modules' },
    { label: 'Sleep Log',      icon: NotebookPen,     path: '/patient/dashboard', action: 'log-sleep' },
    { label: 'Sleep Analytics', icon: BarChart2,      path: '/patient/sleep-analytics' },
    { label: 'My Progress',    icon: TrendingUp,      path: '/patient/progress' },
    { label: 'Messages',       icon: MessageCircle,   path: '/patient/messages', badge: unreadCount },
  ];

  // Suppress recharts duplicate key warning (known library issue)
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('Encountered two children with the same key') ||
         args[0].includes('width(0) and height(0)'))
      ) {
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  const handleSignOut = async () => {
    await signout();
    navigate('/');
  };

  const showSidebarLabels = sidebarOpen || sidebarHovered;
  const homepagePurple = '#6D28D9';
  const homepageButtonGradient = 'linear-gradient(90deg, #6D28D9 0%, #5B21B6 100%)';
  const homepageGradientClass = 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800';
  const token = {
    purple900: '#6D28D9',
    purple800: '#6D28D9',
    purple600: '#6D28D9',
    purple400: '#6D28D9',
    purple200: '#DAB6F2',
    purple100: '#F3E9FB',
    purple50: '#FBF5FF',
    white: '#FFFFFF',
    sidebarInactive: '#888780',
    label: '#AFA9EC',
    divider: '#F3F2FE',
    textBlack: '#000000',
  };

  const cardStyle = {
    backgroundColor: token.white,
    border: `0.5px solid ${token.purple100}`,
    borderRadius: '14px',
    padding: '18px 20px',
  } as const;
  const contentScale = 1.08;

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#F9FAFB' }}>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-40 lg:hidden p-2.5 rounded-lg transition-all duration-200 hover:bg-[#F3E8FF] hover:shadow-sm active:scale-95"
        style={{ backgroundColor: token.white, border: `0.5px solid ${token.purple100}`, color: token.purple600 }}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? (
          <X size={18} strokeWidth={1.5} color="#6B7280" />
        ) : (
          <Menu size={18} strokeWidth={1.5} color="#6B7280" />
        )}
      </button>

      <div className="flex min-h-screen">
        {/* Sidebar Navigation */}
        <aside
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
          className={`group fixed top-0 left-0 h-screen flex flex-col transition-all duration-300 z-30 w-72 ${
            sidebarHovered ? 'lg:w-72' : 'lg:w-24'
          } ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
          style={{ backgroundColor: token.white, borderRight: `0.5px solid ${token.purple100}` }}
        >
          <div className={`px-4 pb-2 ${showSidebarLabels ? 'block' : 'hidden'}`}></div>
          <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = !item.action && location.pathname === item.path;
              return (
                <button
                  key={item.label}
                  title={item.label}
                  onClick={() => {
                    if (item.action) {
                      handleQuickAction(item.action);
                    } else {
                      navigate(item.path);
                    }
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center py-3 rounded-xl transition-all duration-200 hover:bg-[#F3E8FF] hover:translate-x-0.5 ${showSidebarLabels ? 'justify-start space-x-3 px-4' : 'justify-center px-2'}`}
                  style={{
                    fontSize: '15px',
                    fontWeight: 400,
                    color: isActive ? '#6D28D9' : token.sidebarInactive,
                    borderLeft: isActive ? '2px solid #6D28D9' : '2px solid transparent',
                    borderRadius: '10px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    paddingLeft: showSidebarLabels ? '16px' : '8px',
                    paddingRight: showSidebarLabels ? '16px' : '8px',
                  }}
                >
                  <div className="relative flex-shrink-0">
                    <Icon size={18} strokeWidth={1.5} color={isActive ? '#6D28D9' : '#6B7280'} />
                    {item.badge != null && item.badge > 0 && (
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

          {/* Bottom Actions */}
          <div
            className="mt-auto p-4 space-y-2 shrink-0"
            style={{ borderTop: `0.5px solid ${token.purple100}` }}
          >
            <div className={`pb-1 ${showSidebarLabels ? 'block' : 'hidden'}`}>
              <p
                className="text-[10px]"
                style={{ color: token.textBlack, letterSpacing: '0.07em', fontWeight: 500 }}
              >
                ACCOUNT
              </p>
            </div>
            <button 
              title="Settings"
              className={`w-full flex items-center py-3 rounded-xl transition-all duration-200 hover:bg-[#F3E8FF] hover:translate-x-0.5 ${
                showSidebarLabels ? 'justify-start space-x-3 px-4' : 'justify-center px-2'
              }`}
              style={{ fontSize: '15px', color: token.sidebarInactive, paddingTop: '10px', paddingBottom: '10px' }}
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
              style={{ fontSize: '15px', color: token.sidebarInactive, paddingTop: '10px', paddingBottom: '10px' }}
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

        {/* Main Content */}
        <main
          className="flex-1 lg:pl-24 p-6 lg:p-8 max-w-7xl mx-auto w-full"
          style={{
            zoom: contentScale,
            marginLeft: 'auto',
            marginRight: 'auto',
            paddingBottom: '72px',
          }}
        >
          {/* Welcome Section */}
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h1 className="mb-2" style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A2E' }}>
              {greeting}, {firstName}!
              </h1>
              <p style={{ fontSize: '14px', color: '#6B7280', fontWeight: 400 }}>
                You&apos;re doing great. Let&apos;s continue your sleep wellness journey.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center rounded-full"
                style={{
                  backgroundColor: token.purple100,
                  border: `0.5px solid ${token.purple200}`,
                  color: token.textBlack,
                  fontSize: '13px',
                  fontWeight: 500,
                  padding: '6px 14px',
                }}
              >
                Week {currentWeek} of {totalWeeks}
              </span>
              <button
                onClick={() => setSleepLogModalOpen(true)}
                className="transition-all duration-200 hover:brightness-95 hover:-translate-y-px active:translate-y-0"
                style={{
                  color: token.white,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  padding: '9px 16px',
                  border: 'none',
                  backgroundImage: homepageButtonGradient,
                }}
              >
                Log sleep
              </button>
            </div>
          </div>

          {/* Current Week's Module - Main Focus */}
          <div className="mb-3">
            <div style={{ ...cardStyle, border: `0.5px solid ${token.purple200}` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center"
                      style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                    >
                      <BookOpen size={18} strokeWidth={1.5} color="#6B7280" />
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: 600, color: '#9333EA', letterSpacing: '0.08em' }}>
                        CURRENT MODULE
                      </p>
                      <h2 style={{ fontSize: '18px', fontWeight: 500, color: token.textBlack }}>{currentModule.title}</h2>
                    </div>
                  </div>
                  <p style={{ fontSize: '15px', color: token.textBlack }}>
                    {currentModule.description}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span style={{ fontSize: '13px', color: token.textBlack }}>
                    {currentModule.lessonsCompleted} of {currentModule.totalLessons} lessons
                    completed
                  </span>
                  <span style={{ fontSize: '13px', color: token.textBlack }}>
                    {moduleProgress}%
                  </span>
                </div>
                <div className="h-2 rounded-[4px] overflow-hidden" style={{ backgroundColor: token.purple100 }}>
                  <div
                    className={`h-full rounded-[2px] transition-all duration-500 ${homepageGradientClass}`}
                    style={{ width: `${moduleProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* CTA and Time */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-2" style={{ color: token.textBlack }}>
                  <Clock size={15} strokeWidth={1.5} color="#6B7280" />
                  <span style={{ fontSize: '13px' }}>{currentModule.estimatedTime}</span>
                </div>
                <Button
                  className="h-11 px-5 rounded-lg transition-all duration-200 ease-out hover:bg-[#F3E8FF] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg active:translate-y-0 active:scale-100"
                  style={{
                    border: `1px solid ${homepagePurple}`,
                    backgroundColor: token.white,
                    color: homepagePurple,
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                  onClick={() => navigate(`/modules/${currentWeekKey.replace('week', 'week-')}`)}
                >
                  Continue Module
                  <ChevronRight size={16} strokeWidth={1.5} color="#6B7280" className="ml-2" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            {sleepStatsData.map((stat, index) => {
              const Icon = stat.icon;
              const isEmpty = stat.value === 'No data';
              return (
                <div key={index} style={cardStyle}>
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                      style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                    >
                      <Icon size={18} strokeWidth={1.5} color="#6B7280" />
                    </div>
                    <div
                      className="flex items-center space-x-1 px-2 py-1 rounded-full"
                      style={{ fontSize: '11px', color: '#C4B5FD', backgroundColor: token.purple100, fontWeight: 400 }}
                    >
                      <button className="transition-colors duration-200 hover:text-[#6D28D9] hover:underline" style={{ fontSize: '11px', color: '#C4B5FD', fontWeight: 400 }}>
                        {stat.trend}
                      </button>
                    </div>
                  </div>
                  {index === 0 ? (
                    <div className="mt-1 flex items-stretch justify-between">
                      <div className="flex-1 text-center">
                        <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Avg Sleep</p>
                        <p style={{ fontSize: '22px', fontWeight: 600, color: '#1A1A2E' }}>
                          {isEmpty ? '—' : stat.value}
                        </p>
                      </div>
                      <div style={{ width: '0.5px', backgroundColor: '#E9D5FF' }}></div>
                      <div className="flex-1 text-center">
                        <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Sleep Prescription</p>
                        <p style={{ fontSize: '22px', fontWeight: 600, color: '#7200CA' }}>
                          {prescribedSleepHours != null ? `${prescribedSleepHours} hrs` : '—'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p style={{ fontSize: '13px', color: token.textBlack, marginBottom: '6px' }}>{stat.label}</p>
                      {isEmpty ? (
                        <>
                          <p style={{ fontSize: '15px', color: '#D8B4FE', fontWeight: 400 }}>No sleep data</p>
                          <button className="mt-1 cursor-pointer transition-colors duration-200 hover:text-[#5B21B6] hover:underline" style={{ color: homepagePurple, fontSize: '12px' }}>
                            Start logging →
                          </button>
                        </>
                      ) : (
                        <p style={{ fontSize: '26px', color: token.textBlack, fontWeight: 500 }}>{stat.value}</p>
                      )}
                      <p style={{ fontSize: '12px', color: token.textBlack, marginTop: '6px' }}>Updated from your recent logs</p>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sleep Trend Chart */}
          <div style={{ ...cardStyle, marginBottom: '12px' }}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-3 gap-3">
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 500, color: token.textBlack, marginBottom: '4px' }}>
                  Sleep Trend
                </h2>
                <p style={{ fontSize: '13px', color: token.textBlack }}>Last 7 days</p>
              </div>
              <div className="flex items-center space-x-2 flex-wrap">
                <button
                  onClick={() => setSleepTrendMetric('duration')}
                  className={`px-3 py-1 transition-all duration-200 hover:opacity-90 hover:-translate-y-px active:translate-y-0 ${
                    sleepTrendMetric === 'duration'
                      ? ''
                      : ''
                  }`}
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    backgroundColor: sleepTrendMetric === 'duration' ? homepagePurple : '#FFFFFF',
                    color: sleepTrendMetric === 'duration' ? '#FFFFFF' : '#6B7280',
                    border: sleepTrendMetric === 'duration' ? 'none' : '0.5px solid #E9D5FF',
                    borderRadius: '20px',
                  }}
                >
                  Total Sleep
                </button>
                <button
                  onClick={() => setSleepTrendMetric('efficiency')}
                  className={`px-3 py-1 transition-all duration-200 hover:opacity-90 hover:-translate-y-px active:translate-y-0 ${
                    sleepTrendMetric === 'efficiency'
                      ? ''
                      : ''
                  }`}
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    backgroundColor: sleepTrendMetric === 'efficiency' ? homepagePurple : '#FFFFFF',
                    color: sleepTrendMetric === 'efficiency' ? '#FFFFFF' : '#6B7280',
                    border: sleepTrendMetric === 'efficiency' ? 'none' : '0.5px solid #E9D5FF',
                    borderRadius: '20px',
                  }}
                >
                  Sleep Efficiency
                </button>
                <button
                  onClick={() => setSleepTrendMetric('wakeTime')}
                  className={`px-3 py-1 transition-all duration-200 hover:opacity-90 hover:-translate-y-px active:translate-y-0 ${
                    sleepTrendMetric === 'wakeTime'
                      ? ''
                      : ''
                  }`}
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    backgroundColor: sleepTrendMetric === 'wakeTime' ? homepagePurple : '#FFFFFF',
                    color: sleepTrendMetric === 'wakeTime' ? '#FFFFFF' : '#6B7280',
                    border: sleepTrendMetric === 'wakeTime' ? 'none' : '0.5px solid #E9D5FF',
                    borderRadius: '20px',
                  }}
                >
                  Total Wake Time
                </button>
              </div>
            </div>

            {displayedTrendSeries.length > 0 ? (
              <>
                <div className="w-full" style={{ height: '340px', maxHeight: '340px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={displayedTrendSeries}
                      margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3E8FF" vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke="#AFA9EC"
                        style={{ fontSize: '12px' }}
                        tick={{ fill: '#AFA9EC' }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        stroke="#AFA9EC"
                        style={{ fontSize: '14px' }}
                        tick={{ fill: '#AFA9EC', fontSize: 14 }}
                        width={56}
                        interval={0}
                        domain={chartConfig.domain}
                        ticks={chartConfig.ticks}
                        label={{
                          value: chartConfig.label,
                          angle: -90,
                          position: 'insideLeft',
                          style: { fill: '#AFA9EC', fontSize: '14px' },
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: token.white,
                          border: `0.5px solid ${token.purple100}`,
                          borderRadius: '12px',
                          padding: '12px',
                        }}
                        labelStyle={{ color: token.textBlack, fontWeight: 500 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#6D28D9"
                        strokeWidth={3}
                        dot={{ fill: '#6D28D9', r: 5 }}
                        activeDot={{ r: 7 }}
                        name={chartConfig.legend}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 flex items-center justify-center space-x-2" style={{ fontSize: '12px', color: token.textBlack }}>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: token.purple600 }}></div>
                    <span>{chartConfig.legend}</span>
                  </div>
                </div>

                {isSamplePreview && (
                  <div className="mt-3 flex flex-col items-center gap-2 text-center">
                    <span
                      className="rounded-full"
                      style={{
                        backgroundColor: '#F3E8FF',
                        color: '#6D28D9',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '4px 10px',
                      }}
                    >
                      Sample Preview Data
                    </span>
                    <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
                      This is a demo graph preview. Start logging sleep to see your real trends.
                    </p>
                    <button
                      onClick={() => setSleepLogModalOpen(true)}
                      className="rounded-lg px-5 py-2 text-white transition-all duration-200 ease-out hover:brightness-95 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg active:translate-y-0 active:scale-100"
                      style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        backgroundImage: homepageButtonGradient,
                      }}
                    >
                      Log last night&apos;s sleep
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div
                className="flex flex-col items-center justify-center text-center"
                style={{
                  backgroundColor: '#F9F7FF',
                  border: '0.5px solid #E9D5FF',
                  borderRadius: '12px',
                  padding: '40px 24px',
                  minHeight: '160px',
                }}
              >
                <Moon size={28} strokeWidth={1.5} color="#C4B5FD" />
                <h3 style={{ fontSize: '15px', marginTop: '12px', color: '#1A1A2E', fontWeight: 600 }}>
                  No sleep data yet
                </h3>
                <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '6px' }}>
                  Log your first night to see your sleep trends appear here
                </p>
                <button
                  onClick={() => setSleepLogModalOpen(true)}
                  className="mt-4 rounded-lg px-5 py-2 text-white transition-all duration-200 ease-out hover:brightness-95 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg active:translate-y-0 active:scale-100"
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    backgroundImage: homepageButtonGradient,
                  }}
                >
                  Log last night&apos;s sleep
                </button>
              </div>
            )}
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
            {/* Quick Actions */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: '16px', fontWeight: 500, color: token.textBlack, marginBottom: '12px' }}>
                Quick Actions
              </h2>
              <div>
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  const handleClick = () => {
                    handleQuickAction(action.action);
                  };
                  const isActiveAction = index === 0;
                  
                  return (
                    <button
                      key={index}
                      onClick={handleClick}
                      className="w-full flex items-center justify-between py-4 transition-all duration-200 hover:bg-[#FAF5FF] hover:-translate-y-px"
                      style={{
                        borderRadius: '10px',
                        borderBottom: index !== quickActions.length - 1 ? `0.5px solid ${token.divider}` : 'none',
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                          <Icon size={18} strokeWidth={1.5} color="#6B7280" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: isActiveAction ? token.purple400 : token.purple200 }}
                          />
                          <span style={{ fontSize: '14px', color: '#1A1A2E', fontWeight: 400 }}>
                          {action.label}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={16} strokeWidth={1.5} color="#C4B5FD" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Reminders & Appointments */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: '16px', fontWeight: 500, color: token.textBlack, marginBottom: '12px' }}>
                Upcoming
              </h2>
              <div>
                {upcomingItems.map((item, index) => {
                  const Icon = item.icon;
                  const isToday = item.date.toLowerCase().includes('today');
                  return (
                    <div
                      key={index}
                      className="flex items-start space-x-3 py-4"
                      style={{
                        borderBottom: index !== upcomingItems.length - 1 ? `0.5px solid ${token.divider}` : 'none',
                      }}
                    >
                      <div className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                        <Icon size={18} strokeWidth={1.5} color="#6B7280" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: '14px', color: '#1A1A2E', marginBottom: '5px', fontWeight: 500 }}>
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <p style={{ fontSize: '12px', color: '#9CA3AF' }}>{item.date}</p>
                          <span
                            className="rounded-full"
                            style={{
                              fontSize: '11px',
                              fontWeight: 500,
                              borderRadius: '20px',
                              padding: '3px 10px',
                              backgroundColor: isToday ? '#EDE9FE' : '#F3E8FF',
                              color: isToday ? '#4C1D95' : '#6B21A8',
                            }}
                          >
                            {isToday ? 'Today' : 'Due soon'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ backgroundColor: 'rgba(38, 33, 92, 0.35)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sleep Log Modal */}
      <SleepLogModal
        isOpen={sleepLogModalOpen}
        onClose={() => setSleepLogModalOpen(false)}
        onSubmit={handleSleepLogSubmit}
      />

      {/* Sleep Tips Modal */}
      {sleepTipsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSleepTipsOpen(false)}></div>
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
              <summary
                className="flex cursor-pointer items-center gap-2"
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#1A1A2E',
                  padding: '12px 0',
                  borderBottom: '0.5px solid #F3E8FF',
                }}
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
              <summary
                className="flex cursor-pointer items-center gap-2"
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#1A1A2E',
                  padding: '12px 0',
                  borderBottom: '0.5px solid #F3E8FF',
                }}
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