import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Moon,
  TrendingUp,
  CheckCircle,
  BookOpen,
  Calendar,
  AlertCircle,
  ChevronRight,
  Activity,
  Award,
  Clock,
  BarChart3,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSleepLogs } from '../../hooks/useSleepLogs';
import { useAllModulesProgress } from '../../hooks/useModuleProgress';
import { usePatientConnection } from '../../hooks/usePatientConnection';

export default function PatientOverview() {
  const navigate = useNavigate();
  const { connection } = usePatientConnection();
  const { logs: sleepLogs, stats: sleepStats, getChartData } = useSleepLogs();
  const moduleProgressStats = useAllModulesProgress();

  // Get chart data for last 14 days
  const sleepTrendData = useMemo(() => {
    return getChartData(14).map((item, index) => ({
      ...item,
      uniqueId: `${item.fullDate}-${index}`,
    }));
  }, [getChartData]);

  // Calculate engagement metrics
  const lastLogDate = sleepLogs.length > 0 ? new Date(sleepLogs[0].date) : null;
  const daysSinceLastLog = lastLogDate
    ? Math.floor((Date.now() - lastLogDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const needsAttention = daysSinceLastLog !== null && daysSinceLastLog > 3;

  const overviewStats = [
    {
      label: 'Module Progress',
      value: `${moduleProgressStats.completedModules}/${moduleProgressStats.totalModules}`,
      icon: BookOpen,
      color: 'purple',
      subtext: `${moduleProgressStats.overallProgress}% complete`,
    },
    {
      label: 'Sleep Logs',
      value: sleepStats.totalLogs,
      icon: Moon,
      color: 'teal',
      subtext: `${sleepStats.currentStreak} day streak`,
    },
    {
      label: 'Avg Sleep',
      value: sleepStats.averageHours > 0 ? `${sleepStats.averageHours} hrs` : 'No data',
      icon: Activity,
      color: 'purple',
      subtext: sleepStats.averageHours >= 7 ? 'Good range' : 'Needs improvement',
    },
    {
      label: 'Sleep Quality',
      value: sleepStats.averageQuality > 0 ? `${Math.round(sleepStats.averageQuality * 10)}%` : 'No data',
      icon: TrendingUp,
      color: 'teal',
      subtext: sleepStats.averageQuality >= 8 ? 'Excellent' : 'Room to improve',
    },
  ];

  const recentActivity = [
    {
      type: 'sleep_log',
      title: sleepLogs.length > 0 ? 'Logged sleep for last night' : 'No sleep logs yet',
      time: sleepLogs.length > 0 ? getRelativeTime(new Date(sleepLogs[0].date)) : '',
      icon: Moon,
      color: 'teal',
    },
    {
      type: 'module',
      title: moduleProgressStats.completedModules > 0
        ? `Completed module ${moduleProgressStats.completedModules}`
        : 'No modules completed yet',
      time: moduleProgressStats.completedModules > 0 ? '2 days ago' : '',
      icon: CheckCircle,
      color: 'purple',
    },
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

  return (
    <div className="space-y-8">
      {/* Patient Info Header */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl shadow-xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <Activity className="w-5 h-5" />
              <span className="text-sm">Patient Overview</span>
            </div>
            <h2 className="text-3xl mb-3">
              {connection?.patientName || 'Margaret Johnson'}
            </h2>
            <p className="text-lg text-purple-100 mb-4">
              {connection?.relationshipType
                ? `Your ${connection.relationshipType}`
                : 'Your loved one'}{' '}
              participating in the sleep intervention program
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-200" />
                <span className="text-sm text-purple-100">
                  Connected since {connection?.dateConnected
                    ? new Date(connection.dateConnected).toLocaleDateString()
                    : 'Feb 2026'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-purple-200" />
                <span className="text-sm text-purple-100">
                  Last active: {daysSinceLastLog !== null
                    ? `${daysSinceLastLog} day${daysSinceLastLog !== 1 ? 's' : ''} ago`
                    : 'Today'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attention Alert */}
      {needsAttention && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl mb-2" style={{ color: '#1f1f3d' }}>
                Check-in Needed
              </h3>
              <p className="text-base text-gray-700 mb-4">
                {connection?.patientName || 'Your loved one'} hasn't logged sleep in {daysSinceLastLog} days.
                Consider sending an encouraging message or checking in.
              </p>
              <Button
                onClick={() => navigate('/caregiver/messages')}
                className="bg-amber-600 hover:bg-amber-700 text-white h-11 px-6 rounded-xl"
              >
                Send Encouragement
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Overview Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    stat.color === 'purple'
                      ? 'bg-gradient-to-br from-purple-100 to-purple-200'
                      : 'bg-gradient-to-br from-teal-100 to-teal-200'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      stat.color === 'purple' ? 'text-purple-700' : 'text-teal-700'
                    }`}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-3xl mb-1" style={{ color: '#1f1f3d' }}>
                {stat.value}
              </p>
              <p className="text-sm text-gray-500">{stat.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* Sleep Trend Chart */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl mb-1" style={{ color: '#1f1f3d' }}>
              Sleep Trend
            </h2>
            <p className="text-base text-gray-600">Last 14 days</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate('/caregiver/sleep-data')}
            className="text-purple-600 hover:text-purple-700"
          >
            View All Logs
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>

        {sleepTrendData.some((d) => d.hasData) ? (
          <div className="w-full" style={{ height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={sleepTrendData}
                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  style={{ fontSize: '14px' }}
                  tick={{ fill: '#6b7280' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: '14px' }}
                  tick={{ fill: '#6b7280' }}
                  domain={[0, 10]}
                  ticks={[0, 2, 4, 6, 8, 10]}
                  label={{
                    value: 'Hours',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fill: '#6b7280', fontSize: '14px' },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '12px',
                  }}
                  labelStyle={{ color: '#1f1f3d', fontWeight: 500 }}
                />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Sleep Hours"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
              <Moon className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl mb-2" style={{ color: '#1f1f3d' }}>
              No Sleep Data Yet
            </h3>
            <p className="text-base text-gray-600 max-w-md">
              {connection?.patientName || 'Your loved one'} hasn't logged any sleep data yet.
              Encourage them to start tracking!
            </p>
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h2 className="text-2xl mb-6" style={{ color: '#1f1f3d' }}>
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 rounded-xl bg-gray-50 border border-gray-200"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      activity.color === 'purple'
                        ? 'bg-purple-100'
                        : 'bg-teal-100'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        activity.color === 'purple'
                          ? 'text-purple-700'
                          : 'text-teal-700'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base mb-1" style={{ color: '#1f1f3d' }}>
                      {activity.title}
                    </p>
                    {activity.time && (
                      <p className="text-sm text-gray-600">{activity.time}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h2 className="text-2xl mb-6" style={{ color: '#1f1f3d' }}>
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/caregiver/sleep-data')}
              className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-teal-200 bg-teal-50 hover:bg-teal-100 hover:border-teal-300 transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <span className="text-base" style={{ color: '#1f1f3d' }}>
                  View Detailed Sleep Logs
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={() => navigate('/caregiver/messages')}
              className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-300 transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <span className="text-base" style={{ color: '#1f1f3d' }}>
                  Send Encouragement
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={() => navigate('/caregiver/resources')}
              className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-teal-200 bg-teal-50 hover:bg-teal-100 hover:border-teal-300 transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-base" style={{ color: '#1f1f3d' }}>
                  Care Partner Resources
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Get relative time string
 */
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}
