import { ApolloClient, HttpLink, InMemoryCache, Observable, ServerError, from, split } from '@apollo/client';
import { FetchResult } from '@apollo/client/link/core';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition, relayStylePagination } from '@apollo/client/utilities';
import { createUploadLink } from 'apollo-upload-client';
import { createClient } from 'graphql-ws';
import { Kind, OperationTypeNode } from 'graphql/language';

import { ENV } from '../../../app/config/env';
import { SnackbarEmitterActions } from '../../../app/providers/snackbarProvider';
import { refreshToken } from '../api/auth';
import { apiURL } from '../api/helpers';
import { url as contentfulUrl } from '../contentful';

export enum SchemaType {
  API,
  Contentful,
}

type EmitterFunction = (payload: any) => void;

const IS_LOCAL_ENV = ENV.ENVIRONMENT_NAME === 'local';

export class Emitter {
  private listeners: { [key: string]: EmitterFunction[] } = {};

  public addEventListener = (type: string, callback: EmitterFunction) => {
    if (!(type in this.listeners)) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);
  };

  public removeEventListener = (type: string, callback: EmitterFunction) => {
    if (!(type in this.listeners)) {
      return;
    }
    this.listeners[type] = this.listeners[type].filter((listener) => listener !== callback);
  };

  public dispatchEvent = (type: string, payload: any) => {
    if (!(type in this.listeners)) {
      return;
    }
    this.listeners[type].forEach((listener) => listener(payload));
  };
}

export const emitter = new Emitter();

export const subscriptionClient = createClient({
  url: ENV.SUBSCRIPTIONS_URL,
  lazy: true,
  connectionAckWaitTimeout: 15000,
  connectionParams: () => {
    return {};
  },
  on: {
    error: async () => {
      await refreshToken();
    },
  },
});

const httpApiLink = createUploadLink({
  uri: apiURL('/graphql/'),
});

function showNetworkErrorMessage() {
  emitter.dispatchEvent(SnackbarEmitterActions.SNACKBAR_SHOW_MESSAGE, 'Network error occurred');
}

const refreshTokenLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  const callRefresh = (): Observable<FetchResult> | void =>
    new Observable((observer) => {
      (async () => {
        try {
          await refreshToken();

          // Retry the failed request
          const subscriber = {
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          };

          forward(operation).subscribe(subscriber);
        } catch (err) {
          observer.error(err);
        }
      })();
    });
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      switch (err.extensions?.code) {
        case 'UNAUTHENTICATED':
          return callRefresh();
        default:
          IS_LOCAL_ENV && console.log(`[GraphQL error]`, err);
      }
    }
  }

  if (networkError) {
    const result = (networkError as ServerError).result;
    if (result && result?.code?.code === 'token_not_valid') {
      return callRefresh();
    }
    IS_LOCAL_ENV && console.log(`[Network error]: ${networkError}`);
  }
});

const httpContentfulLink = new HttpLink({
  uri: contentfulUrl,
});

const splitHttpLink = split(
  (operation) => {
    const { schemaType = SchemaType.API } = operation.getContext();
    return schemaType === SchemaType.API;
  },
  from([refreshTokenLink, httpApiLink]),
  httpContentfulLink
);

const wsLink = new GraphQLWsLink(subscriptionClient);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === Kind.OPERATION_DEFINITION && definition.operation === OperationTypeNode.SUBSCRIPTION;
  },
  wsLink,
  splitHttpLink
);

const maxRetryAttempts = 5;

const retryLink = new RetryLink({
  delay: () => 1000,
  attempts: (count, operation, error) => {
    if (count === maxRetryAttempts) {
      showNetworkErrorMessage();
    }
    return !!error && count < maxRetryAttempts;
  },
});

export const client = new ApolloClient({
  connectToDevTools: IS_LOCAL_ENV,
  link: from([retryLink, splitLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          allNotifications: relayStylePagination(),
        },
      },
    },
  }),
});

export const invalidateApolloStore = () => {
  client.resetStore();
};
