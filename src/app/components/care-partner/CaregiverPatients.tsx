import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  Users,
  Search,
  X,
  UserPlus,
  AlertTriangle,
  Loader2,
  Star,
  Inbox,
} from 'lucide-react';
import { useCaregiverPatients } from '../../hooks/useCaregiverPatients';
import { useMessaging } from '../../hooks/useMessaging';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const RELATIONSHIP_TYPES = [
  'spouse',
  'child',
  'parent',
  'sibling',
  'friend',
  'family member',
  'other',
];

export default function CaregiverPatients() {
  const navigate = useNavigate();
  const { patients, stats, addPatient, searchUnassignedPatients } = useCaregiverPatients();
  const { sendMessage } = useMessaging();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalResults, setModalResults] = useState<{ id: string; full_name: string; email: string }[]>([]);
  const [modalSearching, setModalSearching] = useState(false);
  const [modalSearchError, setModalSearchError] = useState<string | null>(null);
  const [selectedRelationship, setSelectedRelationship] = useState('family member');
  const [addingId, setAddingId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!showAddModal) {
      setModalSearch('');
      setModalResults([]);
      setModalSearchError(null);
      setSelectedRelationship('family member');
    }
  }, [showAddModal]);

  useEffect(() => {
    if (!modalSearch.trim()) {
      setModalResults([]);
      setModalSearchError(null);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setModalSearching(true);
      try {
        const results = await searchUnassignedPatients(modalSearch);
        setModalResults(results);
        setModalSearchError(null);
      } catch (error: any) {
        setModalResults([]);
        setModalSearchError(
          error?.message || 'Unable to search patients right now. Please try again.'
        );
      } finally {
        setModalSearching(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [modalSearch, searchUnassignedPatients]);

  const handleAdd = async (patientId: string, patientName: string) => {
    setAddingId(patientId);
    try {
      await addPatient(patientId, selectedRelationship);

      let messageSent = false;
      try {
        await sendMessage(
          patientId,
          `Hi! I've connected to your care program as your ${selectedRelationship}. I'm here to support you on your sleep wellness journey.`
        );
        messageSent = true;
      } catch {
        messageSent = false;
      }

      if (messageSent) {
        toast.success(`${patientName} has been added and notified.`);
      } else {
        toast.success(`${patientName} has been added to your patients.`);
        toast.error('Welcome message was not sent. You can message the patient from their profile.');
      }

      setShowAddModal(false);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to add patient. Please try again.');
    } finally {
      setAddingId(null);
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const token = { white: '#FFFFFF', purple100: '#F3E9FB' };
  const cardStyle = {
    backgroundColor: token.white,
    border: `0.5px solid ${token.purple100}`,
    borderRadius: '14px',
    padding: '18px 20px',
  };

  const renderStars = (quality?: number) => {
    if (quality == null) return <span className="text-[#9CA3AF] text-[12px]">—</span>;
    const stars = Math.round(quality / 2);
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={12}
            fill={s <= stars ? '#F59E0B' : 'none'}
            color={s <= stars ? '#F59E0B' : '#D1D5DB'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-[700] text-[#1A1A2E] mb-1">My Patients</h1>
          <p className="text-[14px] text-[#6B7280] font-[400]">
            Monitor and support your connected patients.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-[14px] font-[500] transition-all hover:brightness-95 shrink-0"
          style={{ backgroundColor: '#6D28D9' }}
        >
          <UserPlus size={16} strokeWidth={1.5} />
          Add Patient
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: 'Total', value: stats.totalPatients, sub: 'Connected patients' },
          { label: 'Active', value: stats.activePatients, sub: 'Active this week' },
          { label: 'Need Attention', value: stats.patientsNeedingAttention, sub: 'Inactive > 3 days' },
        ].map((s) => (
          <div key={s.label} style={cardStyle}>
            <p className="text-[13px] text-[#6B7280] mb-1">{s.label}</p>
            <p className="text-[28px] font-[500] text-[#1A1A2E] leading-none">{s.value}</p>
            <p className="text-[12px] text-[#9CA3AF] mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={cardStyle} className="!p-3">
        <div className="relative">
          <Search
            size={16}
            strokeWidth={1.5}
            color="#9CA3AF"
            className="absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            type="text"
            placeholder="Search patients by name or email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#F9FAFB] border border-[#F3E9FB] text-[14px] text-[#1A1A2E] placeholder-[#9CA3AF] outline-none focus:border-[#6D28D9]"
          />
        </div>
      </div>

      {/* Patient List */}
      <div style={cardStyle} className="!p-0 overflow-hidden">
        {filteredPatients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-8">
            <div className="w-14 h-14 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-3">
              <Inbox size={24} strokeWidth={1.5} color="#9CA3AF" />
            </div>
            <p className="text-[14px] text-[#6B7280] mb-1">
              {searchQuery ? 'No patients found' : 'No patients connected yet'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-4 py-2 rounded-lg text-[13px] font-[500] text-white"
                style={{ backgroundColor: '#6D28D9' }}
              >
                Add your first patient
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#F3E9FB]">
            {filteredPatients.map((patient) => {
              const daysSince = patient.lastActive
                ? Math.floor(
                    (Date.now() - new Date(patient.lastActive).getTime()) / 86400000
                  )
                : 999;
              const needsAttention = daysSince > 3;

              return (
                <button
                  key={patient.patientId}
                  onClick={() => navigate(`/caregiver/patients/${patient.patientId}`)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#FAFAFA] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[14px] font-[500] text-[#1A1A2E]">{patient.name}</p>
                        {needsAttention && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-[500] bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle size={10} strokeWidth={2} />
                            Needs attention
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#9CA3AF]">{patient.email}</p>
                      <p className="text-[12px] text-[#9CA3AF] capitalize">{patient.relationshipType}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-4 shrink-0">
                    <div>{renderStars(patient.avgSleepQuality)}</div>
                    <p className="text-[12px] text-[#9CA3AF]">
                      {patient.avgSleepHours != null
                        ? `${patient.avgSleepHours.toFixed(1)}h avg`
                        : 'No logs'}
                    </p>
                    <p className="text-[11px] text-[#C4B5FD]">
                      {patient.lastActive
                        ? `Active ${formatDistanceToNow(new Date(patient.lastActive), { addSuffix: true })}`
                        : 'Never active'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-md rounded-[16px] p-6 shadow-xl"
            style={{ backgroundColor: '#FFFFFF', border: '0.5px solid #F3E9FB' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-[10px] bg-[#F3F4F6] flex items-center justify-center">
                  <Users size={18} strokeWidth={1.5} color="#6B7280" />
                </div>
                <h2 className="text-[18px] font-[600] text-[#1A1A2E]">Add a Patient</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg hover:bg-[#F3E8FF] transition-colors"
              >
                <X size={18} strokeWidth={1.5} color="#6B7280" />
              </button>
            </div>

            {/* Relationship type */}
            <div className="mb-4">
              <label className="block text-[12px] text-[#6B7280] mb-1.5 font-[500]">
                Your relationship to the patient
              </label>
              <select
                value={selectedRelationship}
                onChange={(e) => setSelectedRelationship(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[#F3E9FB] bg-white text-[14px] text-[#1A1A2E] outline-none focus:border-[#6D28D9]"
              >
                {RELATIONSHIP_TYPES.map((r) => (
                  <option key={r} value={r} className="capitalize">
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="mb-3">
              <label className="block text-[12px] text-[#6B7280] mb-1.5 font-[500]">
                Search by patient name or email
              </label>
              <div className="relative">
                <Search
                  size={16}
                  strokeWidth={1.5}
                  color="#9CA3AF"
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                />
                <input
                  type="text"
                  placeholder="Type a name or email…"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#F3E9FB] text-[14px] text-[#1A1A2E] placeholder-[#9CA3AF] outline-none focus:border-[#6D28D9]"
                  autoFocus
                />
                {modalSearching && (
                  <Loader2
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#9CA3AF]"
                  />
                )}
              </div>
            </div>

            {modalSearchError && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                <p className="text-[12px] text-red-700">{modalSearchError}</p>
              </div>
            )}

            {/* Results */}
            <div className="max-h-48 overflow-y-auto rounded-lg border border-[#F3E9FB]">
              {modalResults.length === 0 && modalSearch.trim() && !modalSearching ? (
                <div className="py-8 text-center">
                  <p className="text-[13px] text-[#9CA3AF]">No patients found</p>
                </div>
              ) : modalResults.length === 0 && !modalSearch.trim() ? (
                <div className="py-8 text-center">
                  <p className="text-[13px] text-[#9CA3AF]">Type to search for patients</p>
                </div>
              ) : (
                modalResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between px-4 py-3 border-b border-[#F3E9FB] last:border-0 hover:bg-[#FAFAFA]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                        {result.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[13px] font-[500] text-[#1A1A2E]">{result.full_name}</p>
                        <p className="text-[11px] text-[#9CA3AF]">{result.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAdd(result.id, result.full_name)}
                      disabled={addingId === result.id}
                      className="px-3 py-1.5 rounded-lg text-[12px] font-[500] text-white transition-all disabled:opacity-60"
                      style={{ backgroundColor: '#6D28D9' }}
                    >
                      {addingId === result.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        'Connect'
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowAddModal(false)}
              className="mt-4 w-full py-2 rounded-lg text-[14px] font-[500] text-[#6B7280] hover:bg-[#F3E8FF] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
