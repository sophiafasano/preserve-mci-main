import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Moon,
  TrendingUp,
  Calendar,
  ChevronLeft,
  Star,
  Clock,
  FileText,
  BarChart3,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Button } from '../ui/button';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSleepLogs } from '../../hooks/useSleepLogs';
import { usePatientConnection } from '../../hooks/usePatientConnection';

export default function PatientSleepLogs() {
  const navigate = useNavigate();
  const { connection } = usePatientConnection();
  const { logs: sleepLogs, stats: sleepStats, getChartData } = useSleepLogs();
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart');

  const sortedLogs = useMemo(() => {
    return [...sleepLogs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [sleepLogs]);

  // Get chart data for last 30 days
  const sleepTrendData = useMemo(() => {
    return getChartData(30).map((item, index) => ({
      ...item,
      uniqueId: `${item.fullDate}-${index}`,
    }));
  }, [getChartData]);

  // Suppress recharts warnings (known library issues)
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
      {/* Header */}
      <div className="flex items-center justify-between">
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
              Sleep Logs
            </h1>
            <p className="text-lg text-gray-600">
              {connection?.patientName || "Patient's"} sleep tracking history
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setViewMode('chart')}
            className={`px-4 py-2 rounded-lg text-base transition-colors ${
              viewMode === 'chart'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-5 h-5 inline-block mr-2" />
            Charts
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg text-base transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-5 h-5 inline-block mr-2" />
            List
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
              <Moon className="w-6 h-6 text-purple-700" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Sleep Logs</p>
          <p className="text-3xl" style={{ color: '#1f1f3d' }}>
            {sleepStats.totalLogs}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center">
              <Clock className="w-6 h-6 text-teal-700" />
            </div>
            <div
              className={`flex items-center space-x-1 text-sm px-3 py-1 rounded-full ${
                sleepStats.averageHours >= 7
                  ? 'bg-teal-50 text-teal-600'
                  : 'bg-amber-50 text-amber-600'
              }`}
            >
              {sleepStats.averageHours >= 7 ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              <span>{sleepStats.averageHours >= 7 ? 'Good' : 'Below'}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Avg Sleep</p>
          <p className="text-3xl" style={{ color: '#1f1f3d' }}>
            {sleepStats.averageHours > 0 ? `${sleepStats.averageHours} hrs` : 'No data'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-700" />
            </div>
            <div
              className={`flex items-center space-x-1 text-sm px-3 py-1 rounded-full ${
                sleepStats.averageQuality >= 8
                  ? 'bg-teal-50 text-teal-600'
                  : 'bg-amber-50 text-amber-600'
              }`}
            >
              {sleepStats.averageQuality >= 8 ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              <span>{sleepStats.averageQuality >= 8 ? 'Great' : 'Fair'}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Avg Quality</p>
          <p className="text-3xl" style={{ color: '#1f1f3d' }}>
            {sleepStats.averageQuality > 0
              ? `${Math.round(sleepStats.averageQuality * 10)}%`
              : 'No data'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-teal-700" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Current Streak</p>
          <p className="text-3xl" style={{ color: '#1f1f3d' }}>
            {sleepStats.currentStreak} day{sleepStats.currentStreak !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {viewMode === 'chart' ? (
        <>
          {/* Daily Sleep Hours Chart */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <div className="mb-6">
              <h2 className="text-2xl mb-1" style={{ color: '#1f1f3d' }}>
                Daily Sleep Hours
              </h2>
              <p className="text-base text-gray-600">Last 30 days</p>
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
                <p className="text-base text-gray-600">
                  Sleep logs will appear here once tracking begins
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="mb-6">
            <h2 className="text-2xl mb-1" style={{ color: '#1f1f3d' }}>
              Sleep Log History
            </h2>
            <p className="text-base text-gray-600">
              All recorded sleep sessions
            </p>
          </div>

          {sortedLogs.length > 0 ? (
            <div className="space-y-3">
              {sortedLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-5 rounded-xl bg-gray-50 border border-gray-200 hover:border-purple-200 hover:bg-purple-50 transition-all"
                >
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-purple-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <p className="text-lg" style={{ color: '#1f1f3d' }}>
                          {new Date(log.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{log.hoursSlept} hours</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4" />
                          <span>Quality: {log.sleepQuality}/10</span>
                        </div>
                      </div>
                      {log.notes && (
                        <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-200">
                          {log.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end ml-4">
                    <div
                      className={`px-3 py-1 rounded-full text-sm ${
                        log.hoursSlept >= 7
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {log.hoursSlept >= 7 ? 'Good' : 'Below target'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
                <Moon className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl mb-2" style={{ color: '#1f1f3d' }}>
                No Sleep Logs Yet
              </h3>
              <p className="text-base text-gray-600">
                Sleep logs will appear here once tracking begins
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}