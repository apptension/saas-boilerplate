import {
  commitLocalUpdate,
  Environment,
  Network,
  Observable,
  RecordSource,
  RequestParameters,
  Store,
  Variables,
} from 'relay-runtime';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { FetchFunction } from 'relay-runtime/lib/network/RelayNetworkTypes';
import { RecordSourceSelectorProxy } from 'relay-runtime/lib/store/RelayStoreTypes';
import { graphQlClient } from '../api/client';
import { apiURL } from '../api/helpers';
import { refreshToken } from '../api/auth';
import { ENV } from '../../../app/config/env';

export const subscriptionClient = new SubscriptionClient(ENV.SUBSCRIPTIONS_URL, {
  reconnect: true,
  lazy: true,
  minTimeout: 10000,
});

subscriptionClient.onError(async () => {
  await refreshToken();
});

const subscribe = ({ text, name }: RequestParameters, variables: Variables) => {
  const subscribeObservable = subscriptionClient.request({
    query: text === null ? undefined : text,
    operationName: name,
    variables,
  });
  return Observable.from(subscribeObservable as any) as any;
};

const fetchQuery: FetchFunction = async (operation, variables, cacheConfig, uploadables) => {
  const body = (() => {
    if (uploadables) {
      const formData = new FormData();
      formData.append('query', operation.text ?? '');
      formData.append('variables', JSON.stringify(variables));

      Object.entries(uploadables).forEach(([key, value]) => {
        formData.append(key, value);
      });

      return formData;
    }

    return { query: operation.text, variables };
  })();

  const { data } = await graphQlClient.post(apiURL('/graphql/'), body);
  return data;
};

export const relayEnvironment = new Environment({
  network: Network.create(fetchQuery, subscribe),
  store: new Store(new RecordSource()),
});

export const invalidateRelayStore = () => {
  commitLocalUpdate(relayEnvironment, (store) => {
    (store as RecordSourceSelectorProxy).invalidateStore();
  });
};
