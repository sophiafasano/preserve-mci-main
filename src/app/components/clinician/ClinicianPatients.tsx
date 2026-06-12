import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, AlertTriangle, Users, ChevronRight, Clock, ArrowLeft, Plus, UserPlus } from 'lucide-react';
import { useClinicianPatients, ClinicianPatient } from '../../hooks/useClinicianPatients';
import { useMessaging } from '../../hooks/useMessaging';
import { toast } from 'sonner';

const token = {
  white: '#FFFFFF',
  purple100: '#F3E9FB',
  purple700: '#6D28D9',
  gray50: '#F9FAFB',
  gray400: '#9CA3AF',
  gray600: '#6B7280',
  text: '#1A1A2E',
};

const cardStyle = {
  backgroundColor: token.white,
  border: `0.5px solid ${token.purple100}`,
  borderRadius: '14px',
};

const riskConfig = {
  high: { label: 'High', bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA' },
  medium: { label: 'Medium', bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
  low: { label: 'Low', bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' },
};

export default function ClinicianPatients() {
  const navigate = useNavigate();
  const { patients, loading, stats, updatePatient, addPatient, searchUnassignedPatients } = useClinicianPatients();

  const { sendMessage } = useMessaging();

  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [newPatientSearch, setNewPatientSearch] = useState('');
  const [unassignedPatients, setUnassignedPatients] = useState<ClinicianPatient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const now = new Date();

  useEffect(() => {
    if (!newPatientSearch.trim()) {
      setUnassignedPatients([]);
      setSearchError(null);
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchUnassignedPatients(newPatientSearch);
        setUnassignedPatients(results);
        setSearchError(null);
      } catch (error: any) {
        setUnassignedPatients([]);
        setSearchError(error?.message || 'Unable to search patients right now.');
      } finally {
        setIsSearching(false);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [newPatientSearch, searchUnassignedPatients]);

  const filteredUnassigned = unassignedPatients.filter(p => !patients.some(ep => ep.id === p.id || ep.email === p.email));

  const handleAddPatient = async (patientInfo: ClinicianPatient) => {
    try {
      await addPatient(patientInfo);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to assign patient. Please try again.');
      return;
    }

    let messageSent = false;
    try {
      await sendMessage(
        patientInfo.id,
        'A clinician has been assigned to support your sleep program. You can now receive messages and clinical recommendations through the app.'
      );
      messageSent = true;
    } catch {
      messageSent = false;
    }

    if (messageSent) {
      toast.success(`${patientInfo.name} has been assigned to you and notified.`);
    } else {
      toast.success(`${patientInfo.name} has been assigned to you.`);
      toast.error('Patient notification message was not sent. You can message them from their profile.');
    }

    setIsAddPatientOpen(false);
    setNewPatientSearch('');
    setSearchError(null);
  };

  const filtered = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = riskFilter === 'all' || p.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const getDaysSince = (dateStr: string) =>
    Math.floor((now.getTime() - new Date(dateStr).getTime()) / 86400000);

  return (
    <div className="space-y-6">
      {/* Back to Dashboard */}
      <button
        onClick={() => navigate('/clinician')}
        className="inline-flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white transition-colors"
        aria-label="Back to Dashboard"
      >
        <ArrowLeft size={18} color="#7200CA" />
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280' }}>Back to Dashboard</span>
      </button>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[22px] font-[700] text-[#1A1A2E] mb-1">My Patients</h1>
          <p className="text-[14px] text-[#6B7280] font-[400]">
            Manage and monitor all patients enrolled in your program.
          </p>
        </div>
        <button 
          onClick={() => setIsAddPatientOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-700 text-white rounded-lg text-sm font-medium hover:bg-purple-800 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add Patient
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.totalPatients, icon: Users, iconColor: token.gray600 },
          { label: 'Active', value: stats.activePatients, icon: Clock, iconColor: token.gray600 },
          { label: 'Inactive', value: stats.inactivePatients, icon: Clock, iconColor: token.gray600 },
          { label: 'Need Attention', value: stats.patientsNeedingAttention, icon: AlertTriangle, iconColor: token.gray600 },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} style={cardStyle} className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-[#F3F4F6] flex items-center justify-center flex-shrink-0">
                <Icon size={16} strokeWidth={1.5} color={card.iconColor} />
              </div>
              <div>
                <p className="text-[20px] font-[500] text-[#1A1A2E] leading-none">{card.value}</p>
                <p className="text-[12px] text-[#9CA3AF] mt-0.5">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div style={cardStyle} className="p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} strokeWidth={1.5} color="#9CA3AF" className="absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-[13px] rounded-lg border border-[#E5E7EB] outline-none focus:border-[#6D28D9] transition-colors"
            style={{ backgroundColor: token.gray50 }}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['all', 'high', 'medium', 'low'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setRiskFilter(level)}
              className="px-3 py-2 rounded-lg text-[12px] font-[500] transition-all capitalize"
              style={{
                backgroundColor: riskFilter === level ? '#6D28D9' : token.gray50,
                color: riskFilter === level ? token.white : token.gray600,
                border: `0.5px solid ${riskFilter === level ? '#6D28D9' : '#E5E7EB'}`,
              }}
            >
              {level === 'all' ? 'All Risks' : `${level.charAt(0).toUpperCase() + level.slice(1)} Risk`}
            </button>
          ))}
        </div>
      </div>

      {/* Patient List */}
      <div style={cardStyle} className="overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin mb-3" />
            <p className="text-[13px] text-[#9CA3AF]">Loading patients…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-3">
              <Users size={20} strokeWidth={1.5} color="#9CA3AF" />
            </div>
            <p className="text-[14px] text-[#6B7280]">No patients found.</p>
          </div>
        ) : (
          <ul>
            {filtered.map((patient, idx) => {
              const risk = riskConfig[patient.riskLevel];
              const daysSince = getDaysSince(patient.lastActive);
              const needsAttention = daysSince >= 8 || patient.riskLevel === 'high';

              return (
                <li
                  key={patient.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-[#F9F5FF] transition-colors cursor-pointer"
                  style={{ borderBottom: idx < filtered.length - 1 ? `0.5px solid ${token.purple100}` : 'none' }}
                  onClick={() => navigate(`/clinician/patients/${patient.id}`)}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-[14px] font-[600] flex-shrink-0">
                    {patient.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-[500] text-[#1A1A2E] truncate">{patient.name}</p>
                      {needsAttention && (
                        <span className="flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
                          <AlertTriangle size={10} strokeWidth={2} />
                          Needs attention
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-[#9CA3AF] truncate">{patient.email}</p>
                  </div>

                  {/* Meta */}
                  <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-[12px] text-[#9CA3AF]">Last active</p>
                      <p className="text-[13px] text-[#1A1A2E]">
                        {daysSince === 0 ? 'Today' : daysSince === 1 ? 'Yesterday' : `${daysSince}d ago`}
                      </p>
                    </div>

                    <select
                      value={patient.riskLevel}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        updatePatient(patient.id, { riskLevel: e.target.value as 'low' | 'medium' | 'high' });
                      }}
                      className="text-[11px] font-[500] px-2.5 py-1 rounded-full cursor-pointer outline-none appearance-none text-center"
                      style={{ backgroundColor: risk.bg, color: risk.color, border: `0.5px solid ${risk.border}`, minWidth: '80px' }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <ChevronRight size={16} strokeWidth={1.5} color="#9CA3AF" className="flex-shrink-0" />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Add Patient Modal */}
      {isAddPatientOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl border border-gray-100 flex flex-col max-h-[80vh]">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add Patient</h3>
              <button
                onClick={() => {
                  setIsAddPatientOpen(false);
                  setSearchError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-5 border-b border-gray-100">
              <div className="relative">
                <Search size={16} strokeWidth={1.5} color="#9CA3AF" className="absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search unassigned patients by name or email..."
                  value={newPatientSearch}
                  onChange={(e) => setNewPatientSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-[14px] rounded-lg border border-[#E5E7EB] outline-none focus:border-[#6D28D9] focus:ring-1 focus:ring-purple-700 transition-all"
                  style={{ backgroundColor: token.gray50 }}
                />
              </div>
            </div>

            {searchError && (
              <div className="px-5 pt-4 pb-0">
                <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-[12px] text-red-700">{searchError}</p>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {isSearching ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">Searching...</p>
                </div>
              ) : newPatientSearch.trim() === '' ? (
                <div className="text-center py-8">
                  <Search size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">Type a name to search for patients.</p>
                </div>
              ) : filteredUnassigned.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No unassigned patients found matching "{newPatientSearch}".</p>
                </div>
              ) : (
                filteredUnassigned.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-medium">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.email}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAddPatient(p)}
                      className="px-3 py-1.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-md hover:bg-purple-200 transition-colors"
                    >
                      Assign
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
