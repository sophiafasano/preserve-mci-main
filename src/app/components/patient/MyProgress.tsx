import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Moon,
  Award,
  Target,
  BookOpen,
  CheckCircle,
  Clock,
  Star,
  Flame,
  Trophy,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSleepLogs } from '../../hooks/useSleepLogs';
import { useAllModulesProgress } from '../../hooks/useModuleProgress';
import PatientLayout from './PatientLayout';

export default function MyProgress() {
  const navigate = useNavigate();
  const { logs: sleepLogs, stats: sleepStats, getChartData } = useSleepLogs();
  const moduleProgressStats = useAllModulesProgress();
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(30);

  // Get chart data based on selected time range
  const sleepTrendData = useMemo(() => {
    return getChartData(timeRange).map((item, index) => ({
      ...item,
      uniqueId: `${item.fullDate}-${index}`,
    }));
  }, [getChartData, timeRange]);

  // Calculate achievements
  const achievements = useMemo(() => {
    const earned = [];

    // First log achievement
    if (sleepStats.totalLogs >= 1) {
      earned.push({
        id: 'first-log',
        name: 'First Step',
        description: 'Logged your first sleep entry',
        icon: Moon,
        color: 'purple',
        unlocked: true,
      });
    }

    // 7-day streak
    if (sleepStats.currentStreak >= 7) {
      earned.push({
        id: 'week-streak',
        name: '7-Day Streak',
        description: 'Logged sleep for 7 days in a row',
        icon: Flame,
        color: 'orange',
        unlocked: true,
      });
    }

    // 30-day streak
    if (sleepStats.currentStreak >= 30) {
      earned.push({
        id: 'month-streak',
        name: '30-Day Streak',
        description: 'Logged sleep for 30 days in a row',
        icon: Trophy,
        color: 'amber',
        unlocked: true,
      });
    }

    // First module completed
    if ((moduleProgressStats.completedCount || 0) >= 1) {
      earned.push({
        id: 'first-module',
        name: 'Learning Begun',
        description: 'Completed your first module',
        icon: BookOpen,
        color: 'teal',
        unlocked: true,
      });
    }

    // Half modules completed
    if ((moduleProgressStats.completedCount || 0) >= 4) {
      earned.push({
        id: 'halfway',
        name: 'Halfway There',
        description: 'Completed 4 modules',
        icon: Target,
        color: 'purple',
        unlocked: true,
      });
    }

    // All modules completed
    if ((moduleProgressStats.completedCount || 0) === (moduleProgressStats.totalModules || 8)) {
      earned.push({
        id: 'all-modules',
        name: 'Program Complete',
        description: 'Completed all 8 modules',
        icon: Award,
        color: 'amber',
        unlocked: true,
      });
    }

    // Quality sleep
    if (sleepStats.averageQuality >= 8) {
      earned.push({
        id: 'quality-sleep',
        name: 'Quality Rest',
        description: 'Average sleep quality of 8+',
        icon: Star,
        color: 'teal',
        unlocked: true,
      });
    }

    return earned;
  }, [sleepStats, moduleProgressStats]);

  // Calculate weekly summary for past 4 weeks
  const weeklySummary = useMemo(() => {
    const weeks = [];
    const now = new Date();

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekLogs = sleepLogs.filter((log) => {
        const logDate = new Date(log.date);
        return logDate >= weekStart && logDate < weekEnd;
      });

      const avgHours =
        weekLogs.length > 0
          ? weekLogs.reduce((sum, log) => sum + log.hoursSlept, 0) / weekLogs.length
          : 0;

      const avgQuality =
        weekLogs.length > 0
          ? weekLogs.reduce((sum, log) => sum + log.sleepQuality, 0) / weekLogs.length
          : 0;

      weeks.push({
        label: `Week ${4 - i}`,
        logsCount: weekLogs.length,
        avgHours: Number(avgHours.toFixed(1)),
        avgQuality: Number(avgQuality.toFixed(1)),
      });
    }

    return weeks;
  }, [sleepLogs]);

  // Suppress recharts warnings
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

  const progressStats = [
    {
      label: 'Total Sleep Logs',
      value: sleepStats.totalLogs,
      icon: Moon,
      color: 'purple',
      subtext: `${sleepStats.currentStreak} day streak`,
    },
    {
      label: 'Modules Completed',
      value: `${moduleProgressStats.completedCount || 0}/${moduleProgressStats.totalModules || 8}`,
      icon: BookOpen,
      color: 'teal',
      subtext: `${moduleProgressStats.averageProgress || 0}% complete`,
    },
    {
      label: 'Avg Sleep',
      value: sleepStats.averageHours > 0 ? `${sleepStats.averageHours} hrs` : 'No data',
      icon: Clock,
      color: 'purple',
      subtext: sleepStats.averageHours >= 7 ? 'Great!' : 'Keep improving',
    },
    {
      label: 'Achievements',
      value: achievements.length,
      icon: Award,
      color: 'teal',
      subtext: 'Milestones earned',
    },
  ];

  return (
    <PatientLayout>
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A2E' }}>
              My Progress
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
              Track your journey to better sleep
            </p>
          </div>

          <div
            className="flex items-center space-x-2 rounded-[10px] px-4 py-2 bg-white"
            style={{ border: '0.5px solid #E9D5FF' }}
          >
            <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: '#F3F4F6' }}>
              <Trophy size={16} color="#6B7280" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A2E' }}>
              {moduleProgressStats.averageProgress || 0}% Complete
            </span>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {progressStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-[12px] p-5"
                style={{ border: '0.5px solid #E9D5FF' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-[8px] flex items-center justify-center bg-gray-100">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>{stat.label}</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A2E', marginBottom: '2px' }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: '13px', color: '#6B7280' }}>{stat.subtext}</p>
              </div>
            );
          })}
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="bg-white rounded-[12px] p-5" style={{ border: '0.5px solid #E9D5FF' }}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-[8px] bg-gray-100 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1A1A2E' }}>
                  Achievements Unlocked
                </h2>
                <p style={{ fontSize: '14px', color: '#6B7280' }}>
                  {achievements.length} milestone{achievements.length !== 1 ? 's' : ''} earned
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={achievement.id}
                    className="p-4 rounded-[10px] bg-white"
                    style={{ border: '0.5px solid #E9D5FF' }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-[8px] flex items-center justify-center flex-shrink-0 bg-gray-100 text-gray-600">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A2E', marginBottom: '4px' }}>
                          {achievement.name}
                        </h3>
                        <p style={{ fontSize: '14px', color: '#4B5563' }}>{achievement.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sleep Trend Chart */}
        <div className="bg-white rounded-[12px] p-5" style={{ border: '0.5px solid #E9D5FF' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1A1A2E' }}>
                Sleep Trend
              </h2>
              <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
                Your sleep hours over time
              </p>
            </div>

            <div className="flex items-center space-x-2 bg-[#F9FAFB] rounded-[10px] p-1" style={{ border: '0.5px solid #E9D5FF' }}>
              <button
                onClick={() => setTimeRange(7)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  timeRange === 7
                    ? 'bg-[#6D28D9] text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeRange(14)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  timeRange === 14
                    ? 'bg-[#6D28D9] text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                14 Days
              </button>
              <button
                onClick={() => setTimeRange(30)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  timeRange === 30
                    ? 'bg-[#6D28D9] text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                30 Days
              </button>
            </div>
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
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                    tick={{ fill: '#6B7280' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                    tick={{ fill: '#6B7280' }}
                    domain={[0, 10]}
                    ticks={[0, 2, 4, 6, 8, 10]}
                    label={{
                      value: 'Hours',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fill: '#6B7280', fontSize: '12px' },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '0.5px solid #E9D5FF',
                      borderRadius: '10px',
                      padding: '12px',
                    }}
                    labelStyle={{ color: '#1A1A2E', fontWeight: 600 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="#6D28D9"
                    strokeWidth={3}
                    dot={{ fill: '#6D28D9', r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Sleep Hours"
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-[10px] bg-gray-100 flex items-center justify-center mb-4">
                <Moon className="w-10 h-10 text-gray-500" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1A1A2E', marginBottom: '6px' }}>
                No Sleep Data Yet
              </h3>
              <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
                Start logging your sleep to see trends
              </p>
              <Button
                onClick={() => navigate('/patient/dashboard')}
                className="text-white h-12 px-6 rounded-[10px] hover:opacity-90"
                style={{ background: 'linear-gradient(90deg, #6D28D9 0%, #5B21B6 100%)' }}
              >
                Log Sleep Now
              </Button>
            </div>
          )}
        </div>

        {/* Weekly Summary */}
        {weeklySummary.some((w) => w.logsCount > 0) && (
          <div className="bg-white rounded-[12px] p-5" style={{ border: '0.5px solid #E9D5FF' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1A1A2E', marginBottom: '16px' }}>
              4-Week Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {weeklySummary.map((week, index) => (
                <div
                  key={index}
                  className="p-4 rounded-[10px] bg-white"
                  style={{ border: '0.5px solid #E9D5FF' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A2E' }}>
                      {week.label}
                    </h3>
                    <span className="text-xs px-3 py-1 bg-[#F3E8FF] rounded-full text-[#5B21B6]">
                      {week.logsCount} logs
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Avg Sleep</p>
                      <p style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A2E' }}>
                        {week.avgHours > 0 ? `${week.avgHours} hrs` : 'No data'}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Avg Quality</p>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(week.avgQuality / 2)
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Module Progress */}
        <div className="bg-white rounded-[12px] p-5" style={{ border: '0.5px solid #E9D5FF' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1A1A2E', marginBottom: '16px' }}>
            Module Progress
          </h2>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A2E' }}>
                  Overall Completion
                </span>
                <span style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A2E' }}>
                  {moduleProgressStats.averageProgress || 0}%
                </span>
              </div>
              <Progress value={moduleProgressStats.averageProgress || 0} className="h-3" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-[10px] bg-white" style={{ border: '0.5px solid #E9D5FF' }}>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 rounded-[8px] bg-gray-100 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-gray-600" />
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A2E' }}>
                    Completed
                  </h3>
                </div>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A2E' }}>
                  {moduleProgressStats.completedCount || 0}
                </p>
                <p style={{ fontSize: '13px', color: '#6B7280' }}>modules finished</p>
              </div>

              <div className="p-4 rounded-[10px] bg-white" style={{ border: '0.5px solid #E9D5FF' }}>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 rounded-[8px] bg-gray-100 flex items-center justify-center">
                    <Target className="w-4 h-4 text-gray-600" />
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A2E' }}>
                    Remaining
                  </h3>
                </div>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A2E' }}>
                  {(moduleProgressStats.totalModules || 8) - (moduleProgressStats.completedCount || 0)}
                </p>
                <p style={{ fontSize: '13px', color: '#6B7280' }}>modules to go</p>
              </div>
            </div>

            <Button
              onClick={() => navigate('/modules')}
              className="w-full text-white h-12 rounded-[10px] hover:opacity-90"
              style={{ background: 'linear-gradient(90deg, #6D28D9 0%, #5B21B6 100%)' }}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Continue Learning
            </Button>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}