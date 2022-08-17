import {
  commitLocalUpdate,
  Environment,
  Observable,
  RecordSource,
  RequestParameters,
  Store,
  Variables,
} from 'relay-runtime';
import {
  authMiddleware,
  RelayNetworkLayer,
  retryMiddleware,
  urlMiddleware,
} from 'react-relay-network-modern';
import { createClient } from 'graphql-ws';

import { RecordSourceSelectorProxy } from 'relay-runtime/lib/store/RelayStoreTypes';
import { apiURL } from '../api/helpers';
import { refreshToken } from '../api/auth';
import { ENV } from '../../../app/config/env';

export const subscriptionClient = createClient({
  url: ENV.SUBSCRIPTIONS_URL,
  lazy: true,
  connectionAckWaitTimeout: 10000,
  connectionParams: () => {
    return {};
  },
});

const subscribe = ({ text, name }: RequestParameters, variables: Variables) => {
  return Observable.create((sink) => {
    if (!text) {
      return sink.error(new Error('Operation text cannot be empty'));
    }
    return subscriptionClient.subscribe(
      {
        operationName: name,
        query: text,
        variables,
      },
      sink
    );
  });
};

const network = new RelayNetworkLayer(
  [
    urlMiddleware({ url: apiURL('/graphql/') }),
    retryMiddleware({
      retryDelays: () => 1000,
      statusCodes: [500, 503, 504],
      allowMutations: true,
      allowFormData: true,
    }),
    authMiddleware({
      allowEmptyToken: true,
      tokenRefreshPromise: async () => {
        await refreshToken();
        return '';
      },
    }),
  ],
  // @ts-ignore
  { noThrow: true, subscribeFn: subscribe }
);

export const relayEnvironment = new Environment({
  network,
  store: new Store(new RecordSource()),
});

export const invalidateRelayStore = () => {
  commitLocalUpdate(relayEnvironment, (store) => {
    (store as RecordSourceSelectorProxy).invalidateStore();
  });
};
