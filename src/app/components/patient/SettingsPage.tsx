import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Bell,
  Moon,
  Clock,
  User,
  Pencil,
  Lock,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  ChevronRight,
  Save,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { useAuth } from '../../contexts/useAuth';
import { useReminders } from '../../hooks/useReminders';
import PatientLayout from './PatientLayout';
import { formatPhoneNumber } from '../../utils/phone';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { preferences, updatePreferences } = useReminders();

  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [mobileNumber, setMobileNumber] = useState(formatPhoneNumber(user?.mobile_number || ''));
  const [isEditingMobile, setIsEditingMobile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [notificationSaved, setNotificationSaved] = useState(false);

  const hasNotificationChanges = JSON.stringify(localPreferences) !== JSON.stringify(preferences);

  useEffect(() => {
    setLocalPreferences(preferences);
    setMobileNumber(formatPhoneNumber(user?.mobile_number || ''));
    setIsEditingMobile(false);
    setProfileSaved(false);
    setNotificationSaved(false);
  }, [preferences, user]);

  const handleProfileSave = async () => {
    const currentMobile = formatPhoneNumber(user?.mobile_number || '');
    if (mobileNumber !== currentMobile) {
      await updateUser({ mobile_number: mobileNumber });
    }
    setIsEditingMobile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleNotificationSave = () => {
    updatePreferences(localPreferences);
    setNotificationSaved(true);
    setTimeout(() => setNotificationSaved(false), 3000);
  };

  const enableMobileEdit = () => {
    setIsEditingMobile(true);
  };

  const handleToggle = (key: keyof typeof localPreferences) => {
    setLocalPreferences({
      ...localPreferences,
      [key]: !localPreferences[key],
    });
  };

  const handleTimeChange = (key: 'sleepLogTime' | 'digestTime', value: string) => {
    setLocalPreferences({
      ...localPreferences,
      [key]: value,
    });
  };

  return (
    <PatientLayout>
      <div className="space-y-6 max-w-4xl" style={{ backgroundColor: '#F9FAFB' }}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="mb-2" style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A2E' }}>
              Settings & Preferences
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280', fontWeight: 400 }}>
              Customize your experience and notification preferences
            </p>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-[12px] p-5" style={{ border: '0.5px solid #E9D5FF' }}>
          <div className="flex items-center space-x-2 mb-5">
            <div className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center" style={{ backgroundColor: '#F3F4F6' }}>
              <User size={18} strokeWidth={1.5} color="#6B7280" />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1A1A2E' }}>
              Profile Information
            </h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-[10px] bg-white" style={{ border: '0.5px solid #E9D5FF' }}>
                <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Name</p>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A2E' }}>
                  {user?.name || 'Not set'}
                </p>
              </div>

              <div className="p-4 rounded-[10px] bg-white" style={{ border: '0.5px solid #E9D5FF' }}>
                <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Email</p>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A2E' }}>
                  {user?.email || 'Not set'}
                </p>
              </div>

              <div className="p-4 rounded-[10px] bg-white" style={{ border: '0.5px solid #E9D5FF' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
                  <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Mobile Number</p>
                  <button
                    type="button"
                    onClick={enableMobileEdit}
                    aria-label="Edit mobile number"
                    className="text-[#7200CA] hover:opacity-80"
                  >
                    <Pencil size={14} strokeWidth={2} />
                  </button>
                </div>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(formatPhoneNumber(e.target.value))}
                  className="w-full"
                  readOnly={!isEditingMobile}
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#1A1A2E',
                    background: 'transparent',
                    border: 'none',
                    padding: '0',
                  }}
                />
              </div>

              <div className="p-4 rounded-[10px] bg-white" style={{ border: '0.5px solid #E9D5FF' }}>
                <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Role</p>
                <p className="capitalize" style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A2E' }}>
                  {user?.role?.replace('_', ' ') || 'Patient'}
                </p>
              </div>

              <div className="p-4 rounded-[10px] bg-white" style={{ border: '0.5px solid #E9D5FF' }}>
                <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Member Since</p>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A2E' }}>
                  {new Date().toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {isEditingMobile && (
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleProfileSave}
                  className="text-white h-10 px-5 rounded-[10px] hover:opacity-90"
                  style={{
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 600,
                    background: 'linear-gradient(90deg, #6D28D9 0%, #5B21B6 100%)',
                  }}
                >
                  {profileSaved ? 'Saved!' : 'Save Profile Changes'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-[12px] p-5" style={{ border: '0.5px solid #E9D5FF' }}>
          <div className="flex items-center space-x-2 mb-5">
            <div className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center" style={{ backgroundColor: '#F3F4F6' }}>
              <Bell size={18} strokeWidth={1.5} color="#6B7280" />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1A1A2E' }}>
              Notification Preferences
            </h2>
          </div>

          <div className="space-y-4">
            {/* Sleep Log Reminders */}
            <div className="flex items-start justify-between p-4 rounded-[10px] bg-white" style={{ border: '0.5px solid #E9D5FF' }}>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Moon size={18} strokeWidth={1.5} color="#6B7280" />
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A2E' }}>
                    Daily Sleep Log Reminders
                  </h3>
                </div>
                <p style={{ fontSize: '14px', color: '#4B5563', marginBottom: '12px' }}>
                  Get reminded to log your sleep each day
                </p>
                {localPreferences.sleepLogReminders && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={localPreferences.sleepLogTime}
                      onChange={(e) => handleTimeChange('sleepLogTime', e.target.value)}
                      className="rounded-lg text-sm"
                      style={{
                        background: '#FFFFFF',
                        border: '0.5px solid #E9D5FF',
                        color: '#1A1A2E',
                        padding: '10px 14px',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                )}
              </div>
              <Switch
                checked={localPreferences.sleepLogReminders}
                onCheckedChange={() => handleToggle('sleepLogReminders')}
              />
            </div>

            {/* Module Reminders */}
            <div className="flex items-start justify-between p-4 rounded-[10px] bg-white" style={{ border: '0.5px solid #E9D5FF' }}>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar size={18} strokeWidth={1.5} color="#6B7280" />
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A2E' }}>
                    Module Completion Reminders
                  </h3>
                </div>
                <p style={{ fontSize: '14px', color: '#4B5563' }}>
                  Receive reminders about incomplete learning modules
                </p>
              </div>
              <Switch
                checked={localPreferences.moduleReminders}
                onCheckedChange={() => handleToggle('moduleReminders')}
              />
            </div>

            {/* Streak Reminders */}
            <div className="flex items-start justify-between p-4 rounded-[10px] bg-white" style={{ border: '0.5px solid #E9D5FF' }}>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle size={18} strokeWidth={1.5} color="#6B7280" />
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A2E' }}>
                    Streak Maintenance
                  </h3>
                </div>
                <p style={{ fontSize: '14px', color: '#4B5563' }}>
                  Get notified when your logging streak is at risk
                </p>
              </div>
              <Switch
                checked={localPreferences.streakReminders}
                onCheckedChange={() => handleToggle('streakReminders')}
              />
            </div>

            {/* Appointment Reminders */}
            <div className="flex items-start justify-between p-4 rounded-[10px] bg-white" style={{ border: '0.5px solid #E9D5FF' }}>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar size={18} strokeWidth={1.5} color="#6B7280" />
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A2E' }}>
                    Appointment Reminders
                  </h3>
                </div>
                <p style={{ fontSize: '14px', color: '#4B5563' }}>
                  Receive reminders about upcoming appointments
                </p>
              </div>
              <Switch
                checked={localPreferences.appointmentReminders}
                onCheckedChange={() => handleToggle('appointmentReminders')}
              />
            </div>

            {/* Daily Digest */}
            <div className="flex items-start justify-between p-4 rounded-[10px] bg-white" style={{ border: '0.5px solid #E9D5FF' }}>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Mail size={18} strokeWidth={1.5} color="#6B7280" />
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A2E' }}>
                    Daily Digest
                  </h3>
                </div>
                <p style={{ fontSize: '14px', color: '#4B5563', marginBottom: '12px' }}>
                  Get a summary of your activity each day
                </p>
                {localPreferences.dailyDigest && (
                  <div className="flex items-center space-x-2">
                    <Clock size={16} strokeWidth={1.5} color="#9CA3AF" />
                    <input
                      type="time"
                      value={localPreferences.digestTime}
                      onChange={(e) => handleTimeChange('digestTime', e.target.value)}
                      className="rounded-lg text-sm"
                      style={{
                        background: '#FFFFFF',
                        border: '0.5px solid #E9D5FF',
                        color: '#1A1A2E',
                        padding: '10px 14px',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                )}
              </div>
              <Switch
                checked={localPreferences.dailyDigest}
                onCheckedChange={() => handleToggle('dailyDigest')}
              />
            </div>
          </div>
        </div>

        {/* Notification Save Button */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => navigate('/patient/dashboard')}
            variant="outline"
            className="h-12 px-6 rounded-[10px] bg-white text-[#7200CA] hover:bg-[#F3E8FF]"
            style={{ border: '1px solid #7200CA', fontSize: '14px', fontWeight: 500 }}
          >
            Cancel
          </Button>

          {hasNotificationChanges && (
            <Button
              onClick={handleNotificationSave}
              className="text-white h-12 px-6 rounded-[10px] hover:opacity-90"
              style={{
                border: 'none',
                fontSize: '14px',
                fontWeight: 600,
                background: 'linear-gradient(90deg, #6D28D9 0%, #5B21B6 100%)',
              }}
            >
              {notificationSaved ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Notification Changes
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </PatientLayout>
  );
}
