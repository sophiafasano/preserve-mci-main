import { ReactNode } from 'react';
import CaregiverSidebarShell from './CaregiverSidebarShell';

interface CaregiverLayoutProps {
  children: ReactNode;
}

export default function CaregiverLayout({ children }: CaregiverLayoutProps) {
  return (
    <CaregiverSidebarShell>
      <main className="max-w-7xl mx-auto w-full p-6 lg:p-8">
        {children}
      </main>
    </CaregiverSidebarShell>
  );
}