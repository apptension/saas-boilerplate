import { Environment, Network, Observable, RecordSource, RequestParameters, Store, Variables } from 'relay-runtime';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { fetchGraphQL } from './fetchGraphQL';

const subscribe = (() => {
  const SUBSCRIPTIONS_URL = (() => {
    const envValue = process.env['REACT_APP_SUBSCRIPTIONS_URL'] ?? 'wss://app.qa.saas.apptoku.com/ws';
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

const fetchQuery = async (params: RequestParameters, variables: Variables) => fetchGraphQL(params.text, variables);

export default new Environment({
  network: Network.create(fetchQuery, subscribe),
  store: new Store(new RecordSource()),
});
