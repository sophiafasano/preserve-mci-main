import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/useAuth';
import { User, Pencil } from 'lucide-react';
import { formatPhoneNumber } from '../../utils/phone';

export default function CaregiverSettingsPage() {
  const { user, updateUser } = useAuth();
  const [mobileNumber, setMobileNumber] = useState(formatPhoneNumber(user?.mobile_number || ''));
  const [isEditingMobile, setIsEditingMobile] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMobileNumber(formatPhoneNumber(user?.mobile_number || ''));
    setIsEditingMobile(false);
  }, [user]);

  const handleSave = async () => {
    const currentMobile = formatPhoneNumber(user?.mobile_number || '');
    if (mobileNumber !== currentMobile) {
      await updateUser({ mobile_number: mobileNumber });
    }
    setIsEditingMobile(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="mb-2" style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A2E' }}>
            Settings & Preferences
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', fontWeight: 400 }}>
            Manage your care partner account
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[12px] p-5" style={{ border: '0.5px solid #E9D5FF' }}>
        <div className="flex items-center space-x-2 mb-5">
          <div
            className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center"
            style={{ backgroundColor: '#F3F4F6' }}
          >
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
                  onClick={() => setIsEditingMobile(true)}
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
                {user?.role?.replace('_', ' ') || 'Care Partner'}
              </p>
            </div>
          </div>

          {isEditingMobile && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 text-white rounded-md transition-colors"
                style={{ backgroundColor: '#6D28D9' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#5B21B6')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6D28D9')}
              >
                {saved ? 'Saved!' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
