import { TenantListItemFragmentFragment } from '@sb/webapp-api-client/graphql';
import React from 'react';

type CurrentTenantContext = {
  data: TenantListItemFragmentFragment | null;
};

export default React.createContext<CurrentTenantContext>({
  data: null,
});
