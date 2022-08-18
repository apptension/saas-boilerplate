import { ReactNode } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';

import { relayEnvironment } from '../../shared/services/graphqlApi/relayEnvironment';

export const RelayProvider = ({ children }: { children: ReactNode }) => (
  <RelayEnvironmentProvider environment={relayEnvironment}>{children}</RelayEnvironmentProvider>
);
