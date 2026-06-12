import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Bell,
  Moon,
  BookOpen,
  Calendar,
  Flame,
  MessageSquare,
  Check,
  X,
  Trash2,
  Settings as SettingsIcon,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useReminders } from '../../hooks/useReminders';
import { useSleepLogs } from '../../hooks/useSleepLogs';
import { useAllModulesProgress } from '../../hooks/useModuleProgress';
import { getReminderColor, getReminderIcon } from '../../utils/reminders';
import PatientLayout from './PatientLayout';
import { formatDistanceToNow } from 'date-fns';

export default function RemindersCenter() {
  const navigate = useNavigate();
  const {
    reminders,
    activeCount,
    completeReminder,
    dismissReminder,
    deleteReminder,
    refreshAutomaticReminders,
  } = useReminders();

  const { logs, stats } = useSleepLogs();
  const moduleProgress = useAllModulesProgress();

  // Refresh automatic reminders on mount and periodically
  useEffect(() => {
    const lastLogDate = logs.length > 0 
      ? logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
      : null;

    const incompleteModules = (moduleProgress.totalModules || 8) - (moduleProgress.completedCount || 0);

    refreshAutomaticReminders(lastLogDate, stats.currentStreak, incompleteModules);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs.length, stats.currentStreak, moduleProgress.completedCount]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'sleep_log':
        return Moon;
      case 'module_completion':
        return BookOpen;
      case 'appointment':
        return Calendar;
      case 'streak_maintenance':
        return Flame;
      case 'check_in':
        return MessageSquare;
      default:
        return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'from-red-50 to-red-100 border-red-300';
      case 'medium':
        return 'from-amber-50 to-amber-100 border-amber-300';
      case 'low':
        return 'from-blue-50 to-blue-100 border-blue-300';
      default:
        return 'from-gray-50 to-gray-100 border-gray-300';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const handleReminderAction = (reminder: any) => {
    if (reminder.actionUrl) {
      navigate(reminder.actionUrl);
      completeReminder(reminder.id);
    }
  };

  if (reminders.length === 0) {
    return (
      <PatientLayout>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl mb-6" style={{ color: '#1f1f3d' }}>
            Reminders & Notifications
          </h1>
          
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-teal-400" />
            </div>
            <h3 className="text-xl mb-2" style={{ color: '#1f1f3d' }}>
              All Caught Up!
            </h3>
            <p className="text-base text-gray-600 mb-6">
              You have no active reminders at the moment
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button
                onClick={() => navigate('/patient/dashboard')}
                variant="outline"
                className="h-12 px-6 rounded-xl border-2 border-gray-300 hover:bg-gray-50"
              >
                Back to Dashboard
              </Button>
              <Button
                onClick={() => navigate('/patient/settings')}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white h-12 px-6 rounded-xl"
              >
                <SettingsIcon className="w-5 h-5 mr-2" />
                Manage Preferences
              </Button>
            </div>
          </div>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2" style={{ color: '#1f1f3d' }}>
              Reminders & Notifications
            </h1>
            <p className="text-lg text-gray-600">
              {activeCount} active reminder{activeCount !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            onClick={() => navigate('/patient/settings')}
            variant="outline"
            className="h-12 px-6 rounded-xl border-2 border-gray-300 hover:bg-gray-50"
          >
            <SettingsIcon className="w-5 h-5 mr-2" />
            Preferences
          </Button>
        </div>

        {/* Reminders List */}
        <div className="space-y-4">
          {reminders.map((reminder) => {
            const Icon = getIcon(reminder.type);
            const priorityColor = getPriorityColor(reminder.priority);
            const badgeColor = getPriorityBadgeColor(reminder.priority);

            return (
              <div
                key={reminder.id}
                className={`bg-gradient-to-br ${priorityColor} border-2 rounded-2xl p-6 transition-all hover:shadow-md`}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-white bg-opacity-70 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-purple-700" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-xl mb-1" style={{ color: '#1f1f3d' }}>
                          {reminder.title}
                        </h3>
                        <p className="text-base text-gray-700 mb-3">
                          {reminder.message}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs border ${badgeColor} ml-4 whitespace-nowrap`}>
                        {reminder.priority} priority
                      </span>
                    </div>

                    {/* Due Date/Time */}
                    {(reminder.dueDate || reminder.dueTime) && (
                      <div className="flex items-center space-x-2 mb-3 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          {reminder.dueDate && new Date(reminder.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                          {reminder.dueTime && ` at ${reminder.dueTime}`}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                      {reminder.actionUrl && (
                        <Button
                          onClick={() => handleReminderAction(reminder)}
                          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white h-10 px-4 rounded-lg"
                        >
                          {reminder.actionLabel || 'Take Action'}
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => completeReminder(reminder.id)}
                        variant="outline"
                        className="h-10 px-4 rounded-lg border-2 hover:bg-white"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Complete
                      </Button>
                      
                      <Button
                        onClick={() => dismissReminder(reminder.id)}
                        variant="ghost"
                        className="h-10 px-4 rounded-lg hover:bg-white hover:bg-opacity-70"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Dismiss
                      </Button>

                      <Button
                        onClick={() => deleteReminder(reminder.id)}
                        variant="ghost"
                        className="h-10 px-3 rounded-lg hover:bg-white hover:bg-opacity-70 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Created time */}
                    <p className="text-xs text-gray-500 mt-3">
                      Created {formatDistanceToNow(new Date(reminder.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-center">
          <Button
            onClick={() => navigate('/patient/dashboard')}
            variant="outline"
            className="h-12 px-6 rounded-xl border-2 border-gray-300 hover:bg-gray-50"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </PatientLayout>
  );
}