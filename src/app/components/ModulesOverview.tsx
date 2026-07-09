import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useReminders } from '../hooks/useReminders';
import { useSleepLogs } from '../hooks/useSleepLogs';
import {
  AlertTriangle,
  ArrowLeft,
  BedDouble,
  BookOpen,
  CheckCircle2,
  Clock3,
  Dumbbell,
  House,
  Lock,
  Moon,
  Play,
  Wind,
  MessageCircle,
  ChevronRight,
  Clock,
  ClipboardList,
  CalendarCheck
} from 'lucide-react';
import { modulesAPI, type ModuleWithProgress, type ModulesSummary } from '../utils/modulesAPI';
import { moduleWeekOrder, weekSlugFromKey } from '../data/moduleData';
import PatientSidebarShell from './patient/PatientSidebarShell';

type ResourceLink = {
  label: string;
  url: string;
};

type StaticResource = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  path?: string;
  links?: ResourceLink[];
};

const staticResources: StaticResource[] = [
  {
    id: 'res_progressive_muscle_relaxation',
    title: 'Relaxation and Wind-Down Techniques',
    description: 'Guided progressive relaxation exercises to ease tension before sleep.',
    icon: Dumbbell,
    path: '/modules/resources/progressive-muscle-relaxation',
  },
  {
    id: 'res_sleep_hygiene',
    title: 'Sleep Hygiene Fundamentals',
    description: 'Build a healthier sleep environment and bedtime habits.',
    icon: House,
    path: '/modules/resources/sleep-hygiene',
  },
  {
    id: 'res_relaxation',
    title: 'Managing Worry and Racing Thoughts',
    description: 'Short calming exercises to quiet body and mind before sleep.',
    icon: Wind,
    path: '/modules/resources/autogenic-relaxation',
  },
  {
    id: 'res_stimulus_control',
    title: 'Stimulus Control',
    description: 'Practical steps to strengthen your bed-sleep association.',
    icon: BedDouble,
    path: '/modules/resources/stimulus-control',
  },
  {
    id: 'res_activities_interfer_sleep',
    title: 'Activities That Interfere with Sleep',
    description: 'Identify daily habits that can delay or disturb sleep.',
    icon: AlertTriangle,
    path: '/modules/resources/activities-that-interfere-with-sleep',
  },
  {
    id: 'res_community_resources',
    title: 'Community Resources',
    description: 'Find support resources and educational materials in your community.',
    icon: BookOpen,
    links: [
      {
        label: 'AASM resources for sleep, insomnia, and apnea (Sleep education for patients)',
        url: 'https://sleepeducation.org/patients/',
      },
      {
        label: 'Alzheimer\'s Association resources (Early stages of cognitive impairment)',
        url: 'https://www.alz.org/alzheimers-dementia/stages',
      },
    ],
  },
];

const emptySummary: ModulesSummary = {
  completedCount: 0,
  inProgressCount: 0,
  notStartedCount: 4,
  overallPercent: 0,
  watchedVideos: 0,
  totalVideos: 0,
};

export default function ModulesOverview() {
  const navigate = useNavigate();
  const [modules, setModules] = useState<ModuleWithProgress[]>([]);
  const [summary, setSummary] = useState<ModulesSummary>(emptySummary);
  const [expandedResourceIds, setExpandedResourceIds] = useState<Record<string, boolean>>({});
  const quickActions = [
    { label: "Log Last Night's Sleep", icon: Moon, action: 'log-sleep' },
    { label: 'View Sleep Tips', icon: BookOpen, action: 'sleep-tips' },
    { label: 'Message Care Team', icon: MessageCircle, action: 'messages' },
  ];

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'log-sleep':
        window.dispatchEvent(new Event('open-sleep-log'));
        break;
      case 'sleep-tips':
        window.dispatchEvent(new Event('open-sleep-tips'));
        break;
      case 'messages':
        navigate('/patient/messages');
        break;
    }
  };

  const { activeCount } = useReminders();
  const { logs: sleepLogs } = useSleepLogs();

  const upcomingItems = useMemo(() => {
    const items: { type: string; title: string; date: string; icon: typeof CalendarCheck }[] = [];
    const today = new Date().toISOString().split('T')[0];
    const hasLoggedToday = sleepLogs.some((l) => l.date?.split('T')[0] === today);
    if (!hasLoggedToday) {
      items.push({ type: 'sleep-log', title: "Log last night's sleep", date: 'Today', icon: Clock });
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

  const toggleResourceLinks = (resourceId: string) => {
    setExpandedResourceIds((prev) => ({
      ...prev,
      [resourceId]: !prev[resourceId],
    }));
  };

  useEffect(() => {
    let mounted = true;

    async function loadModules() {
      try {
        const response = await modulesAPI.getModules();
        if (!mounted) return;
        setModules(response.modules);
        setSummary(response.summary);
      } catch {
        // Leave default empty state; ProtectedRoute prevents reaching here unauthenticated.
      }
    }

    void loadModules();

    return () => {
      mounted = false;
    };
  }, []);

  const modulesByKey = useMemo(() => {
    return moduleWeekOrder
      .map((weekKey) => modules.find((item) => item.weekKey === weekKey))
      .filter((item): item is ModuleWithProgress => Boolean(item));
  }, [modules]);

return (
  <PatientSidebarShell>
  <div className="min-h-screen px-6 py-8 lg:px-10" style={{ backgroundColor: '#F9FAFB' }}>
    <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A2E' }}>Weekly Sleep Modules</h1>
        </header>

          <section className="mb-7 rounded-[12px] bg-white p-6" style={{ border: '0.5px solid #E9D5FF' }}>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1A1A2E' }}>Overall Progress</h2>
                <p style={{ fontSize: '14px', color: '#858993' }}>
                  {summary.watchedVideos} of {summary.totalVideos} queue videos completed
                </p>
              </div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#7200CA' }}>{summary.overallPercent}%</div>
            </div>

            <div className="h-[6px] overflow-hidden rounded" style={{ backgroundColor: '#F3E8FF' }}>
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${summary.overallPercent}%`,
                  background: 'linear-gradient(90deg, #6D28D9 0%, #5B21B6 100%)',
                }}
              />
            </div>

            <div className="mt-5 grid grid-cols-3 text-center">
              <div>
                <p style={{ fontSize: '22px', color: '#1A1A2E', fontWeight: 700 }}>{summary.completedCount}</p>
                <p style={{ fontSize: '16px', color: '#858993' }}>Completed</p>
              </div>
              <div style={{ borderLeft: '0.5px solid #E9D5FF', borderRight: '0.5px solid #E9D5FF' }}>
                <p style={{ fontSize: '22px', color: '#1A1A2E', fontWeight: 700 }}>{summary.inProgressCount}</p>
                <p style={{ fontSize: '16px', color: '#858993' }}>In Progress</p>
              </div>
              <div>
                <p style={{ fontSize: '22px', color: '#1A1A2E', fontWeight: 700 }}>{summary.notStartedCount}</p>
                <p style={{ fontSize: '16px', color: '#858993' }}>Not Started</p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-4" style={{ fontSize: '18px', fontWeight: 600, color: '#1A1A2E' }}>
              Weekly Modules
            </h2>
            <div className="grid grid-cols-1 gap-[14px] lg:grid-cols-2">
              {modulesByKey.map((module) => {
                const watchedCount = module.queue.filter((video) => video.progress.watched).length;
                const isInProgress = watchedCount > 0 && !module.completed;

                return (
                  <div
                    key={module.weekKey}
                    className="relative rounded-[12px] bg-white p-5"
                    style={{ border: '0.5px solid #E9D5FF' }}
                    title={
                      module.unlocked
                        ? ''
                        : `Complete Week ${module.weekNumber - 1} to unlock`
                    }
                  >
                    {!module.unlocked && (
                      <div
                        className="absolute inset-0 z-10 rounded-[12px]"
                        style={{ background: 'rgba(255,255,255,0.72)' }}
                      >
                        <div className="absolute right-4 top-4 rounded-full bg-white p-2" style={{ border: '0.5px solid #E9D5FF' }}>
                          <Lock size={16} color="#7200CA" />
                        </div>
                        <div className="absolute bottom-3 left-4">
                          <p style={{ fontSize: '16px', color: '#7200CA', fontWeight: 500 }}>
                            {module.daysUntilUnlock !== null && module.daysUntilUnlock > 0
                              ? `Available in ${module.daysUntilUnlock} day${module.daysUntilUnlock !== 1 ? 's' : ''}`
                              : `Complete Week ${module.weekNumber - 1} to unlock`}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <p
                          style={{
                            fontSize: '12px',
                            color: '#858993',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                          }}
                        >
                          Week {module.weekNumber} of 4
                        </p>
                        <h3
                          className="line-clamp-2"
                          style={{ fontSize: '16px', color: '#1A1A2E', fontWeight: 600, lineHeight: 1.35, minHeight: '43px' }}
                        >
                          {module.title}
                        </h3>
                        <p
                          className="line-clamp-2"
                          style={{ fontSize: '14px', color: '#858993', lineHeight: 1.35, minHeight: '35px' }}
                        >
                          {module.subtitle}
                        </p>
                        {module.completed && (
                          <span
                            className="mt-2 inline-flex rounded-full px-2 py-0.5"
                            style={{ backgroundColor: '#DCFCE7', color: '#166534', fontSize: '11px', fontWeight: 500 }}
                          >
                            Completed
                          </span>
                        )}
                      </div>
                      <div className="rounded-[10px] p-2.5" style={{ backgroundColor: '#F3E8FF' }}>
                        {module.completed ? (
                          <CheckCircle2 size={20} color="#7200CA" strokeWidth={1.5} />
                        ) : (
                          <BookOpen size={20} color="#7200CA" strokeWidth={1.5} />
                        )}
                      </div>
                    </div>

                    <div className="mb-4 flex items-center gap-4" style={{ fontSize: '14px', color: '#858993' }}>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 size={13} color="#C4B5FD" />
                        {module.duration}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Play size={13} color="#C4B5FD" />
                        {module.queue.length} videos
                      </span>
                    </div>

                    <div className="mb-4 h-[4px] overflow-hidden rounded" style={{ backgroundColor: '#F3E8FF' }}>
                      <div
                        className="h-full"
                        style={{
                          width: `${module.queue.length ? Math.round((watchedCount / module.queue.length) * 100) : 0}%`,
                          background: 'linear-gradient(90deg, #6D28D9 0%, #5B21B6 100%)',
                        }}
                      />
                    </div>

                    {isInProgress && (
                      <p className="mb-3" style={{ fontSize: '14px', color: '#858993' }}>
                        {watchedCount} of {module.queue.length} videos completed
                      </p>
                    )}

                    <button
                      disabled={!module.unlocked}
                      onClick={() => navigate(`/modules/${weekSlugFromKey(module.weekKey)}`)}
                      className="w-full rounded-[10px] py-2.5"
                      style={
                        module.completed
                          ? {
                              backgroundColor: 'white',
                              color: '#7200CA',
                              border: '1px solid #7200CA',
                              fontWeight: 500,
                              fontSize: '16px',
                            }
                          : {
                              color: 'white',
                              border: 'none',
                              fontWeight: 600,
                              fontSize: '16px',
                              background: 'linear-gradient(90deg, #6D28D9 0%, #5B21B6 100%)',
                              opacity: module.unlocked ? 1 : 0.55,
                            }
                      }
                    >
                      {module.completed ? 'Review Module' : isInProgress ? 'Continue Module' : 'Start Module'}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="mb-1" style={{ fontSize: '18px', fontWeight: 600, color: '#1A1A2E' }}>
              Sleep Resources
            </h2>
            <p className="mb-4" style={{ fontSize: '14px', color: '#6B7280' }}>
              Watchable reference resources from your weekly program.
            </p>
            <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2 lg:grid-cols-3">
              {staticResources.map((resource) => {
                const Icon = resource.icon;
                return (
                  <div
                    key={resource.id}
                    className="h-full rounded-[12px] bg-white p-4 flex flex-col"
                    style={{ border: '0.5px solid #E9D5FF' }}
                  >
                    <div className="mb-3 inline-flex self-start rounded-[10px] p-2.5" style={{ backgroundColor: '#F3E8FF' }}>
                      <Icon size={20} color="#7200CA" />
                    </div>
                    <h3 style={{ fontSize: '14px', color: '#1A1A2E', fontWeight: 600 }}>{resource.title}</h3>
                    <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6 }}>{resource.description}</p>
                    <div className="mt-auto pt-3">
                    {resource.path && (
                      <button
                        onClick={() => navigate(resource.path)}
                        className="rounded-[8px] px-3 py-1.5"
                        style={{
                          border: '0.5px solid #C4B5FD',
                          color: '#7200CA',
                          backgroundColor: 'white',
                          fontSize: '12px',
                          fontWeight: 500,
                        }}
                      >
                        Open Resource
                      </button>
                    )}

                    {resource.links && (
                      <div>
                        <button
                          onClick={() => toggleResourceLinks(resource.id)}
                          className="rounded-[8px] px-3 py-1.5"
                          style={{
                            border: '0.5px solid #C4B5FD',
                            color: '#7200CA',
                            backgroundColor: 'white',
                            fontSize: '12px',
                            fontWeight: 500,
                          }}
                        >
                          View Resources
                        </button>

                        {expandedResourceIds[resource.id] && (
                          <div
                            className="mt-3 rounded-[10px] px-3 py-2"
                            style={{ border: '0.5px solid #E9D5FF', backgroundColor: '#F9FAFB' }}
                          >
                            <ul className="space-y-2">
                              {resource.links.map((link) => (
                                <li key={link.url}>
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline hover:opacity-90"
                                    style={{ fontSize: '13px', color: '#7200CA', fontWeight: 500 }}
                                  >
                                    {link.label}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          {/* Quick Actions + Upcoming */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-[12px] p-5" style={{ border: '0.5px solid #E9D5FF' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 500, color: '#1A1A2E', marginBottom: '12px' }}>
                Quick Actions
              </h2>
              <div>
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.action)}
                      className="w-full flex items-center justify-between py-4 transition-all duration-200 hover:bg-[#FAF5FF] hover:-translate-y-px"
                      style={{
                        borderRadius: '10px',
                        borderBottom: index !== quickActions.length - 1 ? '0.5px solid #F3F4F6' : 'none',
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: '#F3E9FB' }}>
                          <Icon size={18} strokeWidth={1.5} color="#7200CA" />
                        </div>
                        <span style={{ fontSize: '14px', color: '#1A1A2E', fontWeight: 400 }}>{action.label}</span>
                      </div>
                      <ChevronRight size={16} strokeWidth={1.5} color="#C4B5FD" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Upcoming */}
            <div className="bg-white rounded-[12px] p-5" style={{ border: '0.5px solid #E9D5FF' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 500, color: '#1A1A2E', marginBottom: '12px' }}>
                Upcoming
              </h2>
              <div>
                {upcomingItems.map((item, index) => {
                  const Icon = item.icon;
                  const isToday = item.date.toLowerCase().includes('today');
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (item.type === 'sleep-log') {
                          window.dispatchEvent(new Event('open-sleep-log'));
                        } else if (item.type === 'reminder') {
                          navigate('/patient/reminders');
                        }
                      }}
                      className="flex items-start space-x-3 py-4 w-full text-left hover:bg-[#F9F7FF] rounded-xl transition-colors"
                      style={{
                        borderBottom: index !== upcomingItems.length - 1 ? '0.5px solid #F3F4F6' : 'none',
                        cursor: item.type === 'reminder' ? 'pointer' : 'default',
                      }}
                    >
                      <div className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F3E9FB' }}>
                        <Icon size={18} strokeWidth={1.5} color="#7200CA" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: '14px', color: '#1A1A2E', marginBottom: '5px', fontWeight: 500 }}>{item.title}</p>
                        <div className="flex items-center gap-2">
                          <p style={{ fontSize: '12px', color: '#9CA3AF' }}>{item.date}</p>
                          {item.date && (
                            <span style={{
                              fontSize: '11px', fontWeight: 500, borderRadius: '20px',
                              padding: '3px 10px',
                              backgroundColor: isToday ? '#EDE9FE' : '#F3E8FF',
                              color: isToday ? '#4C1D95' : '#6B21A8',
                            }}>
                              {isToday ? 'Today' : 'Due soon'}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

      </div>
    </div>
    </PatientSidebarShell>
  );
}
