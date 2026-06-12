import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Lock,
  Play,
  ChevronLeft,
  TrendingUp,
  Award,
  Target,
  Send,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { modulesAPI, type ModuleWithProgress, type ModulesSummary } from '../../utils/modulesAPI';
import { usePatientConnection } from '../../hooks/usePatientConnection';

const emptySummary: ModulesSummary = {
  completedCount: 0,
  inProgressCount: 0,
  notStartedCount: 4,
  overallPercent: 0,
  watchedVideos: 0,
  totalVideos: 0,
};

export default function CarePartnerProgress() {
  const navigate = useNavigate();
  const { connection } = usePatientConnection();
  const [modules, setModules] = useState<ModuleWithProgress[]>([]);
  const [summary, setSummary] = useState<ModulesSummary>(emptySummary);
  const [loading, setLoading] = useState(true);

  const patientName = connection?.patientName || 'Your loved one';
  const firstName = patientName.split(' ')[0];

  useEffect(() => {
    modulesAPI
      .getModules()
      .then((res) => {
        setModules(res.modules);
        setSummary(res.summary);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusConfig = {
    completed: {
      label: 'Completed',
      icon: CheckCircle2,
      iconColor: 'text-teal-600',
      badgeBg: 'bg-teal-100 text-teal-700',
      border: 'border-teal-200 bg-teal-50',
      ring: 'bg-teal-500',
    },
    in_progress: {
      label: 'In Progress',
      icon: Play,
      iconColor: 'text-purple-600',
      badgeBg: 'bg-purple-100 text-purple-700',
      border: 'border-purple-200 bg-purple-50',
      ring: 'bg-purple-500',
    },
    not_started: {
      label: 'Not Started',
      icon: Lock,
      iconColor: 'text-gray-400',
      badgeBg: 'bg-gray-100 text-gray-500',
      border: 'border-gray-200 bg-gray-50',
      ring: 'bg-gray-300',
    },
  };

  const milestones = [
    {
      label: 'First Step',
      description: `${firstName} started the program`,
      reached: summary.watchedVideos >= 1,
      icon: '🌱',
    },
    {
      label: 'Week 1 Complete',
      description: 'Foundations of sleep understood',
      reached: summary.completedCount >= 1,
      icon: '⭐',
    },
    {
      label: 'Halfway There',
      description: '2 modules finished',
      reached: summary.completedCount >= 2,
      icon: '🏃',
    },
    {
      label: 'Almost Done',
      description: '3 modules finished',
      reached: summary.completedCount >= 3,
      icon: '🎯',
    },
    {
      label: 'Program Complete',
      description: 'All 4 modules finished!',
      reached: summary.completedCount >= 4,
      icon: '🏆',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/caregiver')}
          className="p-2 hover:bg-gray-100 rounded-xl"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div>
          <h1 className="text-3xl mb-1" style={{ color: '#1f1f3d' }}>
            Program Progress
          </h1>
          <p className="text-lg text-gray-600">
            {patientName}'s sleep intervention journey
          </p>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl p-8 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-purple-200 mb-1">Overall Program Progress</p>
            <p className="text-5xl font-light mb-2">{summary.overallPercent}%</p>
            <p className="text-purple-100">
              {summary.completedCount} of 4 modules completed
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
            <Target className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="bg-white/20 rounded-full h-3">
          <div
            className="bg-white rounded-full h-3 transition-all duration-700"
            style={{ width: `${summary.overallPercent}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <p className="text-2xl font-light">{summary.completedCount}</p>
            <p className="text-purple-200 text-sm">Completed</p>
          </div>
          <div className="text-center border-x border-white/20">
            <p className="text-2xl font-light">{summary.inProgressCount}</p>
            <p className="text-purple-200 text-sm">In Progress</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-light">{summary.watchedVideos}/{summary.totalVideos}</p>
            <p className="text-purple-200 text-sm">Videos Watched</p>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6 text-teal-700" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Modules Done</p>
            <p className="text-2xl" style={{ color: '#1f1f3d' }}>{summary.completedCount} / 4</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-purple-700" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Videos Watched</p>
            <p className="text-2xl" style={{ color: '#1f1f3d' }}>{summary.watchedVideos} / {summary.totalVideos}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6 text-teal-700" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Milestones Reached</p>
            <p className="text-2xl" style={{ color: '#1f1f3d' }}>
              {milestones.filter((m) => m.reached).length} / {milestones.length}
            </p>
          </div>
        </div>
      </div>

      {/* Module Timeline */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h2 className="text-2xl mb-2" style={{ color: '#1f1f3d' }}>Module Timeline</h2>
        <p className="text-base text-gray-600 mb-6">
          4-week sleep intervention program — track {firstName}'s journey week by week
        </p>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : modules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-lg text-gray-600">Module data unavailable</p>
          </div>
        ) : (
          <div className="space-y-4">
            {modules.map((mod, idx) => {
              const cfg = statusConfig[mod.completionStatus];
              const StatusIcon = cfg.icon;
              return (
                <div
                  key={mod.weekKey}
                  className={`rounded-2xl border-2 p-6 transition-all ${cfg.border}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Week indicator */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${cfg.ring}`}>
                        {idx + 1}
                      </div>
                      {idx < modules.length - 1 && (
                        <div className="w-0.5 h-6 mt-2 bg-gray-200" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-medium" style={{ color: '#1f1f3d' }}>
                              Week {mod.weekNumber}
                            </h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.badgeBg}`}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-base text-gray-700 mb-0.5">{mod.title}</p>
                          <p className="text-sm text-gray-500">{mod.subtitle}</p>
                        </div>
                        <StatusIcon className={`w-6 h-6 flex-shrink-0 mt-1 ${cfg.iconColor}`} />
                      </div>

                      {/* Progress bar */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{mod.overallPercent}%</span>
                        </div>
                        <Progress value={mod.overallPercent} className="h-2" />
                      </div>

                      {/* Video count */}
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Play className="w-4 h-4" />
                          {mod.queue.filter((v) => v.progress.watched).length}/{mod.queue.length} videos
                        </span>
                        {mod.completionStatus === 'completed' && mod.completedAt && (
                          <span className="flex items-center gap-1.5 text-teal-600">
                            <CheckCircle2 className="w-4 h-4" />
                            Completed
                          </span>
                        )}
                        {mod.isLocked && (
                          <span className="flex items-center gap-1.5 text-gray-400">
                            <Lock className="w-4 h-4" />
                            Locked — complete prior week first
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Milestone Achievements */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h2 className="text-2xl mb-2" style={{ color: '#1f1f3d' }}>Milestone Achievements</h2>
        <p className="text-base text-gray-600 mb-6">
          Celebrate {firstName}'s program milestones
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {milestones.map((m, i) => (
            <div
              key={i}
              className={`p-5 rounded-2xl border-2 transition-all ${
                m.reached
                  ? 'border-teal-200 bg-teal-50'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div className="text-3xl mb-3">{m.icon}</div>
              <p className={`text-base font-medium mb-1 ${m.reached ? 'text-teal-800' : 'text-gray-500'}`}>
                {m.label}
              </p>
              <p className="text-sm text-gray-600">{m.description}</p>
              {m.reached && (
                <div className="flex items-center gap-1.5 mt-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span className="text-xs text-teal-700 font-medium">Achieved</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Caregiver Tip */}
      <div className="bg-gradient-to-br from-purple-50 to-teal-50 rounded-2xl border-2 border-purple-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6 text-purple-700" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-2" style={{ color: '#1f1f3d' }}>
              How You Can Help
            </h3>
            <p className="text-base text-gray-700 mb-4">
              Consistent encouragement is one of the strongest predictors of program completion.
              A quick check-in when {firstName} completes a module can make a real difference.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 mb-4">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <span>Modules take 15–30 minutes to complete</span>
              </div>
              <div className="flex items-start gap-2">
                <Target className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                <span>Completing all 4 weeks takes about a month</span>
              </div>
              <div className="flex items-start gap-2">
                <Award className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <span>Celebrate each completed week with {firstName}</span>
              </div>
              <div className="flex items-start gap-2">
                <Send className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                <span>Send a message if they seem stuck on a module</span>
              </div>
            </div>
            <Button
              onClick={() => navigate('/caregiver/messages')}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white h-11 px-6 rounded-xl"
            >
              Send {firstName} a Message
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
