import { createMockEnvironment } from 'relay-test-utils';

import { fillCommonQueryWithUser } from '../../shared/utils/commonQuery';
import { CurrentUserType } from '../../shared/services/graphqlApi';

export const getRelayEnv = (currentUser: CurrentUserType | null = null) => {
  const relayEnvironment = createMockEnvironment();
  fillCommonQueryWithUser(relayEnvironment, currentUser);
  return relayEnvironment;
};
