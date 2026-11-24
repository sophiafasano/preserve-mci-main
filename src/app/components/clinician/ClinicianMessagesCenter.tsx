import MessagesCenter from '../MessagesCenter';

function PlainLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default function ClinicianMessagesCenter() {
  return (
    <MessagesCenter
      dashboardPath="/clinician"
      layoutComponent={PlainLayout}
    />
  );
}
