import { Environment, Network, Observable, RecordSource, RequestParameters, Store, Variables } from 'relay-runtime';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { FetchFunction } from 'relay-runtime/lib/network/RelayNetworkTypes';
import { graphQlClient } from '../api/client';
import { apiURL } from '../api/helpers';

const subscribe = (() => {
  const SUBSCRIPTIONS_URL = (() => {
    const envValue = process.env['REACT_APP_SUBSCRIPTIONS_URL'];
    if (!envValue) {
      throw new Error('Env variable REACT_APP_SUBSCRIPTIONS_URL not set');
    }
    return envValue;
  })();

  const subscriptionClient = new SubscriptionClient(SUBSCRIPTIONS_URL, {
    reconnect: true,
  });

  return ({ text, name }: RequestParameters, variables: Variables) => {
    const subscribeObservable = subscriptionClient.request({
      query: text === null ? undefined : text,
      operationName: name,
      variables,
    });
    return Observable.from(subscribeObservable as any) as any;
  };
})();

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

export default new Environment({
  network: Network.create(fetchQuery, subscribe),
  store: new Store(new RecordSource()),
});
