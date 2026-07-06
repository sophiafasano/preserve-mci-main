import { ReactNode } from 'react';
import PatientSidebarShell from './PatientSidebarShell';

interface PatientLayoutProps {
  children: ReactNode;
}

export default function PatientLayout({ children }: PatientLayoutProps) {
  return (
    <PatientSidebarShell>
      <main className="max-w-7xl mx-auto w-full p-6 lg:p-8">
        {children}
      </main>
    </PatientSidebarShell>
  );
}