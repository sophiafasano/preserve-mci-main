import { useState, useEffect, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import SleepLogModal from './SleepLogModal';
import DietLogModal from './DietLogModal';

interface CogengageLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CogengageLogData) => void;
  existingLogs?: { date: string }[];
}

export interface CogengageLogData {
  brainActivities: {
    brainTrainingProgram: {
      selected: boolean;
      duration: number;
      withWho: string;
    };
    puzzlesAndBrainGames: {
      selected: boolean;
      duration: number;
      withWho: string;
    };
    newLearnedSkill: {
      selected: boolean;
      duration: number;
      withWho: string;
    };
    socialActivity: {
      selected: boolean;
      duration: number;
      withWho: string;
    };
    mindBodyActivity: {
      selected: boolean;
      duration: number;
      withWho: string;
    };
  };
  date: string;
}

const STEPS = ['Brain Activities'];

const purple = '#6D28D9';
const gradient = 'linear-gradient(90deg, #6D28D9 0%, #5B21B6 100%)';
const borderColor = '#E9D5FF';

const BRAIN_ACTIVITIES = [
  { label: 'Brain training program', key: 'brainTrainingProgram' },
  { label: 'Puzzles and brain games', key: 'puzzlesAndBrainGames' },
  { label: 'Engaged in a new learned skill', key: 'newLearnedSkill' },
  {
    label: 'Engaged in a social activity like volunteering or book club',
    key: 'socialActivity',
  },
  {
    label: 'Engaged in an activity that moved my body and mind, like dance',
    key: 'mindBodyActivity',
  },
] as const;

type BrainActivityKey = typeof BRAIN_ACTIVITIES[number]['key'];

const initialBrainActivities = {
  brainTrainingProgram: {
    selected: false,
    duration: '',
    withWho: '',
  },
  puzzlesAndBrainGames: {
    selected: false,
    duration: '',
    withWho: '',
  },
  newLearnedSkill: {
    selected: false,
    duration: '',
    withWho: '',
  },
  socialActivity: {
    selected: false,
    duration: '',
    withWho: '',
  },
  mindBodyActivity: {
    selected: false,
    duration: '',
    withWho: '',
  },
};

export default function CogengageLogModal({
  isOpen,
  onClose,
  onSubmit,
  existingLogs = [],
}: CogengageLogModalProps) {

  const [step, setStep] = useState(0);

  const [activeLog, setActiveLog] = useState<
    'sleep' | 'diet' | 'cogengage' | null
  >('cogengage');

  // Brain Activities
  const [brainActivities, setBrainActivities] = useState(initialBrainActivities);

  // Draft loading
  useEffect(() => {
    const saved = sessionStorage.getItem('cogengageDraft');

    if (saved) {
      try {
        const data = JSON.parse(saved);

        setBrainActivities({
          ...initialBrainActivities,
          ...(data.brainActivities ?? {}),
        });
      } catch {
        sessionStorage.removeItem('cogengageDraft');
      }
    }
  }, []);

  // Draft saving
  useEffect(() => {
    sessionStorage.setItem(
      'cogengageDraft',
      JSON.stringify({ brainActivities })
    );
  }, [brainActivities]);

  // Reset form
  const resetForm = () => {
    setStep(0);
    setBrainActivities({ ...initialBrainActivities });
  };

  // Handle next
  const handleNext = () => {
    const hasSelection = Object.values(brainActivities).some(
      (value) => value === true
    );

    if (!hasSelection) {
      toast.error('Please select at least one brain activity');
      return;
    }

    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  // Handle submit
  const handleSubmit = () => {
    onSubmit({
      date: new Date().toISOString(),
      brainActivities,
    });

    toast.success('Cognitive Engagement log saved', {
      position: 'bottom-center',
      duration: 3000,
      style: {
        background: '#1A1A2E',
        color: '#FFFFFF',
        borderRadius: '8px',
        padding: '10px 20px',
        fontSize: '13px',
      },
    });

    resetForm();
    sessionStorage.removeItem('cogengageDraft');
    onClose();
  };

  // Already logged today
  const hasLoggedToday = useMemo(() => {
    const today = new Date().toDateString();

    return existingLogs.some(
      (log) => new Date(log.date).toDateString() === today
    );
  }, [existingLogs]);

  if (!isOpen) return null;

  return (
    <>
      {activeLog === 'cogengage' ? (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          <div className="relative w-full max-w-[560px] rounded-2xl bg-white p-8 max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="mb-5 flex items-center justify-between">

              <div>
                <div className="flex gap-2 mb-5">

                  <button
                    type="button"
                    onClick={() => setActiveLog('sleep')}
                    className="rounded-lg px-4 py-2 text-sm text-white"
                    style={{ backgroundImage: gradient }}
                  >
                    Sleep Log
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveLog('diet')}
                    className="rounded-lg px-4 py-2 text-sm text-white"
                    style={{ backgroundImage: gradient }}
                  >
                    Diet Log
                  </button>

                </div>

                <h2 className="text-lg font-bold" style={{ color: '#1A1A2E' }}>
                  Daily Cognitive Engagement Log
                </h2>

                <p className="text-xs text-gray-400 mt-1">
                  Step {step + 1} of {STEPS.length} — {STEPS[step]}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 hover:bg-[#F3E8FF]"
              >
                <X size={18} color="#1A1A2E" />
              </button>

            </div>

            {/* Progress bar */}
            <div className="mb-6 flex gap-1">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full"
                  style={{
                    backgroundColor: i <= step ? purple : '#E9D5FF',
                  }}
                />
              ))}
            </div>

            {/* Already logged */}
            {hasLoggedToday ? (

              <div className="py-8 text-center">
                <p className="text-[15px] font-semibold mb-2">
                  You've already logged today
                </p>
                <p className="text-[13px] text-gray-500">
                  Come back tomorrow to log again.
                </p>
              </div>

            ) : (

              <>
                {/* STEP 1: Brain Activities */}
                {step === 0 && (

                  <div className="space-y-4">

  <label className="block text-sm font-medium" style={{ color: '#1A1A2E' }}>
    Please answer the questions below for brain activities completed today/this week:
  </label>

  {BRAIN_ACTIVITIES.map((activity) => (

    <div
      key={activity.key}
      className="rounded-xl border p-4 space-y-4"
      style={{ borderColor }}
    >

      {/* Activity checkbox */}
      <label className="flex items-start gap-3 cursor-pointer">

        <input
          type="checkbox"
          checked={brainActivities[activity.key].selected}
          onChange={(e) =>
            setBrainActivities((prev) => ({
              ...prev,
              [activity.key]: {
                ...prev[activity.key],
                selected: e.target.checked,
              },
            }))
          }
          className="mt-1 h-4 w-4 accent-purple-700"
        />

        <span className="text-sm font-medium" style={{ color: '#1A1A2E' }}>
          {activity.label}
        </span>

        </label>

            {/* Expand when selected */}
            {brainActivities[activity.key].selected && (

                <div className="ml-7 space-y-4 border-l-2 pl-4"
                style={{ borderColor: '#E9D5FF' }}>

                    {/* Duration */}
{/* 
                    <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>
                    How many minutes total did you nap yesterday?
                  </label>
                  <input
                    type="number" min={0} placeholder="0" value={napMinutes}
                    onChange={(e) => setNapMinutes(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor }}
                  />
                </div> */}
                    <div>
                        <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>
                    Duration in minutes:
                  </label>
                        <input
                            type="number"
                            value={brainActivities[activity.key].duration}
                            onChange={(e) =>
                                setBrainActivities((prev) => ({
                                    ...prev,
                                    [activity.key]: {
                                        ...prev[activity.key],
                                        duration: e.target.value,
                                        
                                    } ,
                                }))
                            }
                    className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor }}
                        />
                        
                    </div>

                    {/* With whom */}
                    <div>
                        <label className="block text-sm mb-2">
                        Who did you do this activity with?
                        </label>

                        <select
                        value={brainActivities[activity.key].withWho}
                        onChange={(e) =>
                            setBrainActivities((prev) => ({
                            ...prev,
                            [activity.key]: {
                                ...prev[activity.key],
                                withWho: e.target.value,
                            },
                            }))
                        }
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                        style={{ borderColor }}
                        >
                        <option value="">Select an option</option>
                        <option value="Alone">Alone</option>
                        <option value="Family">Family</option>
                        <option value="Friends">Friends</option>
                        <option value="Partner">Partner</option>
                        <option value="Group">Group</option>
                        <option value="Other">Other</option>
                        </select>
                    </div>

                    </div>

                )}

                </div>

            ))}

            </div>
                )}

                {/* Navigation */}
                <div className="mt-8 flex items-center justify-between gap-3">

                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm"
                      style={{
                        color: purple,
                        border: `0.5px solid ${borderColor}`,
                      }}
                    >
                      <ChevronLeft size={16} />
                      Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {step < STEPS.length - 1 ? (

                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex items-center gap-1 px-6 py-2 rounded-xl text-sm font-semibold text-white"
                      style={{ backgroundImage: gradient }}
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>

                  ) : (

                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="flex-1 rounded-[10px] text-white py-3 text-sm font-semibold"
                      style={{ backgroundImage: gradient }}
                    >
                      Save Entry
                    </button>

                  )}

                </div>

              </>
            )}

          </div>
        </div>

      ) : activeLog === 'sleep' ? (

        <SleepLogModal
          isOpen={true}
          onClose={onClose}
          onSubmit={(data) => setActiveLog('sleep')}
        />

      ) : activeLog === 'diet' ? (

        <DietLogModal
          isOpen={true}
          onClose={onClose}
          onSubmit={(data) => setActiveLog('diet')}
        />

      ) : null}

    </>
  );
}