import { Outlet } from 'react-router-dom';

import { useActiveSubscriptionQueryLoader } from '../hooks/useSubscriptionPlanDetails';
import { ActiveSubscriptionDetailsContextType } from './activeSubscriptionContext.hooks';

export const ActiveSubscriptionContext = () => {
  const activeSubscriptionData = useActiveSubscriptionQueryLoader();

  return <Outlet context={{ ...(activeSubscriptionData as ActiveSubscriptionDetailsContextType) }} />;
};
