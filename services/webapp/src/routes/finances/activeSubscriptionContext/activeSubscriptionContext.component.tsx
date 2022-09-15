import { Outlet } from 'react-router-dom';
import { useActiveSubscriptionQueryLoader } from '../../../shared/hooks/finances/useSubscriptionPlanDetails';

export const ActiveSubscriptionContext = () => {
  const activeSubscriptionDetailsQueryRef = useActiveSubscriptionQueryLoader();

  return <Outlet context={{ ref: activeSubscriptionDetailsQueryRef }} />;
};
