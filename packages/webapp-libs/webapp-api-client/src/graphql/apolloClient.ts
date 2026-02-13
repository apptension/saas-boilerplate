import { ApolloClient, FetchResult, HttpLink, InMemoryCache, Observable, from, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { getMainDefinition, relayStylePagination } from '@apollo/client/utilities';
import { ENV } from '@sb/webapp-core/config/env';
import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { ToastEmitterActions } from '@sb/webapp-core/toast';
// @ts-ignore - Type declaration in apollo-upload-client.d.ts
import UploadHttpLink from 'apollo-upload-client/UploadHttpLink.mjs';
import { GraphQLFormattedError } from 'graphql';
import { Kind, OperationTypeNode } from 'graphql/language';

import { apiURL, auth } from '../api';
import { Emitter } from '../utils/eventEmitter';
import { SchemaType } from './types';
import { WebSocketLink } from './webSocketLink';

const IS_LOCAL_ENV = ENV.ENVIRONMENT_NAME === 'local';

export const emitter = new Emitter();

// Flag to prevent multiple redirects in quick succession
let redirectingToLogin = false;
let redirectTimeout: NodeJS.Timeout | null = null;

// Flag to track if we're currently refreshing to prevent infinite loops
let isRefreshing = false;
// Queue of pending requests waiting for token refresh
let pendingRequests: Array<() => void> = [];

// Interface for Apollo client methods we need for auth cleanup
interface ApolloClientLike {
  stop: () => void;
  clearStore: () => Promise<unknown[]>;
}

// Reference to Apollo client for cache clearing (set after client is created)
let apolloClientRef: ApolloClientLike | null = null;

/**
 * Set Apollo client reference for cache clearing on auth failure
 */
export const setApolloClientRef = (clientInstance: ApolloClientLike) => {
  apolloClientRef = clientInstance;
};

/**
 * Redirects to the login page when authentication fails.
 * Extracts the current locale from the URL and constructs the login path.
 * Preserves the current URL as a redirect parameter for post-login navigation.
 * Clears Apollo cache and auth data before redirecting.
 */
export const redirectToLogin = () => {
  // Prevent multiple redirects in quick succession
  if (redirectingToLogin) {
    return;
  }

  // Extract locale from current pathname (e.g., /en/... or /pl/...)
  const pathname = window.location.pathname;
  const localeMatch = pathname.match(/^\/([a-z]{2})\//);
  const locale = localeMatch ? localeMatch[1] : 'en'; // Default to 'en' if no locale found

  // Check if we're already on the login page or logout page to avoid issues
  if (pathname.includes('/auth/login') || pathname.includes('/auth/logout')) {
    // For logout page, just redirect to login without a redirect param
    if (pathname.includes('/auth/logout')) {
      const loginPath = `/${locale}/${RoutesConfig.login}`;
      redirectingToLogin = true;
      setTimeout(() => {
        window.location.replace(loginPath);
      }, 100);
    }
    return;
  }

  // Preserve current URL as redirect parameter (include pathname and search params)
  const currentUrl = pathname + window.location.search;
  const redirectParam = encodeURIComponent(currentUrl);

  // Construct login path with locale and redirect parameter
  const loginPath = `/${locale}/${RoutesConfig.login}?redirect=${redirectParam}`;

  // Set flag to prevent multiple redirects
  redirectingToLogin = true;

  // Clear any existing timeout
  if (redirectTimeout) {
    clearTimeout(redirectTimeout);
  }

  // Clear Apollo cache to prevent stale data on next login
  // Using clearStore() instead of resetStore() to avoid triggering refetches
  if (apolloClientRef) {
    try {
      apolloClientRef.stop(); // Stop all active queries
      apolloClientRef.clearStore().catch(() => {
        // Ignore cache clear errors
      });
    } catch {
      // Ignore errors
    }
  }

  // Clear any stale authentication data from storage
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    sessionStorage.clear();
  } catch {
    // Ignore storage errors (e.g., in private browsing mode)
  }

  // Call logout endpoint to properly clear session cookies (including HTTP-only cookies)
  // This ensures the backend clears all auth cookies and blacklists the refresh token
  // Fire logout request but don't wait - redirect immediately to prevent further 401s
  auth.logout().catch(() => {
    // Ignore logout errors - we'll redirect anyway
    // The logout might fail if the session is already invalid, which is fine
  });

  // Use replace instead of href to prevent back button issues
  // Redirect immediately - page reload will stop all operations and clear cache
  // Small delay ensures logout request is sent before redirect
  setTimeout(() => {
    window.location.replace(loginPath);
  }, 100);
};

const httpApiLink = new UploadHttpLink({
  uri: apiURL('/graphql/'),
  credentials: 'include', // Required for cookie-based authentication
});

/**
 * Auth link that adds Authorization header from localStorage as fallback.
 *
 * This is essential for Safari and mobile browsers that block third-party cookies
 * due to Intelligent Tracking Prevention (ITP). When cookies are blocked,
 * we fall back to sending the access token via Authorization header.
 *
 * The backend accepts both:
 * 1. Cookie-based auth (via JSONWebTokenCookieAuthentication)
 * 2. Header-based auth (via JWTAuthentication with Authorization: Bearer token)
 */
const authLink = setContext((_, { headers }) => {
  // Get token from localStorage (set by login, SSO callback, etc.)
  const token = localStorage.getItem('token');

  // Return headers with Authorization if token exists
  // Cookies are still sent via credentials: 'include', so this is additive
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

// Helper function to check if an error is a 401
const is401Error = (error: any): boolean => {
  if (!error) return false;

  // Check various possible status code locations
  const statusCode =
    error.statusCode ||
    error.status ||
    error.response?.status ||
    (error.response instanceof Response ? error.response.status : null) ||
    (error instanceof Response ? error.status : null);

  // Check error message - ServerError from Apollo often has "status code 401" in message
  const errorMessage = error.message || error.toString() || '';

  // Check if error has a result with status
  if (error.result && typeof error.result === 'object') {
    if (error.result.status === 401) return true;
  }

  // Check for ServerError with status code in message
  const isServerError = error.name === 'ServerError' || errorMessage.includes('ServerError');
  const has401InMessage = errorMessage.includes('401') || errorMessage.includes('status code 401');

  return (
    statusCode === 401 ||
    (isServerError && has401InMessage) ||
    errorMessage.includes('Unauthorized') ||
    (error.response && error.response.status === 401)
  );
};

function showNetworkErrorMessage() {
  emitter.dispatchEvent(ToastEmitterActions.ADD_TOAST, {
    description: 'Network error occurred',
    variant: 'destructive',
  });
}

const handleApiErrors = (
  callRefresh: () => Observable<FetchResult> | void,
  graphQLErrors?: ReadonlyArray<GraphQLFormattedError>,
  networkError?: Error | null
) => {
  // Check for UNAUTHENTICATED GraphQL errors
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      switch (err.extensions?.['code']) {
        case 'UNAUTHENTICATED':
          IS_LOCAL_ENV && console.log('[handleApiErrors] UNAUTHENTICATED error, attempting refresh');
          return callRefresh();
        default:
          IS_LOCAL_ENV && console.log(`[GraphQL error]`, err);
      }
    }
  }

  // Check for 401 network errors - try refresh instead of immediate redirect
  if (networkError && is401Error(networkError)) {
    IS_LOCAL_ENV && console.log('[handleApiErrors] 401 error detected, attempting token refresh');
    return callRefresh();
  }

  if (networkError) {
    // Apollo Client 4: ServerError structure may have changed
    const serverError = networkError as any;

    if (serverError.result && typeof serverError.result !== 'string') {
      if (serverError.result?.['code']?.code === 'token_not_valid') {
        IS_LOCAL_ENV && console.log('[handleApiErrors] Token not valid, attempting refresh');
        return callRefresh();
      }
    }
    IS_LOCAL_ENV && console.log(`[Network error]: ${networkError}`);
  }
};

const refreshTokenLink = onError((error: any) => {
  let { graphQLErrors, networkError, operation, forward } = error;
  
  if (!networkError && error.error) {
    networkError = error.error;
  }

  const callRefresh = (): Observable<FetchResult> | void =>
    new Observable((observer) => {
      // If we're already refreshing, queue this request
      if (isRefreshing) {
        IS_LOCAL_ENV && console.log('[refreshTokenLink] Already refreshing, queueing request');
        pendingRequests.push(() => {
          const subscriber = {
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          };
          forward(operation).subscribe(subscriber);
        });
        return;
      }

      isRefreshing = true;
      IS_LOCAL_ENV && console.log('[refreshTokenLink] Starting token refresh');

      (async () => {
        try {
          await auth.refreshToken();
          IS_LOCAL_ENV && console.log('[refreshTokenLink] Token refresh successful');

          // Process any queued requests
          pendingRequests.forEach((callback) => callback());
          pendingRequests = [];

          // Retry the failed request
          const subscriber = {
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          };

          forward(operation).subscribe(subscriber);
        } catch (err) {
          IS_LOCAL_ENV && console.log('[refreshTokenLink] Token refresh failed, redirecting to login', err);

          // Clear pending requests
          pendingRequests = [];

          // If refresh token fails, redirect to login
          // Page reload will clear cache automatically
          redirectToLogin();
          observer.error(err);
        } finally {
          isRefreshing = false;
        }
      })();
    });

  return handleApiErrors(callRefresh, graphQLErrors, networkError);
});

const httpContentfulLink = new HttpLink({
  uri: `https://graphql.contentful.com/content/v1/spaces/${ENV.CONTENTFUL_SPACE}/environments/${ENV.CONTENTFUL_ENV}?access_token=${ENV.CONTENTFUL_TOKEN}`,
});

// Chain: refreshTokenLink -> authLink (adds Authorization header) -> httpApiLink
const apiLinkChain = from([refreshTokenLink, authLink, httpApiLink]);
const splitHttpLink = split(
  (operation) => {
    const { schemaType = SchemaType.API } = operation.getContext();
    return schemaType === SchemaType.API;
  },
  apiLinkChain as any,
  httpContentfulLink
);

const wsLink = new WebSocketLink();

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
    // Don't retry on 401 errors - let the refreshTokenLink handle them
    if (error && is401Error(error)) {
      IS_LOCAL_ENV && console.log('[RetryLink] 401 error detected, skipping retry (handled by refreshTokenLink)');
      return false; // Don't retry - refreshTokenLink will handle this
    }

    if (count === maxRetryAttempts) {
      showNetworkErrorMessage();
    }
    return !!error && count < maxRetryAttempts;
  },
});

export const client = new ApolloClient({
  devtools: {
    enabled: IS_LOCAL_ENV,
  },
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

// Set client reference for cache clearing on auth failure
setApolloClientRef(client);

export const invalidateApolloStore = () => {
  wsLink.reconnect();
  client.stop();
  client.resetStore();
};
