import { Outlet } from 'react-router-dom';

import { useActiveSubscriptionQueryLoader } from '../../hooks';

export const ActiveSubscriptionContext = () => {
  const activeSubscriptionData = useActiveSubscriptionQueryLoader();

  return <Outlet context={{ ...activeSubscriptionData }} />;
};
