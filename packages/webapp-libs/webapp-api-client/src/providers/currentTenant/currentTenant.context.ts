import React from 'react';

import { TenantListItemFragmentFragment } from '../../graphql';

type CurrentTenantContext = {
  data: TenantListItemFragmentFragment | null;
};

export default React.createContext<CurrentTenantContext>({
  data: null,
});
