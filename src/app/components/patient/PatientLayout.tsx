import { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';

interface PatientLayoutProps {
  children: ReactNode;
}

export default function PatientLayout({ children }: PatientLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="nondashboard-ds min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      <main className="max-w-7xl mx-auto w-full p-6 lg:p-8">
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1 mb-4 hover:bg-white transition-colors"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft size={18} color="#7200CA" />
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280' }}>Back to Dashboard</span>
        </button>
        {children}
      </main>
    </div>
  );
}