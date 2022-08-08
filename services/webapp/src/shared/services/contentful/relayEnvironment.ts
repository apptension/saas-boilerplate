import { Environment, RecordSource, Store } from 'relay-runtime';

import { RelayNetworkLayer, retryMiddleware, urlMiddleware } from 'react-relay-network-modern';
import { url } from './client';

const network = new RelayNetworkLayer(
  [
    urlMiddleware({ url }),
    retryMiddleware({
      retryDelays: () => 1000,
      statusCodes: [500, 503, 504],
      allowMutations: true,
      allowFormData: true,
    }),
  ],
  { noThrow: true }
);

export const contentfulRelayEnvironment = new Environment({
  network,
  store: new Store(new RecordSource()),
});
