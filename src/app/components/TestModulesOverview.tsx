
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
import { modulesAPI, type ModuleType, type ModuleWithProgress, type ModulesSummary } from '../utils/modulesAPI';
import CaregiverLayout from './caregiver/CaregiverLayout';
import PatientSidebarShell from './patient/PatientSidebarShell';
import CaregiverSidebarShell from './caregiver/CaregiverSidebarShell';


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
    path: '/caregiver/modules/resources/progressive-muscle-relaxation',
  },
  {
    id: 'res_sleep_hygiene',
    title: 'Sleep Hygiene Fundamentals',
    description: 'Build a healthier sleep environment and bedtime habits.',
    icon: House,
    path: '/caregiver/modules/resources/sleep-hygiene',
  },
  {
    id: 'res_relaxation',
    title: 'Managing Worry and Racing Thoughts',
    description: 'Short calming exercises to quiet body and mind before sleep.',
    icon: Wind,
    path: '/caregiver/modules/resources/autogenic-relaxation',
  },
  {
    id: 'res_stimulus_control',
    title: 'Stimulus Control',
    description: 'Practical steps to strengthen your bed-sleep association.',
    icon: BedDouble,
    path: '/caregiver/modules/resources/stimulus-control',
  },
  {
    id: 'res_activities_interfer_sleep',
    title: 'Activities That Interfere with Sleep',
    description: 'Identify daily habits that can delay or disturb sleep.',
    icon: AlertTriangle,
    path: '/caregiver/modules/resources/activities-that-interfere-with-sleep',
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
      {
        label: 'Alzheimer’s and Dementia Support partner Support',
        url: 'https://www.alz.org/help-support/caregiving'
      },
      {
        label: 'Resources for early-stage caregiving',
        url: 'https://www.alz.org/help-support/caregiving/stages-behaviors/early-stage'
      },
      {
        label: 'Resources for support partner health',
        url: 'https://www.alz.org/help-support/caregiving/caregiver-health'
      },
      {
        label: 'Local chapter resources',
        url: 'https://www.alz.org/local_resources/find_your_local_chapter'
      },
      {
        label: 'Community Resource Finder',
        url: 'https://www.communityresourcefinder.org/?_gl=1*1973rru*_ga*MTcwNjU0MDEyLjE3Njg4NzUwMzA.*_ga_9JTEWVX24V*czE3NzA0MzIxNDQkbzgkZzAkdDE3NzA0MzIxNDQkajYwJGwwJGgw'
      },
      {
        label: 'Online interactive tools – ALZNavigator',
        url: 'https://www.alz.org/help-support/resources/alznavigator'
      },
      {
        label: 'Care Team Calendar',
        url: 'https://www.alz.org/help-support/caregiving/care-options/care-team-calendar'
      }
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



// const sleepSummary = await modulesAPI.getModules('sleep');
// sleepSummary.summary.overallPercent
// sleepSummary.summary.completedCount
// sleepSummary.summary.inProgressCount
// sleepSummary.summary.notStartedCount
// sleepSummary.summary.watchedVideos
// sleepSummary.summary.totalVideos

// const dietSummary = await modulesAPI.getModules('diet');
// dietSummary.summary.overallPercent
// dietSummary.summary.completedCount
// dietSummary.summary.inProgressCount
// dietSummary.summary.notStartedCount
// dietSummary.summary.watchedVideos
// dietSummary.summary.totalVideos

// const heartSummary = await modulesAPI.getModules('heart');
// heartSummary.summary.overallPercent
// heartSummary.summary.completedCount
// heartSummary.summary.inProgressCount
// heartSummary.summary.notStartedCount
// heartSummary.summary.watchedVideos
// heartSummary.summary.totalVideos

// const cogengageSummary = await modulesAPI.getModules('cogengage');
// cogengageSummary.summary.overallPercent
// cogengageSummary.summary.completedCount
// cogengageSummary.summary.inProgressCount
// cogengageSummary.summary.notStartedCount
// cogengageSummary.summary.watchedVideos
// cogengageSummary.summary.totalVideos

// const hvsSummary = await modulesAPI.getModules('hvs');
// hvsSummary.summary.overallPercent
// hvsSummary.summary.completedCount
// hvsSummary.summary.inProgressCount
// hvsSummary.summary.notStartedCount
// hvsSummary.summary.watchedVideos
// hvsSummary.summary.totalVideos





export default function CaregiverModulesOverview() {

  const [sleepSummary, setSleepSummary] = useState<ModulesSummary>(emptySummary);
const [dietSummary, setDietSummary] = useState<ModulesSummary>(emptySummary);
const [heartSummary, setHeartSummary] = useState<ModulesSummary>(emptySummary);
const [cogengageSummary, setCogengageSummary] = useState<ModulesSummary>(emptySummary);
const [hvsSummary, setHvsSummary] = useState<ModulesSummary>(emptySummary);

useEffect(() => {
  let mounted = true;

  async function loadSummaries() {
    try {
      const [sleep, diet, heart, cogengage, hvs] = await Promise.all([
        modulesAPI.getModules('sleep'),
        modulesAPI.getModules('diet'),
        modulesAPI.getModules('heart'),
        modulesAPI.getModules('cogengage'),
        modulesAPI.getModules('hvs'),
      ]);

      if (!mounted) return;

      setSleepSummary(sleep.summary);
      setDietSummary(diet.summary);
      setHeartSummary(heart.summary);
      setCogengageSummary(cogengage.summary);
      setHvsSummary(hvs.summary);
    } catch (error) {
      console.error('Error loading module summaries:', error);
    }
  }

  void loadSummaries();

  return () => {
    mounted = false;
  };
}, []);



  const [dietLocked, setDietLocked] = useState(true);
  const [heartLocked, setHeartLocked] = useState(true);
  const [cogengageLocked, setCogengageLocked] = useState(true);
  const [hvsLocked, setHvsLocked] = useState(true);

  const [heartDaysLeft, setHeartDaysLeft] = useState(0);
  const [dietDaysLeft, setDietDaysLeft] = useState(0);
  const [cogengageDaysLeft, setCogengageDaysLeft] = useState(0);
  const [hvsDaysLeft, setHvsDaysLeft] = useState(0);



  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const SidebarShell = role === 'patient' ? PatientSidebarShell : CaregiverSidebarShell;
  const modulesPath = role === "patient" ? "/dietmodules" : "/caregiver/dietmodules";
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
        navigate('/caregiver/messages');
        break;
    }
  };


  useEffect(() => {
    async function checkModuleLocks() {
      try {
        const sleepStartedAt = await modulesAPI.getFirstStartedAt('sleep');
        const elapsed = sleepStartedAt -  Date.now();
          if (sleepStartedAt) {
            const fourWeeks = 28 * 24 * 60 * 60 * 1000;
            const unlocked = Date.now() >= sleepStartedAt + fourWeeks;
            const heartRemaining = Math.max(0, fourWeeks - elapsed)
            setHeartDaysLeft(Math.ceil(heartRemaining / (24 * 60 * 60 * 1000)))

            setHeartLocked(!unlocked);
          } else {
            setHeartLocked(true);
          }

          if (sleepStartedAt) {
            const fiveWeeks = 35 * 24 * 60 * 60 * 1000;
            const unlocked = Date.now() >= sleepStartedAt + fiveWeeks;
            const dietRemaining = Math.max(0, fiveWeeks - elapsed)
            setDietDaysLeft(Math.ceil(dietRemaining / (24 * 60 * 60 * 1000)))

            setDietLocked(!unlocked);
          } else {
            setDietLocked(true);
          }

          if (sleepStartedAt) {
            const sixWeeks = 42 * 24 * 60 * 60 * 1000;
            const unlocked = Date.now() >= sleepStartedAt + sixWeeks;
            const cogengageRemaining = Math.max(0, sixWeeks - elapsed)
            setCogengageDaysLeft(Math.ceil(cogengageRemaining / (24 * 60 * 60 * 1000)))

            setCogengageLocked(!unlocked);
          } else {
            setCogengageLocked(true);
          }

          if (sleepStartedAt) {
            const sevenWeeks = 49 * 24 * 60 * 60 * 1000;
            const unlocked = Date.now() >= sleepStartedAt + sevenWeeks;
            const hvsRemaining = Math.max(0, sevenWeeks - elapsed)
            setHvsDaysLeft(Math.ceil(hvsRemaining / (24 * 60 * 60 * 1000)))

            setHvsLocked(!unlocked);
          } else {
            setHvsLocked(true);
          }
        } catch (error) {
          console.error('Error')
    }
  }

    checkModuleLocks();
    
  }, []);



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
    return modules
      //.map ((weeKey) => modules.find((item) => item.weekKey === weekKey))
  }, [modules]);

  return (
    <SidebarShell>
    <div className="min-h-screen px-6 py-8 lg:px-10" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="mx-auto max-w-6xl">
          <header className="mb-6">
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A2E' }}>Weekly Modules</h1>
          </header>
  
            {/* <section className="mb-7 rounded-[12px] bg-white p-6" style={{ border: '0.5px solid #E9D5FF' }}>
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
            </section> */}
  
            <section className="mb-10">
              <h2 className="mb-4" style={{ fontSize: '20px', fontWeight: 600, color: '#1A1A2E' }}>
                Intervention Modules
              </h2>
              <div className="grid grid-cols-1 gap-[14px] lg:grid-cols-2">
                  <div 
                  className="h-full rounded-[12px] bg-white p-4 flex flex-col" 
                  style={{ border: '0.5px solid #E9D5FF' }}>
                    <button
                     onClick={() => navigate(role === 'caregiver' ? '/caregiver/modules' : '/sleep-modules')}
                          className="rounded-[8px] px-3 py-1.5"
                          style={{
                            border: '0.5px solid #C4B5FD',
                            color: '#7200CA',
                            backgroundColor: 'white',
                            fontSize: '20px',
                            fontWeight: 600,
                          }}
                        >
                          Sleep
                        
                         <section className="mb-7 rounded-[12px] bg-white p-6" style={{ border: '0.5px solid #E9D5FF' }}>
                          <div className="mb-4 flex items-end justify-between">
                            <div>
                              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1A1A2E' }}>Overall Progress</h2>
                              <p style={{ fontSize: '14px', color: '#858993' }}>
                                {sleepSummary.summary.watchedVideos} of {sleepSummary.summary.totalVideos} queue videos completed
                              </p>
                            </div>
                            <div style={{ fontSize: '22px', fontWeight: 700, color: '#7200CA' }}>{sleepSummary.summary.overallPercent}%</div>
                          </div>

                          <div className="h-[6px] overflow-hidden rounded" style={{ backgroundColor: '#F3E8FF' }}>
                            <div
                              className="h-full transition-all duration-300"
                              style={{
                                width: `${sleepSummary.summary.overallPercent}%`,
                                background: 'linear-gradient(90deg, #6D28D9 0%, #5B21B6 100%)',
                              }}
                            />
                          </div>
                        </section>
                        </button>
                  </div>
               </div>
            </section>

            <section className="mb-10">
              <h2 className="mb-4" style={{ fontSize: '20px', fontWeight: 600, color: '#1A1A2E' }}>
                Wellness Modules
              </h2>
              <div className="grid grid-cols-1 gap-[14px] lg:grid-cols-2">

                  <div 
                  className="h-full rounded-[12px] bg-white p-4 flex flex-col" 
                  style={{ border: '0.5px solid #E9D5FF' }}>
                    <button
                    disabled={heartLocked}
                     onClick={() => navigate(role === 'caregiver' ? '/caregiver/heart-modules' : '/heart-modules')}
                          className="rounded-[8px] px-3 py-1.5"
                          style={{
                            border: '0.5px solid #C4B5FD',
                            color: '#7200CA',
                            backgroundColor: heartLocked ? '#c2bfd0' : 'white',
                            fontSize: '20px',
                            fontWeight: 600,
                            cursor: heartLocked ? 'not-allowed' : 'pointer',
                            opacity: heartLocked ? 0.5 : 1,
                          }}
                        >
                          Heart Health
                        
                        <section className="mb-7 rounded-[12px] bg-white p-6" style={{ border: '0.5px solid #E9D5FF' }}>
                          <div className="mb-4 flex items-end justify-between">
                            <div>
                              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1A1A2E' }}>Overall Progress</h2>
                              <p style={{ fontSize: '14px', color: '#858993' }}>
                                {heartSummary.summary.watchedVideos} of {heartSummary.summary.totalVideos} queue videos completed
                              </p>
                            </div>
                            <div style={{ fontSize: '22px', fontWeight: 700, color: '#7200CA' }}>{heartSummary.summary.overallPercent}%</div>
                          </div>

                          <div className="h-[6px] overflow-hidden rounded" style={{ backgroundColor: '#F3E8FF' }}>
                            <div
                              className="h-full transition-all duration-300"
                              style={{
                                width: `${heartSummary.summary.overallPercent}%`,
                                background: 'linear-gradient(90deg, #6D28D9 0%, #5B21B6 100%)',
                              }}
                            />
                          </div>
                          {heartLocked && (
                            <p className="mt-2 text-sm text-gray-500">
                              Unlocks in {heartDaysLeft} {heartDaysLeft === 1 ? 
                              'day' : 'days'}
                            </p>
                          )}
                        </section>
                        </button>
                   </div>

                  <div 
                  className="h-full rounded-[12px] bg-white p-4 flex flex-col" 
                  style={{ border: '0.5px solid #E9D5FF' }}>
                    <button
                    disabled={dietLocked}
                     onClick={() => navigate(role === 'caregiver' ? '/caregiver/dietmodules' : '/dietmodules')}
                          className="rounded-[8px] px-3 py-1.5"
                          style={{
                            border: '0.5px solid #C4B5FD',
                            color: '#7200CA',
                            backgroundColor: dietLocked ? '#c2bfd0' : 'white',
                            fontSize: '20px',
                            fontWeight: 600,
                            cursor: dietLocked ? 'not-allowed' : 'pointer',
                            opacity: dietLocked ? 0.5 : 1,
                          }}
                        >
                          Diet
                        
                        <section className="mb-7 rounded-[12px] bg-white p-6" style={{ border: '0.5px solid #E9D5FF' }}>
                          <div className="mb-4 flex items-end justify-between">
                            <div>
                              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1A1A2E' }}>Overall Progress</h2>
                              <p style={{ fontSize: '14px', color: '#858993' }}>
                                {dietSummary.summary.watchedVideos} of {dietSummary.summary.totalVideos} queue videos completed
                              </p>
                            </div>
                            <div style={{ fontSize: '22px', fontWeight: 700, color: '#7200CA' }}>{dietSummary.summary.overallPercent}%</div>
                          </div>

                          <div className="h-[6px] overflow-hidden rounded" style={{ backgroundColor: '#F3E8FF' }}>
                            <div
                              className="h-full transition-all duration-300"
                              style={{
                                width: `${dietSummary.summary.overallPercent}%`,
                                background: 'linear-gradient(90deg, #6D28D9 0%, #5B21B6 100%)',
                              }}
                            />
                          </div>
                          {dietLocked && (
                            <p className="mt-2 text-sm text-gray-500">
                              Unlocks in {dietDaysLeft} {dietDaysLeft === 1 ? 
                              'day' : 'days'}
                            </p>
                          )}
                        </section>
                        </button>
                  </div>

                  <div 
                  className="h-full rounded-[12px] bg-white p-4 flex flex-col" 
                  style={{ border: '0.5px solid #e9d5ff' }}>
                    <button
                    disabled={cogengageLocked}
                     onClick={() => navigate(role === 'caregiver' ? '/caregiver/cogengagemodules' : '/cogengagemodules')}
                          className="rounded-[8px] px-3 py-1.5"
                          style={{
                            border: '0.5px solid #C4B5FD',
                            color: '#7200CA',
                            backgroundColor: cogengageLocked ? '#c2bfd0' : 'white',
                            fontSize: '20px',
                            fontWeight: 600,
                            cursor: cogengageLocked ? 'not-allowed' : 'pointer',
                            opacity: cogengageLocked ? 0.5 : 1,
                          }}
                        >
                          Cognitive Engagement
                          <section className="mb-7 rounded-[12px] bg-white p-6" style={{ border: '0.5px solid #E9D5FF' }}>
                          <div className="mb-4 flex items-end justify-between">
                            <div>
                              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1A1A2E' }}>Overall Progress</h2>
                              <p style={{ fontSize: '14px', color: '#858993' }}>
                                {cogengageSummary.summary.watchedVideos} of {cogengageSummary.summary.totalVideos} queue videos completed
                              </p>
                            </div>
                            <div style={{ fontSize: '22px', fontWeight: 700, color: '#7200CA' }}>{cogengageSummary.summary.overallPercent}%</div>
                          </div>

                          <div className="h-[6px] overflow-hidden rounded" style={{ backgroundColor: '#F3E8FF' }}>
                            <div
                              className="h-full transition-all duration-300"
                              style={{
                                width: `${cogengageSummary.summary.overallPercent}%`,
                                background: 'linear-gradient(90deg, #6D28D9 0%, #5B21B6 100%)',
                              }}
                            />
                          </div>
                          {cogengageLocked && (
                            <p className="mt-2 text-sm text-gray-500">
                              Unlocks in {cogengageDaysLeft} {cogengageDaysLeft === 1 ? 
                              'day' : 'days'}
                            </p>
                          )}
                        </section>
                        </button>
                   </div>

                   <div 
                  className="h-full rounded-[12px] bg-white p-4 flex flex-col" 
                  style={{ border: '0.5px solid #E9D5FF' }}>
                    <button
                    disabled={hvsLocked}
                     onClick={() =>  navigate(role === 'caregiver' ? '/caregiver/hvs-modules' : '/hvs-modules')}
                          className="rounded-[8px] px-3 py-1.5"
                          style={{
                            border: '0.5px solid #C4B5FD',
                            color: '#7200CA',
                            backgroundColor: hvsLocked ? '#c2bfd0' : 'white',
                            fontSize: '20px',
                            fontWeight: 600,
                            cursor: hvsLocked ? 'not-allowed' : 'pointer',
                            opacity: hvsLocked ? 0.5 : 1,
                          }}
                        >
                          Hearing, Vision, and Staying Connected
                          <section className="mb-7 rounded-[12px] bg-white p-6" style={{ border: '0.5px solid #E9D5FF' }}>
                          <div className="mb-4 flex items-end justify-between">
                            <div>
                              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1A1A2E' }}>Overall Progress</h2>
                              <p style={{ fontSize: '14px', color: '#858993' }}>
                                {hvsSummary.summary.watchedVideos} of {hvsSummary.summary.totalVideos} queue videos completed
                              </p>
                            </div>
                            <div style={{ fontSize: '22px', fontWeight: 700, color: '#7200CA' }}>{hvsSummary.summary.overallPercent}%</div>
                          </div>

                          <div className="h-[6px] overflow-hidden rounded" style={{ backgroundColor: '#F3E8FF' }}>
                            <div
                              className="h-full transition-all duration-300"
                              style={{
                                width: `${hvsSummary.summary.overallPercent}%`,
                                background: 'linear-gradient(90deg, #6D28D9 0%, #5B21B6 100%)',
                              }}
                            />
                          </div>
                          {hvsLocked && (
                            <p className="mt-2 text-sm text-gray-500">
                              Unlocks in {hvsDaysLeft} {hvsDaysLeft === 1 ? 
                              'day' : 'days'}
                            </p>
                          )}
                        </section>
                        </button>
                   </div>

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
                            navigate('/caregiver/reminders');
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
      </SidebarShell>
    );
  }
  
