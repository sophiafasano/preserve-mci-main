import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
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
} from 'lucide-react';
import { modulesAPI, type ModuleWithProgress, type ModulesSummary } from '../utils/modulesAPI';
import { moduleWeekOrder, weekSlugFromKey } from '../data/moduleData';

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
    title: 'Progressive Muscle Relaxation',
    description: 'Guided progressive relaxation exercises to ease tension before sleep.',
    icon: Dumbbell,
    path: '/modules/resources/progressive-muscle-relaxation',
  },
  {
    id: 'res_sleep_hygiene',
    title: 'Sleep Hygiene',
    description: 'Build a healthier sleep environment and bedtime habits.',
    icon: House,
    path: '/modules/resources/sleep-hygiene',
  },
  {
    id: 'res_relaxation',
    title: 'Autogenic Relaxation',
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
    <div className="min-h-screen px-6 py-8 lg:px-10" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="mx-auto max-w-6xl">
          <header className="mb-6 flex items-center justify-between">
            <button
              onClick={() => navigate('/patient/dashboard')}
              className="inline-flex items-center gap-1.5 hover:opacity-90"
              style={{ color: '#7200CA', fontSize: '13px', fontWeight: 500 }}
            >
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </button>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A2E' }}>Weekly Sleep Modules</h1>
          </header>

          <section className="mb-7 rounded-[12px] bg-white p-6" style={{ border: '0.5px solid #E9D5FF' }}>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A2E' }}>Overall Progress</h2>
                <p style={{ fontSize: '13px', color: '#9CA3AF' }}>
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
                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Completed</p>
              </div>
              <div style={{ borderLeft: '0.5px solid #E9D5FF', borderRight: '0.5px solid #E9D5FF' }}>
                <p style={{ fontSize: '22px', color: '#1A1A2E', fontWeight: 700 }}>{summary.inProgressCount}</p>
                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>In Progress</p>
              </div>
              <div>
                <p style={{ fontSize: '22px', color: '#1A1A2E', fontWeight: 700 }}>{summary.notStartedCount}</p>
                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Not Started</p>
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
                          <p style={{ fontSize: '12px', color: '#7200CA', fontWeight: 500 }}>
                            Complete Week {module.weekNumber - 1} to unlock
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <p
                          style={{
                            fontSize: '11px',
                            color: '#9CA3AF',
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
                          style={{ fontSize: '13px', color: '#9CA3AF', lineHeight: 1.35, minHeight: '35px' }}
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

                    <div className="mb-4 flex items-center gap-4" style={{ fontSize: '12px', color: '#9CA3AF' }}>
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
                      <p className="mb-3" style={{ fontSize: '12px', color: '#9CA3AF' }}>
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
                              fontSize: '14px',
                            }
                          : {
                              color: 'white',
                              border: 'none',
                              fontWeight: 600,
                              fontSize: '14px',
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
      </div>
    </div>
  );
}
