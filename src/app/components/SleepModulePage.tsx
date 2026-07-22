import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  Captions,
  Check,
  CheckCircle,
  Lock,
  Maximize2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import PatientSidebarShell from './patient/PatientSidebarShell';
import {
  moduleWeekOrder,
  moduleData,
  toWeekKeyFromSlug,
  weekNumberFromKey,
  weekSlugFromKey,
  type ModuleWeekKey,
} from '../data/moduleData';
import { modulesAPI, type ModuleWithProgress } from '../utils/modulesAPI';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/useAuth'; 

interface PlayerSelection {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  captionUrl?: string;
  kind: 'queue' | 'resource';
}

export default function SleepModulePage() {
  const navigate = useNavigate();
  const { moduleId } = useParams();

  const weekKey = useMemo(() => {
    if (!moduleId) return null;
    return toWeekKeyFromSlug(moduleId);
  }, [moduleId]);

  const [module, setModule] = useState<ModuleWithProgress | null>(null);
  const [activeQueueIndex, setActiveQueueIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'queue' | 'resources'>('queue');
  const [selectedResource, setSelectedResource] = useState<PlayerSelection | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);
  const [pendingNextIndex, setPendingNextIndex] = useState<number | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isPlaceholderSimulating, setIsPlaceholderSimulating] = useState(false);
  const [mockElapsedMs, setMockElapsedMs] = useState(0);
  const [mockSpeed, setMockSpeed] = useState(1);
  const [isRealPlaying, setIsRealPlaying] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [captionStatus, setCaptionStatus] = useState<'ready' | 'unavailable'>('unavailable');

  const countdownTimerRef = useRef<number | null>(null);
  const placeholderTimerRef = useRef<number | null>(null);
  const playerRef = useRef<HTMLIFrameElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoplayNextRef = useRef(false);
  const placeholderEndedRef = useRef(false);
  const mockElapsedMsRef = useRef(0);
  const [nextModuleData, setNextModuleData] = useState<any>(null);

  useEffect(() => {
    if (!moduleId) {
      navigate('/modules', { replace: true });
      return;
    }

    if (!toWeekKeyFromSlug(moduleId)) {
      navigate('/modules', { replace: true });
    }
  }, [moduleId, navigate]);

  useEffect(() => {
    if (!weekKey) return;
    let mounted = true;

    // Route changes reuse this component instance, so clear transient UI state.
    setShowCompletionModal(false);
    setSelectedResource(null);
    setActiveTab('queue');
    stopCountdown();

    async function load() {
      try {
        const response = await modulesAPI.getModuleWeek(weekKey);
        if (!mounted) return;

        if (!response.module.unlocked) {
          navigate('/modules');
          return;
        }

        setModule(response.module);
        const firstUnwatchedIndex = response.module.queue.findIndex((item) => !item.progress.watched);
        setActiveQueueIndex(firstUnwatchedIndex >= 0 ? firstUnwatchedIndex : Math.max(response.module.queue.length - 1, 0));
      } catch {
        if (mounted) navigate('/modules');
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [navigate, weekKey]);

  const { user } = useAuth();
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

  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        window.clearInterval(countdownTimerRef.current);
      }
      if (placeholderTimerRef.current) {
        window.clearTimeout(placeholderTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Reset playback UI for each newly selected video.
    mockElapsedMsRef.current = 0;
    setMockElapsedMs(0);
    setIsPlaceholderSimulating(false);
    setIsRealPlaying(false);
    placeholderEndedRef.current = false;
    setCaptionsEnabled(false);
    setCaptionStatus('unavailable');
  }, [activeQueueIndex, selectedResource?.id]);

  const currentQueueVideo = module?.queue[activeQueueIndex] ?? null;
  const currentSelection: PlayerSelection | null = selectedResource ?? (currentQueueVideo
    ? {
        id: currentQueueVideo.id,
        title: currentQueueVideo.title,
        description: currentQueueVideo.description,
        duration: currentQueueVideo.duration,
        videoUrl: currentQueueVideo.videoUrl,
        kind: 'queue',
        captionUrl: currentQueueVideo.captionUrl,
      }
    : null);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !currentSelection?.videoUrl) {
      setCaptionStatus('unavailable');
      return;
    }

    const tracks = Array.from(player.textTracks || []);
    if (tracks.length === 0) {
      setCaptionStatus('unavailable');
      return;
    }

    setCaptionStatus('ready');
    tracks.forEach((track) => {
      track.mode = captionsEnabled ? 'showing' : 'hidden';
    });
  }, [captionsEnabled, currentSelection?.id, currentSelection?.videoUrl]);

  const nextQueueVideo = module && pendingNextIndex !== null ? module.queue[pendingNextIndex] : null;
  
  useEffect(() => {
    if (!currentSelection || currentSelection.kind !== 'queue') return;
    if (currentQueueVideo?.progress.watched) return;

    // All videos are hosted on YouTube 
    if (!currentSelection.videoUrl?.includes('youtube.com')) return;

    const initYTPlayer = () => {
      if (!playerRef.current) return;
      new (window as any).YT.Player(playerRef.current, {
        events: {
          onReady: (event: any) => {
            ytPlayerRef.current = event.target;
            // auto-advance-to-next-video playback is triggered from here
            if (shouldAutoplayNextRef.current) {
              shouldAutoplayNextRef.current = false;
              event.target.playVideo();
            }
          },
          onStateChange: (event: any) => {
            if (event.data === 0) {
              setIsRealPlaying(false);
              void handleQueueVideoEnded();
            } else if (event.data === 1) {
              setIsRealPlaying(true);
            } else if (event.data === 2) {
              setIsRealPlaying(false);
            }
          },
        },
      });
    };

    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      (window as any).onYouTubeIframeAPIReady = initYTPlayer;
    } else if ((window as any).YT?.Player) {
      initYTPlayer();
    } else {
      (window as any).onYouTubeIframeAPIReady = initYTPlayer;
    }
  }, [currentSelection?.id]);

  async function refreshWeek(keepQueueIndex = true) {
    if (!weekKey) return;
    try {
      const response = await modulesAPI.getModuleWeek(weekKey);
      setModule(response.module);
      if (!keepQueueIndex) {
        const firstUnwatchedIndex = response.module.queue.findIndex((item) => !item.progress.watched);
        setActiveQueueIndex(firstUnwatchedIndex >= 0 ? firstUnwatchedIndex : Math.max(response.module.queue.length - 1, 0));
      }
    } catch {
      // Silently ignore — module state unchanged.
    }
  }

  async function markCurrentQueueVideo(watchedPercent: number) {
    if (!module || !currentQueueVideo) return;
    try {
      await modulesAPI.postVideoProgress(module.weekKey, currentQueueVideo.id, { watchedPercent });
      await refreshWeek(true);
    } catch {
      // Silently ignore — progress will sync on next load.
    }
  }

  function stopCountdown() {
    if (countdownTimerRef.current) {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdownSeconds(null);
    setPendingNextIndex(null);
  }

  function stopPlaceholderSimulation() {
    if (placeholderTimerRef.current) {
      window.clearInterval(placeholderTimerRef.current);
      placeholderTimerRef.current = null;
    }
    setIsPlaceholderSimulating(false);
  }

  function playPlaceholder() {
    if (mockElapsedMs >= 3000) {
      mockElapsedMsRef.current = 0;
      setMockElapsedMs(0);
      placeholderEndedRef.current = false;
    }
    setIsPlaceholderSimulating(true);
  }

  function startCountdownForNext(nextIndex: number | null) {
    if (!module || nextIndex === null) {
      setShowCompletionModal(true);
      return;
    }

    stopCountdown();
    setPendingNextIndex(nextIndex);
    setCountdownSeconds(3);

    countdownTimerRef.current = window.setInterval(() => {
      setCountdownSeconds((previous) => {
        if (previous === null) return null;
        if (previous <= 1) {
          if (countdownTimerRef.current) {
            window.clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          shouldAutoplayNextRef.current = true;
          setActiveQueueIndex(nextIndex);
          setSelectedResource(null);
          setPendingNextIndex(null);
          return null;
        }
        return previous - 1;
      });
    }, 1000);
  }

  async function handleQueueVideoEnded() {
    console.log('handleQueueVideoEnded - activeQueueIndex:', activeQueueIndex, 'module.queue.length:', module?.queue.length);
    if (!module || !currentQueueVideo) return;

    await markCurrentQueueVideo(100);
    stopPlaceholderSimulation();

    const lastIndex = module.queue.length - 1;
    const isLast = activeQueueIndex >= lastIndex;

    if (isLast) {
      setShowCompletionModal(true);
      return;
    }

    startCountdownForNext(activeQueueIndex + 1);
  }

  function queueStatus(index: number): 'Playing' | 'Up next' | 'Completed' | 'Locked' {
    if (!module) return 'Locked';

    const item = module.queue[index];
    if (item.progress.watched) return 'Completed';
    if (index === activeQueueIndex && !selectedResource) return 'Playing';

    // Find the first unwatched video
    const firstUnwatched = module.queue.findIndex((v) => !v.progress.watched);
    if (index === firstUnwatched) return 'Up next';

    return 'Locked';
  }

  function stepStyle(status: ReturnType<typeof queueStatus>) {
    if (status === 'Playing') {
      return { borderLeft: '2px solid #7200CA', backgroundColor: '#F9F7FF' };
    }

    return { borderLeft: '2px solid transparent', backgroundColor: 'white' };
  }

  const nextWeekKey = useMemo(() => {
    if (!module) return null;
    const index = moduleWeekOrder.indexOf(module.weekKey);
    if (index < 0 || index === moduleWeekOrder.length - 1) return null;
    return moduleWeekOrder[index + 1];
  }, [module]);

  useEffect(() => {
    if (!module || selectedResource) return;
    if (!shouldAutoplayNextRef.current) return;

    const queueVideo = module.queue[activeQueueIndex];
    if (!queueVideo) return;

    // YouTube videos autoplay
    if (!queueVideo.videoUrl) {
      shouldAutoplayNextRef.current = false;
      playPlaceholder();
    }
  }, [activeQueueIndex, module, selectedResource]);


  if (!weekKey || !module || !currentSelection) {
    return (
      <PatientSidebarShell>
        <div className="min-h-screen px-6 py-8 lg:px-10" style={{ backgroundColor: '#F9FAFB' }}>
          <div className="mx-auto max-w-5xl rounded-xl bg-white p-8 text-center" style={{ border: '0.5px solid #E9D5FF' }}>
            <h1 style={{ color: '#1A1A2E', fontSize: '20px', fontWeight: 700 }}>Loading module...</h1>
          </div>
        </div>
      </PatientSidebarShell>
    );
  }

  const isQueueSelection = currentSelection.kind === 'queue';
  const queueHasPrevious = isQueueSelection && activeQueueIndex > 0;
  const queueHasNext = isQueueSelection && activeQueueIndex < module.queue.length - 1;
  // Next video is only allowed once everything through the current one has been watched
  const nextQueueUnlocked =
    queueHasNext && module.queue.slice(0, activeQueueIndex + 1).every((v) => v.progress.watched);
  const isPlaceholderMode = !currentSelection.videoUrl;
  const isPlaying = isPlaceholderMode ? isPlaceholderSimulating : isRealPlaying;

  function goToPrevious() {
    if (!queueHasPrevious) return;
    stopPlaceholderSimulation();
    stopCountdown();
    setSelectedResource(null);
    setActiveQueueIndex((previous) => Math.max(0, previous - 1));
  }

  function goToNext() {
    if (!nextQueueUnlocked) return;
    stopPlaceholderSimulation();
    stopCountdown();
    setSelectedResource(null);
    setActiveQueueIndex((previous) => Math.min(module.queue.length - 1, previous + 1));
  }

  function togglePlayback() {
    if (!isQueueSelection) return;

    if (isPlaceholderMode) {
      setIsPlaceholderSimulating((previous) => !previous);
      return;
    }

    const ytPlayer = ytPlayerRef.current;
    if (!ytPlayer) return;

    if (isRealPlaying) {
      ytPlayer.pauseVideo();
    } else {
      ytPlayer.playVideo();
    }
  }

  function requestFullSize() {
    const target = fullscreenContainerRef.current ?? playerContainerRef.current;
    if (!target) return;

    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }

    void target.requestFullscreen?.();
  }

  return (
    <PatientSidebarShell>
      <div className="min-h-screen px-6 py-8 lg:px-10" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="mx-auto max-w-6xl">
          <header className="mb-6 flex items-center justify-between">
            <button
              onClick={() => navigate('/modules')}
              className="inline-flex items-center gap-1.5 hover:opacity-90 cursor-pointer"
              style={{ color: '#7200CA', fontSize: '16px', fontWeight: 500 }}
            >
              <ArrowLeft size={16} />
              <span>Back to Modules</span>
            </button>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A2E' }}>Weekly Sleep Modules</h1>
          </header>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,70%)_minmax(0,30%)]">
            <section>
              <div ref={fullscreenContainerRef}>
                <div
                  ref={playerContainerRef}
                  className="relative overflow-hidden rounded-[12px]"
                  style={{ backgroundColor: '#1A1A2E', aspectRatio: '16 / 9' }}
                >
                  <button
                    onClick={() => setCaptionsEnabled((previous) => !previous)}
                    className="absolute right-3 top-3 z-20 rounded px-2 py-1 inline-flex items-center gap-1"
                    style={{
                      color: captionsEnabled ? '#FFFFFF' : '#E5E7EB',
                      border: captionsEnabled ? '1px solid #FFFFFF' : '1px solid #9CA3AF',
                      backgroundColor: 'rgba(26, 26, 46, 0.55)',
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                    title={
                      captionStatus === 'ready'
                        ? 'Toggle captions'
                        : 'Captions unavailable for this video'
                    }
                  >
                    <Captions size={14} />
                    <span>CC</span>
                  </button>

                  {currentSelection.videoUrl ? (
                    <iframe
                      ref={playerRef}
                      className="h-full w-full"
                      controls
                      autoPlay
                      src={currentSelection.videoUrl}
                      crossOrigin="anonymous"
                      onPlay={() => setIsRealPlaying(true)}
                      onPause={() => setIsRealPlaying(false)}
                      onLoadedMetadata={() => {
                        const player = playerRef.current;
                        if (!player) return;
                        const hasTracks = Array.from(player.textTracks || []).length > 0;
                        setCaptionStatus(hasTracks ? 'ready' : 'unavailable');
                      }}
                      onEnded={() => {
                        setIsRealPlaying(false);
                        if (currentSelection.kind === 'queue') {
                          void handleQueueVideoEnded();
                        }
                      }}
                    >
                      {currentSelection.captionUrl && (
                        <track
                          kind="captions"
                          src={currentSelection.captionUrl}
                          srcLang="en"
                          label="English"
                        />
                      )}
                    </iframe>
                  ) : (
                    <button
                      onClick={() => {
                        if (currentSelection.kind === 'queue') {
                          playPlaceholder();
                        }
                      }}
                      className="h-full w-full"
                      style={{ backgroundColor: '#1A1A2E' }}
                    >
                      <div className="flex h-full items-center justify-center">
                        <Play size={48} color="white" fill="white" opacity={0.6} />
                      </div>
                    </button>
                  )}

                  {countdownSeconds !== null && nextQueueVideo && (
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center"
                      style={{ backgroundColor: 'rgba(26,26,46,0.85)', borderRadius: '12px' }}
                    >
                      <p style={{ fontSize: '16px', color: 'white', fontWeight: 500 }}>
                        Next up: {nextQueueVideo.title}
                      </p>
                      <p style={{ fontSize: '48px', color: '#C4B5FD', fontWeight: 700, lineHeight: 1.1 }}>
                        {countdownSeconds}
                      </p>
                      <button
                        onClick={() => {
                          if (pendingNextIndex !== null) {
                            stopCountdown();
                            shouldAutoplayNextRef.current = true;
                            setActiveQueueIndex(pendingNextIndex);
                            setSelectedResource(null);
                          }
                        }}
                        className="rounded-lg px-4 py-2"
                        style={{
                          background: 'linear-gradient(90deg, #6D28D9 0%, #5B21B6 100%)',
                          color: 'white',
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      >
                        Play now
                      </button>
                      <button
                        onClick={() => {
                          stopCountdown();
                          stopPlaceholderSimulation();
                        }}
                        className="mt-2"
                        style={{ color: 'white', fontSize: '13px', textDecoration: 'underline' }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {isQueueSelection && (
                  <div
                    className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[10px] bg-white px-3 py-2"
                    style={{ border: '0.5px solid #E9D5FF' }}
                  >
                    <div className="flex items-center gap-1">
                      <button
                        onClick={goToPrevious}
                        disabled={!queueHasPrevious}
                        className="rounded px-2 py-1 cursor-pointer disabled:cursor-not-allowed"
                        style={{ color: queueHasPrevious ? '#7200CA' : '#C4B5FD' }}
                      >
                        <SkipBack size={16} />
                      </button>
                      <button
                        onClick={togglePlayback}
                        className="rounded px-2 py-1 cursor-pointer"
                        style={{ color: '#7200CA' }}
                      >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
                      </button>
                      <button
                        onClick={goToNext}
                        disabled={!nextQueueUnlocked}
                        className="rounded px-2 py-1 cursor-pointer disabled:cursor-not-allowed"
                        style={{ color: nextQueueUnlocked ? '#7200CA' : '#C4B5FD' }}
                        title={!queueHasNext ? undefined : nextQueueUnlocked ? undefined : 'Finish the current video to unlock the next one'}
                      >
                        <SkipForward size={16} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <label style={{ fontSize: '12px', color: '#6B7280' }}>Speed</label>
                      <select
                        value={mockSpeed}
                        onChange={(event) => {
                          const speed = Number.parseFloat(event.target.value);
                          setMockSpeed(speed);
                          ytPlayerRef.current?.setPlaybackRate?.(speed);
                        }}
                        className="rounded px-2 py-1 cursor-pointer"
                        style={{ border: '0.5px solid #C4B5FD', fontSize: '12px', color: '#1A1A2E' }}
                      >
                        <option value={0.5}>0.5x</option>
                        <option value={1}>1x</option>
                        <option value={1.25}>1.25x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2x</option>
                      </select>
                      <button
                        onClick={requestFullSize}
                        className="rounded px-2 py-1 cursor-pointer"
                        style={{ color: '#7200CA' }}
                      >
                        <Maximize2 size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {captionsEnabled && captionStatus === 'unavailable' && (
                  <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '6px' }}>
                    Live captions are enabled, but this video does not include a caption track yet.
                  </p>
                )}
              </div>

              <h2 className="mt-4" style={{ fontSize: '18px', color: '#1A1A2E', fontWeight: 700 }}>
                {currentSelection.title}
              </h2>
              <p style={{ fontSize: '13px', color: '#9CA3AF' }}>
                Week {module.weekNumber} | {currentSelection.duration}
              </p>
              <p className="mt-2" style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7 }}>
                {currentSelection.description}
              </p>

              <div className="mt-5 space-y-2 rounded-[12px] bg-white p-4" style={{ border: '0.5px solid #E9D5FF' }}>
                {module.queue.map((item, index) => {
                  const status = queueStatus(index);
                  const isCompleted = status === 'Completed';

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-[10px] px-3 py-2"
                      style={stepStyle(status)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full"
                          style={
                            isCompleted
                              ? { backgroundColor: '#DCFCE7', color: '#166534' }
                              : { backgroundColor: '#F3E8FF', color: '#7200CA' }
                          }
                        >
                          {isCompleted ? <Check size={12} /> : <span style={{ fontSize: '12px', fontWeight: 600 }}>{index + 1}</span>}
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', color: '#1A1A2E' }}>{item.title}</p>
                          <p style={{ fontSize: '12px', color: '#9CA3AF' }}>{item.duration}</p>
                        </div>
                      </div>
                      <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{status}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="flex flex-col gap-4 lg:sticky lg:top-8 self-start">
            <aside className="h-fit rounded-[12px] bg-white p-4" style={{ border: '0.5px solid #E9D5FF' }}>
              <div className="mb-3 flex gap-4">
                <button
                  onClick={() => setActiveTab('queue')}
                  style={
                    activeTab === 'queue'
                      ? { color: '#7200CA', borderBottom: '2px solid #7200CA', fontWeight: 600, fontSize: '14px' }
                      : { color: '#9CA3AF', fontSize: '13px' }
                  }
                  className="pb-1"
                >
                  Queue
                </button>
              </div>

              {activeTab === 'queue' && (
                <div className="space-y-2">
                  {module.queue.map((item, index) => {
                    const status = queueStatus(index);
                    const isCurrent = index === activeQueueIndex && !selectedResource;
                    const isCompleted = item.progress.watched;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (status === 'Locked') return;
                          // Block if any video before this one hasn't been watched
                          const allPreviousWatched = module.queue
                            .slice(0, index)
                            .every((v) => v.progress.watched);
                          if (!allPreviousWatched) return;
                          stopPlaceholderSimulation();
                          setActiveQueueIndex(index);
                          setSelectedResource(null);
                          stopCountdown();
                        }}
                        className="w-full rounded-[8px] px-2 py-2 text-left"
                        style={
                          isCurrent
                            ? { borderLeft: '2px solid #7200CA', backgroundColor: '#F9F7FF' }
                            : { opacity: isCompleted ? 0.5 : 1 }
                        }
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="relative flex h-[50px] w-[80px] items-center justify-center rounded-[6px]"
                            style={{ backgroundColor: '#1A1A2E' }}
                          >
                            <Play size={14} color="white" fill="white" opacity={0.7} />
                            {isCompleted && (
                              <div className="absolute -right-1 -top-1 rounded-full bg-[#DCFCE7] p-1">
                                <Check size={10} color="#166534" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate" style={{ fontSize: '13px', color: '#1A1A2E', fontWeight: 500 }}>
                              {item.title}
                            </p>
                            <p style={{ fontSize: '11px', color: '#9CA3AF' }}>{item.duration}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </aside>
              <div className="rounded-[12px] bg-white p-4" style={{ backgroundColor: '#F3E9FB', border: '0.5px solid #E9D5FF' }}>
                <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '4px' }}>
                  Sleep Prescription
                </p>
                <p style={{ fontSize: '22px', fontWeight: 600, color: '#7200CA' }}>
                  {prescribedSleepHours != null ? `${prescribedSleepHours} hrs` : '—'}
                </p>
                <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '2px' }}>
                  Recommended by your clinician
                </p>
              </div>
            </div>
            
            {/* Previous Week Resources */}
            {(() => {
              const prevResources = moduleData[weekKey!].resources;
              if (prevResources.length === 0) return null;
              return (
                <div className="rounded-[12px] bg-white p-4" style={{ border: '0.5px solid #E9D5FF' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A2E', marginBottom: '12px' }}>
                    Resources
                  </p>
                  <div className="space-y-2">
                    {prevResources.map((resource) => (
                      <button
                        key={resource.id}
                        onClick={() => {
                          setSelectedResource({
                            id: resource.id,
                            title: resource.title,
                            description: resource.title,
                            duration: '',
                            videoUrl: resource.videoUrl,
                            kind: 'resource',
                            captionUrl: resource.captionUrl,
                          });
                          stopPlaceholderSimulation();
                          stopCountdown();
                        }}
                        className="w-full rounded-[8px] px-2 py-2 text-left transition-colors hover:bg-[#F9F7FF]"
                        style={
                          selectedResource?.id === resource.id
                            ? { borderLeft: '2px solid #7200CA', backgroundColor: '#F9F7FF' }
                            : {}
                        }
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="relative flex h-[50px] w-[80px] items-center justify-center rounded-[6px]"
                            style={{ backgroundColor: '#1A1A2E' }}
                          >
                            <Play size={14} color="white" fill="white" opacity={0.7} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate" style={{ fontSize: '13px', color: '#1A1A2E', fontWeight: 500 }}>
                              {resource.title}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {showCompletionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ backgroundColor: 'rgba(26,26,46,0.5)' }}
        >
          <div className="w-full max-w-[440px] rounded-[16px] bg-white p-8 text-center">
            <CheckCircle size={48} color="#7200CA" className="mx-auto" />
            <h2 className="mt-4" style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A2E' }}>
              Week {weekNumberFromKey(module.weekKey)} Complete!
            </h2>
            <p className="mt-2" style={{ fontSize: '14px', color: '#6B7280' }}>
              You&apos;ve completed all videos for this week. Come back next week to continue your program.
            </p>

            {nextWeekKey && (
              nextModuleData?.unlocked ? (
                <button
                  onClick={() => navigate(`/modules/${weekSlugFromKey(nextWeekKey)}`)}
                  className="mt-5 w-full rounded-[10px] py-2.5"
                  style={{ background: 'linear-gradient(90deg, #6D28D9 0%, #5B21B6 100%)', color: 'white', fontSize: '14px', fontWeight: 600 }}
                >
                  Start Week {weekNumberFromKey(nextWeekKey)}
                </button>
              ) : (
                <p className="mt-5 text-center" style={{ fontSize: '13px', color: '#9CA3AF' }}>
                  {nextModuleData?.daysUntilUnlock > 0
                    ? `Week ${weekNumberFromKey(nextWeekKey)} available in ${nextModuleData.daysUntilUnlock} day${nextModuleData.daysUntilUnlock !== 1 ? 's' : ''}`
                    : `Complete all videos to unlock Week ${weekNumberFromKey(nextWeekKey)}`}
                </p>
              )
            )}

            <button
              onClick={() => navigate('/modules')}
              className="mt-3 w-full rounded-[10px] py-2.5"
              style={{
                border: '1px solid #7200CA',
                color: '#7200CA',
                backgroundColor: 'white',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Back to Modules
            </button>
          </div>
        </div>
      )}
    </PatientSidebarShell>
  );
}