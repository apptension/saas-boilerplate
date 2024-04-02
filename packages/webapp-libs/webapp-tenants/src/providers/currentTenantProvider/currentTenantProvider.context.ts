import { CommonQueryTenantItemFragmentFragment } from '@sb/webapp-api-client/graphql';
import React from 'react';

type CurrentTenantContext = {
  data: CommonQueryTenantItemFragmentFragment | null;
};

export default React.createContext<CurrentTenantContext>({
  data: null,
});
