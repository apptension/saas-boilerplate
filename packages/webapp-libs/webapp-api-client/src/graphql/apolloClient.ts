import { ApolloClient, HttpLink, InMemoryCache, Observable, ServerError, from, split } from '@apollo/client';
import { GraphQLErrors, NetworkError } from '@apollo/client/errors';
import { FetchResult } from '@apollo/client/link/core';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition, relayStylePagination } from '@apollo/client/utilities';
import { ENV } from '@sb/webapp-core/config/env';
import { ToastEmitterActions } from '@sb/webapp-core/toast';
import { createUploadLink } from 'apollo-upload-client';
import { createClient } from 'graphql-ws';
import { Kind, OperationTypeNode } from 'graphql/language';

import { apiURL, auth } from '../api';
import { Emitter } from '../utils/eventEmitter';
import { SchemaType } from './types';

const IS_LOCAL_ENV = ENV.ENVIRONMENT_NAME === 'local';

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
      await auth.refreshToken();
    },
  },
});

const httpApiLink = createUploadLink({
  uri: apiURL('/graphql/'),
});

function showNetworkErrorMessage() {
  emitter.dispatchEvent(ToastEmitterActions.ADD_TOAST, {
    description: 'Network error occurred',
    variant: 'destructive',
  });
}

const handleApiErrors = (
  callRefresh: () => Observable<FetchResult> | void,
  graphQLErrors?: GraphQLErrors,
  networkError?: NetworkError
) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      switch (err.extensions?.['code']) {
        case 'UNAUTHENTICATED':
          return callRefresh();
        default:
          IS_LOCAL_ENV && console.log(`[GraphQL error]`, err);
      }
    }
  }

  if (networkError) {
    const result = (networkError as ServerError).result;
    if (typeof result !== 'string') {
      if (result && result?.['code']?.code === 'token_not_valid') {
        return callRefresh();
      }
    }
    IS_LOCAL_ENV && console.log(`[Network error]: ${networkError}`);
  }
};

const refreshTokenLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  const callRefresh = (): Observable<FetchResult> | void =>
    new Observable((observer) => {
      (async () => {
        try {
          await auth.refreshToken();

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

  return handleApiErrors(callRefresh, graphQLErrors, networkError);
});

const httpContentfulLink = new HttpLink({
  uri: `https://graphql.contentful.com/content/v1/spaces/${ENV.CONTENTFUL_SPACE}/environments/${ENV.CONTENTFUL_ENV}?access_token=${ENV.CONTENTFUL_TOKEN}`,
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
  client.stop();
  client.resetStore();
};
