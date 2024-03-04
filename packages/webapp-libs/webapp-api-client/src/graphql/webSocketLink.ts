import { ApolloLink, Observable, Operation } from '@apollo/client';
import { FetchResult } from '@apollo/client/link/core';
import { SubscriptionClient } from 'subscriptions-transport-ws';

export class WebSocketLink extends ApolloLink {
  subscriptionClient: SubscriptionClient;

  constructor() {
    super();
    this.subscriptionClient = this.createClient();
  }

  private createClient() {
    return new SubscriptionClient(
      `${window.location.protocol.startsWith('https') ? 'wss' : 'ws'}://${window.location.host}/api/graphql/`,
      {
        reconnect: true,
      }
    );
  }

  public reconnect() {
    this.subscriptionClient?.close();
    this.subscriptionClient = this.createClient();
  }

  override request(operation: Operation): Observable<FetchResult> | null {
    return this.subscriptionClient.request(operation) as Observable<FetchResult> | null;
  }
}
