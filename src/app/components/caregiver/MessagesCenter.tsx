import MessagesCenter from '../MessagesCenter';
import CaregiverSidebarShell from './CaregiverSidebarShell';

function CaregiverMessagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <CaregiverSidebarShell>
      <main className="max-w-7xl mx-auto w-full p-6 lg:p-8">
        {children}
      </main>
    </CaregiverSidebarShell>
  );
}

export default function CaregiverMessagesCenter() {
  return (
    <MessagesCenter
      dashboardPath="/caregiver/dashboard"
      layoutComponent={CaregiverMessagesLayout}
      viewMode="notifications"
      pageTitle="Messages"
    />
  );
}