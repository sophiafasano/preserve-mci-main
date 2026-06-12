import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Moon,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  Info,
  Star,
  Activity,
  Sun,
  Calendar,
  Send,
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useSleepLogs } from '../../hooks/useSleepLogs';
import { usePatientConnection } from '../../hooks/usePatientConnection';

type InsightType = 'positive' | 'warning' | 'info';

interface Insight {
  type: InsightType;
  title: string;
  message: string;
  action?: string;
  actionUrl?: string;
}

export default function CarePartnerSleepAnalytics() {
  const navigate = useNavigate();
  const { connection } = usePatientConnection();
  const { logs: sleepLogs, stats: sleepStats, getChartData } = useSleepLogs();
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(14);

  const patientName = connection?.patientName || 'Your loved one';
  const firstName = patientName.split(' ')[0];

  const chartData = useMemo(() => getChartData(timeRange), [getChartData, timeRange]);

  // Weekday vs weekend analysis
  const weekdayWeekendData = useMemo(() => {
    if (sleepLogs.length === 0) return null;
    const weekday = sleepLogs.filter((l) => {
      const d = new Date(l.date).getDay();
      return d >= 1 && d <= 5;
    });
    const weekend = sleepLogs.filter((l) => {
      const d = new Date(l.date).getDay();
      return d === 0 || d === 6;
    });
    const avgWeekday =
      weekday.length > 0
        ? weekday.reduce((s, l) => s + l.hoursSlept, 0) / weekday.length
        : 0;
    const avgWeekend =
      weekend.length > 0
        ? weekend.reduce((s, l) => s + l.hoursSlept, 0) / weekend.length
        : 0;
    return { avgWeekday: +avgWeekday.toFixed(1), avgWeekend: +avgWeekend.toFixed(1) };
  }, [sleepLogs]);

  // 4-week breakdown
  const weeklyBreakdown = useMemo(() => {
    const weeks = [];
    const now = new Date();
    for (let w = 3; w >= 0; w--) {
      const start = new Date(now);
      start.setDate(start.getDate() - (w + 1) * 7);
      const end = new Date(now);
      end.setDate(end.getDate() - w * 7);
      const weekLogs = sleepLogs.filter((l) => {
        const d = new Date(l.date);
        return d >= start && d < end;
      });
      const avgHours =
        weekLogs.length > 0
          ? +(weekLogs.reduce((s, l) => s + l.hoursSlept, 0) / weekLogs.length).toFixed(1)
          : 0;
      const avgQuality =
        weekLogs.length > 0
          ? +(weekLogs.reduce((s, l) => s + l.sleepQuality, 0) / weekLogs.length).toFixed(1)
          : 0;
      weeks.push({
        label: w === 0 ? 'This week' : w === 1 ? 'Last week' : `${w + 1} weeks ago`,
        logs: weekLogs.length,
        avgHours,
        avgQuality,
      });
    }
    return weeks;
  }, [sleepLogs]);

  // Trend direction
  const trend = useMemo(() => {
    if (weeklyBreakdown.length < 2) return 'stable';
    const recent = weeklyBreakdown[3].avgHours;
    const prior = weeklyBreakdown[2].avgHours;
    if (recent === 0 || prior === 0) return 'stable';
    const diff = recent - prior;
    if (diff > 0.3) return 'improving';
    if (diff < -0.3) return 'declining';
    return 'stable';
  }, [weeklyBreakdown]);

  // Consistency score
  const consistencyScore = useMemo(() => {
    if (sleepLogs.length < 3) return null;
    const recent = sleepLogs.slice(0, Math.min(14, sleepLogs.length));
    const hours = recent.map((l) => l.hoursSlept);
    const mean = hours.reduce((s, h) => s + h, 0) / hours.length;
    const variance = hours.reduce((s, h) => s + Math.pow(h - mean, 2), 0) / hours.length;
    const stdDev = Math.sqrt(variance);
    return Math.max(0, Math.round(100 - stdDev * 20));
  }, [sleepLogs]);

  // Caregiver-framed insights
  const insights = useMemo((): Insight[] => {
    const result: Insight[] = [];
    if (sleepLogs.length === 0) return result;

    const avg = sleepStats.averageHours;
    const quality = sleepStats.averageQuality;
    const streak = sleepStats.currentStreak;

    if (avg >= 7) {
      result.push({
        type: 'positive',
        title: `${firstName} is hitting the sleep target`,
        message: `Averaging ${avg} hours of sleep — right in the recommended 7–9 hour range. Your support is making a difference.`,
      });
    } else if (avg > 0 && avg < 6) {
      result.push({
        type: 'warning',
        title: `Sleep duration needs support`,
        message: `${firstName} is averaging ${avg} hours, below the 7-hour target. Consider encouraging a consistent wind-down routine each evening.`,
        action: 'Send encouragement',
        actionUrl: '/caregiver/messages',
      });
    }

    if (weekdayWeekendData) {
      const diff = Math.abs(weekdayWeekendData.avgWeekday - weekdayWeekendData.avgWeekend);
      if (diff > 1.5) {
        result.push({
          type: 'warning',
          title: 'Inconsistent weekend sleep',
          message: `${firstName} sleeps ${weekdayWeekendData.avgWeekday}h on weekdays vs ${weekdayWeekendData.avgWeekend}h on weekends — a ${diff.toFixed(1)}-hour gap. Large swings can disrupt sleep rhythm. A consistent bedtime on weekends can help.`,
        });
      } else if (diff < 0.5) {
        result.push({
          type: 'positive',
          title: 'Consistent sleep schedule',
          message: `${firstName} maintains a steady sleep schedule across weekdays and weekends — a key sign of healthy sleep habits.`,
        });
      }
    }

    if (quality >= 8) {
      result.push({
        type: 'positive',
        title: 'Sleep quality is strong',
        message: `${firstName} is rating sleep quality at ${(quality * 10).toFixed(0)}% — well above average. The program techniques appear to be helping.`,
      });
    } else if (quality > 0 && quality < 5) {
      result.push({
        type: 'warning',
        title: 'Sleep quality needs attention',
        message: `${firstName}'s sleep quality average is ${(quality * 10).toFixed(0)}%. Relaxation exercises from the program (like Progressive Muscle Relaxation) may help — encourage them to try.`,
        action: 'Send a tip',
        actionUrl: '/caregiver/messages',
      });
    }

    if (streak >= 7) {
      result.push({
        type: 'positive',
        title: `${streak}-day logging streak`,
        message: `${firstName} has logged sleep for ${streak} days in a row. Consistent tracking is one of the strongest predictors of program success.`,
      });
    } else if (streak === 0 && sleepLogs.length > 0) {
      result.push({
        type: 'warning',
        title: 'Logging streak broken',
        message: `${firstName} missed a recent sleep log. A gentle reminder can help get back on track.`,
        action: 'Send a reminder',
        actionUrl: '/caregiver/messages',
      });
    }

    if (trend === 'improving') {
      result.push({
        type: 'positive',
        title: 'Sleep is improving week-over-week',
        message: `The most recent week shows better sleep hours than the previous week. The program is working — keep providing encouragement.`,
      });
    } else if (trend === 'declining') {
      result.push({
        type: 'warning',
        title: 'Sleep has declined this week',
        message: `${firstName}'s sleep hours dipped compared to last week. This can happen during stressful periods — checking in now is a good idea.`,
        action: 'Check in',
        actionUrl: '/caregiver/messages',
      });
    }

    if (result.length === 0) {
      result.push({
        type: 'info',
        title: 'More data needed for insights',
        message: `Encourage ${firstName} to keep logging sleep. Patterns and personalized insights will appear once there are at least 5–7 entries.`,
      });
    }

    return result;
  }, [sleepLogs, sleepStats, weekdayWeekendData, trend, firstName]);

  useEffect(() => {
    const orig = console.error;
    console.error = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('width(0)')) return;
      orig.apply(console, args);
    };
    return () => { console.error = orig; };
  }, []);

  const TrendIcon = trend === 'improving' ? TrendingUp : trend === 'declining' ? TrendingDown : Minus;
  const trendColor = trend === 'improving' ? 'text-teal-600' : trend === 'declining' ? 'text-red-500' : 'text-gray-500';

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
            Sleep Analytics
          </h1>
          <p className="text-lg text-gray-600">
            {patientName}'s sleep patterns and trends
          </p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mb-4">
            <Moon className="w-6 h-6 text-purple-700" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Avg Sleep</p>
          <p className="text-3xl" style={{ color: '#1f1f3d' }}>
            {sleepStats.averageHours > 0 ? `${sleepStats.averageHours}h` : '—'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Target: 7–9h</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center mb-4">
            <Star className="w-6 h-6 text-teal-700" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Avg Quality</p>
          <p className="text-3xl" style={{ color: '#1f1f3d' }}>
            {sleepStats.averageQuality > 0
              ? `${Math.round(sleepStats.averageQuality * 10)}%`
              : '—'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {sleepStats.averageQuality >= 8 ? 'Excellent' : sleepStats.averageQuality >= 6 ? 'Good' : 'Needs work'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-purple-700" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Consistency</p>
          <p className="text-3xl" style={{ color: '#1f1f3d' }}>
            {consistencyScore !== null ? `${consistencyScore}%` : '—'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Sleep regularity</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center mb-4">
            <TrendIcon className={`w-6 h-6 ${trendColor}`} />
          </div>
          <p className="text-sm text-gray-600 mb-1">Weekly Trend</p>
          <p className={`text-xl capitalize font-medium mt-2 ${trendColor}`}>
            {trend}
          </p>
          <p className="text-sm text-gray-500 mt-1">vs. prior week</p>
        </div>
      </div>

      {/* Sleep Trend Chart */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl mb-1" style={{ color: '#1f1f3d' }}>Sleep Duration Trend</h2>
            <p className="text-base text-gray-600">{patientName}'s nightly sleep hours</p>
          </div>
          <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1">
            {([7, 14, 30] as const).map((d) => (
              <button
                key={d}
                onClick={() => setTimeRange(d)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  timeRange === d ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {chartData.some((d) => d.hasData) ? (
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="date" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 13 }} interval="preserveStartEnd" />
                <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 13 }} domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}
                  labelStyle={{ color: '#1f1f3d', fontWeight: 500 }}
                />
                <ReferenceLine y={7} stroke="#14b8a6" strokeDasharray="6 3" label={{ value: 'Target 7h', fill: '#14b8a6', fontSize: 12 }} />
                <Line type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} activeDot={{ r: 6 }} name="Sleep Hours" isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState name={patientName} />
        )}
      </div>

      {/* Weekday vs Weekend */}
      {weekdayWeekendData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <h2 className="text-2xl mb-2" style={{ color: '#1f1f3d' }}>Weekday vs Weekend</h2>
            <p className="text-base text-gray-600 mb-6">
              Large differences here can indicate irregular sleep rhythm
            </p>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { label: 'Weekdays', hours: weekdayWeekendData.avgWeekday },
                    { label: 'Weekends', hours: weekdayWeekendData.avgWeekend },
                  ]}
                  margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 13 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 13 }} domain={[0, 10]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}
                    formatter={(v: number) => [`${v}h`, 'Avg Sleep']}
                  />
                  <ReferenceLine y={7} stroke="#14b8a6" strokeDasharray="6 3" />
                  <Bar dataKey="hours" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Avg Hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <span className="flex items-center gap-2"><Sun className="w-4 h-4" />Weekdays: <strong>{weekdayWeekendData.avgWeekday}h</strong></span>
              <span className="flex items-center gap-2"><Moon className="w-4 h-4" />Weekends: <strong>{weekdayWeekendData.avgWeekend}h</strong></span>
            </div>
          </div>

          {/* 4-Week Breakdown */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <h2 className="text-2xl mb-2" style={{ color: '#1f1f3d' }}>4-Week Summary</h2>
            <p className="text-base text-gray-600 mb-6">Weekly sleep patterns over the past month</p>
            <div className="space-y-3">
              {weeklyBreakdown.map((week, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    <span className="text-base text-gray-700">{week.label}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-gray-600">{week.logs} log{week.logs !== 1 ? 's' : ''}</span>
                    <span className={`font-medium ${week.avgHours >= 7 ? 'text-teal-600' : week.avgHours > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                      {week.avgHours > 0 ? `${week.avgHours}h avg` : '—'}
                    </span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${s <= Math.round(week.avgQuality / 2) ? 'text-amber-400' : 'text-gray-200'}`}
                          fill={s <= Math.round(week.avgQuality / 2) ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Caregiver Insights */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h2 className="text-2xl mb-2" style={{ color: '#1f1f3d' }}>Insights for You</h2>
        <p className="text-base text-gray-600 mb-6">
          What the data means — and how you can help
        </p>

        {sleepLogs.length === 0 ? (
          <EmptyState name={patientName} />
        ) : (
          <div className="space-y-4">
            {insights.map((insight, i) => {
              const Icon =
                insight.type === 'positive'
                  ? CheckCircle2
                  : insight.type === 'warning'
                  ? AlertCircle
                  : Info;
              const colors = {
                positive: { bg: 'bg-teal-50', border: 'border-teal-200', icon: 'bg-teal-100 text-teal-700', title: 'text-teal-800' },
                warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'bg-amber-100 text-amber-700', title: 'text-amber-800' },
                info: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'bg-purple-100 text-purple-700', title: 'text-purple-800' },
              }[insight.type];

              return (
                <div key={i} className={`${colors.bg} border ${colors.border} rounded-2xl p-5`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.icon}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className={`text-base font-medium mb-1 ${colors.title}`}>{insight.title}</p>
                      <p className="text-sm text-gray-700">{insight.message}</p>
                      {insight.action && insight.actionUrl && (
                        <button
                          onClick={() => navigate(insight.actionUrl!)}
                          className="mt-3 flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-800 transition-colors"
                        >
                          <Send className="w-4 h-4" />
                          {insight.action}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
        <Moon className="w-10 h-10 text-purple-400" />
      </div>
      <h3 className="text-xl mb-2" style={{ color: '#1f1f3d' }}>No Sleep Data Yet</h3>
      <p className="text-base text-gray-600 max-w-sm">
        Analytics will appear here once {name} starts logging sleep. Encourage them to log tonight!
      </p>
    </div>
  );
}
