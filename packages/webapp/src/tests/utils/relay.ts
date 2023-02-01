import { createMockEnvironment } from 'relay-test-utils';

import { CurrentUserType } from '../../shared/services/graphqlApi';

export const getRelayEnv = (currentUser: CurrentUserType | null = null) => {
  return createMockEnvironment();
};
