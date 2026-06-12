import MessagesCenter from '../MessagesCenter';
import CarePartnerLayout from './CarePartnerLayout';

export default function CarePartnerMessagesCenter() {
  return (
    <MessagesCenter
      dashboardPath="/caregiver"
      layoutComponent={CarePartnerLayout}
    />
  );
}
