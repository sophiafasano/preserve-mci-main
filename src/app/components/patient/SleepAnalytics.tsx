import { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Moon,
  Star,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle,
  Info,
  ChevronRight,
} from 'lucide-react';
import { Progress } from '../ui/progress';
import { useSleepLogs } from '../../hooks/useSleepLogs';
import { calculateSleepAnalytics } from '../../utils/sleepAnalytics';
import PatientLayout from './PatientLayout';

export default function SleepAnalytics() {
  const { logs } = useSleepLogs();

  const sampleLogs = useMemo(() => {
    const now = new Date();
    const hours = [6.4, 6.9, 7.1, 7.4, 7.0, 7.3, 7.6, 7.2, 7.5, 7.8, 7.1, 7.4, 7.7, 7.3];
    const quality = [6, 6, 7, 7, 8, 8, 9, 8, 8, 9, 7, 8, 9, 8];

    return hours.map((hrs, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() - ((hours.length - 1) - index));
      return {
        id: `sample_${index}`,
        date: date.toISOString(),
        hoursSlept: hrs,
        sleepQuality: quality[index],
        notes: '',
      };
    });
  }, []);

  const isSamplePreview = logs.length === 0;

  const analyticsSource = isSamplePreview ? sampleLogs : logs;
  const analytics = useMemo(() => calculateSleepAnalytics(analyticsSource), [analyticsSource]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return CheckCircle;
      case 'warning':
        return AlertCircle;
      case 'info':
        return Info;
      default:
        return Info;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
          return <TrendingUp className="w-5 h-5 text-gray-600" />;
      case 'declining':
          return <TrendingDown className="w-5 h-5 text-gray-600" />;
      default:
        return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'Improving';
      case 'declining':
        return 'Needs Attention';
      default:
        return 'Stable';
    }
  };

  return (
    <PatientLayout>
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A2E' }}>
            Sleep Analytics & Insights
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
            Detailed analysis of your sleep patterns and personalized recommendations
          </p>
          {isSamplePreview && (
            <p style={{ fontSize: '12px', color: '#6D28D9', marginTop: '8px' }}>
              Showing sample preview data. Log sleep entries to see your personal analytics.
            </p>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-[12px] p-5" style={{ border: '0.5px solid #E9D5FF' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-[8px] bg-gray-100 flex items-center justify-center">
                <Moon className="w-5 h-5 text-gray-600" />
              </div>
              {getTrendIcon(analytics.patterns.trend)}
            </div>
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Average Sleep</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A2E', marginBottom: '2px' }}>
              {analytics.averageHours} hrs
            </p>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>
              Target: {analytics.patterns.optimalRange.min}-{analytics.patterns.optimalRange.max} hrs
            </p>
          </div>

          <div className="bg-white rounded-[12px] p-5" style={{ border: '0.5px solid #E9D5FF' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-[8px] bg-gray-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Average Quality</p>
            <div className="flex items-center space-x-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(analytics.averageQuality / 2)
                    ? 'text-gray-600 fill-gray-600'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>
              {analytics.averageQuality.toFixed(1)} / 10
            </p>
          </div>

          <div className="bg-white rounded-[12px] p-5" style={{ border: '0.5px solid #E9D5FF' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-[8px] bg-gray-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Consistency Score</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A2E', marginBottom: '8px' }}>
              {analytics.patterns.consistencyScore}
            </p>
            <Progress value={analytics.patterns.consistencyScore} className="h-2" />
          </div>

          <div className="bg-white rounded-[12px] p-5" style={{ border: '0.5px solid #E9D5FF' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-[8px] bg-gray-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Total Entries</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A2E', marginBottom: '2px' }}>
              {analytics.totalLogs}
            </p>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>
              {analytics.currentStreak} day streak
            </p>
          </div>
        </div>

        {/* Sleep Trend Analysis */}
        <div className="bg-white rounded-[12px] p-5" style={{ border: '0.5px solid #E9D5FF' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1A1A2E', marginBottom: '16px' }}>
            Sleep Pattern Analysis
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-[10px] bg-white" style={{ border: '0.5px solid #E9D5FF' }}>
              <div className="flex items-center space-x-2 mb-3">
                <Moon className="w-4 h-4 text-gray-600" />
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A2E' }}>
                  Weekday Average
                </h3>
              </div>
              <p style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A2E', marginBottom: '2px' }}>
                {analytics.patterns.weekdayAverage > 0 
                  ? `${analytics.patterns.weekdayAverage} hrs`
                  : 'No data'
                }
              </p>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>Mon-Fri sleep duration</p>
            </div>

            <div className="p-4 rounded-[10px] bg-white" style={{ border: '0.5px solid #E9D5FF' }}>
              <div className="flex items-center space-x-2 mb-3">
                <Moon className="w-4 h-4 text-gray-600" />
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A2E' }}>
                  Weekend Average
                </h3>
              </div>
              <p style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A2E', marginBottom: '2px' }}>
                {analytics.patterns.weekendAverage > 0 
                  ? `${analytics.patterns.weekendAverage} hrs`
                  : 'No data'
                }
              </p>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>Sat-Sun sleep duration</p>
            </div>

            <div className="p-4 rounded-[10px] bg-white" style={{ border: '0.5px solid #E9D5FF' }}>
              <div className="flex items-center space-x-2 mb-3">
                {getTrendIcon(analytics.patterns.trend)}
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A2E' }}>
                  Overall Trend
                </h3>
              </div>
              <p style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A2E', marginBottom: '2px' }}>
                {getTrendLabel(analytics.patterns.trend)}
              </p>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>
                {analytics.patterns.trend === 'improving' 
                  ? 'Sleep duration is increasing'
                  : analytics.patterns.trend === 'declining'
                  ? 'Sleep duration is decreasing'
                  : 'Sleep duration is consistent'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Comparison */}
        {analytics.weeklyComparison.some(w => w.logsCount > 0) && (
          <div className="bg-white rounded-[12px] p-5" style={{ border: '0.5px solid #E9D5FF' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1A1A2E', marginBottom: '16px' }}>
              4-Week Comparison
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {analytics.weeklyComparison.map((week, index) => (
                <div
                  key={index}
                  className="p-4 rounded-[10px] bg-white"
                  style={{ border: '0.5px solid #E9D5FF' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A2E' }}>
                      {week.week}
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
                              ? 'text-gray-600 fill-gray-600'
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

        {/* Personalized Insights */}
        {analytics.insights.length > 0 && (
          <div className="bg-white rounded-[12px] p-5" style={{ border: '0.5px solid #E9D5FF' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1A1A2E', marginBottom: '16px' }}>
              Personalized Insights & Recommendations
            </h2>
            
            <div className="space-y-4">
              {analytics.insights.map((insight, index) => {
                const Icon = getInsightIcon(insight.type);
                
                return (
                  <div
                    key={index}
                    className="p-4 rounded-[10px] bg-white"
                    style={{ border: '0.5px solid #E9D5FF' }}
                  >
                    <div className="flex items-start space-x-4">
                      <div
                        className="w-10 h-10 rounded-[8px] flex items-center justify-center flex-shrink-0 bg-gray-100 text-gray-600"
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A2E', marginBottom: '4px' }}>
                          {insight.title}
                        </h3>
                        <p style={{ fontSize: '14px', color: '#4B5563', marginBottom: '8px' }}>
                          {insight.description}
                        </p>
                        {insight.recommendation && (
                          <div className="flex items-start space-x-2 p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                            <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                            <p style={{ fontSize: '13px', color: '#374151' }}>
                              <strong>Recommendation:</strong> {insight.recommendation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </PatientLayout>
  );
}
