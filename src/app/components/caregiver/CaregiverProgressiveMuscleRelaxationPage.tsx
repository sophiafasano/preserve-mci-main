import { useNavigate } from 'react-router';
import { ArrowLeft, Play } from 'lucide-react';
import CaregiverSidebarShell from './CaregiverSidebarShell';

export default function CaregiverProgressiveMuscleRelaxation() {
  const navigate = useNavigate();

  return (
    <CaregiverSidebarShell>
      <div className="min-h-screen px-6 py-8 lg:px-10" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="mx-auto max-w-6xl">
          <button
            onClick={() => navigate('/caregiver/modules')}
            className="mb-6 inline-flex items-center gap-1.5 hover:opacity-90"
            style={{ color: '#7200CA', fontSize: '13px', fontWeight: 500 }}
          >
            <ArrowLeft size={16} />
            <span>Back to Modules</span>
          </button>

          <div className="rounded-[12px] bg-white p-6" style={{ border: '0.5px solid #E9D5FF' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A2E' }}>
              Progressive Muscle Relaxation
            </h1>
            <p className="mt-1" style={{ fontSize: '14px', color: '#6B7280' }}>
              Placeholder player for this resource. The final video will be added later.
            </p>

            <div
              className="relative mt-5 overflow-hidden rounded-[12px]"
              style={{ backgroundColor: '#1A1A2E', aspectRatio: '16 / 9' }}
            >
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/Pgay-cVYLjI?si=UJ9qRfNJTi4-fBTh"
                title="Progressive Muscle Relaxation"
                allow="acceleromete; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                />
            </div>
          </div>
        </div>
      </div>
    </CaregiverSidebarShell>
  );
}
