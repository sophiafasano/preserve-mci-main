import MessagesCenter from '../MessagesCenter';
import PatientSidebarShell from './PatientSidebarShell';

function PatientMessagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <PatientSidebarShell>
      <main className="max-w-7xl mx-auto w-full p-6 lg:p-8">
        {children}
      </main>
    </PatientSidebarShell>
  );
}

export default function PatientMessagesCenter() {
  return (
    <MessagesCenter
      dashboardPath="/patient/dashboard"
      layoutComponent={PatientMessagesLayout}
      viewMode="notifications"
      pageTitle="Messages"
    />
  );
}