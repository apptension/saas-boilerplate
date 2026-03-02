import { ApolloLink, Observable, Operation, FetchResult } from '@apollo/client';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { ENV } from '@sb/webapp-core/config/env';

import { redirectToLogin } from './apolloClient';

// Maximum WebSocket reconnection attempts before giving up
const MAX_WS_RECONNECTION_ATTEMPTS = 5;
// Track consecutive auth failures to prevent infinite loops
let wsAuthFailureCount = 0;

/**
 * Get the WebSocket URL for GraphQL subscriptions.
 * 
 * For cross-origin deployments (like Render.com), this derives the WebSocket URL
 * from VITE_BASE_API_URL. For same-origin deployments, it uses window.location.
 * 
 * Examples:
 * - VITE_BASE_API_URL="/api" → "wss://current-host/api/graphql/"
 * - VITE_BASE_API_URL="https://backend-api.onrender.com/api" → "wss://backend-api.onrender.com/api/graphql/"
 */
function getWebSocketUrl(): string {
  const baseApiUrl = ENV.BASE_API_URL;
  
  // If BASE_API_URL is a full URL (starts with http:// or https://), derive WS URL from it
  if (baseApiUrl.startsWith('http://') || baseApiUrl.startsWith('https://')) {
    // Replace http(s):// with ws(s)://
    const wsUrl = baseApiUrl.replace(/^http/, 'ws');
    // Ensure it ends with /graphql/
    return wsUrl.endsWith('/') ? `${wsUrl}graphql/` : `${wsUrl}/graphql/`;
  }
  
  // Otherwise, use window.location (same-origin deployment)
  const protocol = window.location.protocol.startsWith('https') ? 'wss' : 'ws';
  return `${protocol}://${window.location.host}${baseApiUrl}/graphql/`;
}

export class WebSocketLink extends ApolloLink {
  subscriptionClient: SubscriptionClient;
  private reconnectionAttempts = 0;

  constructor() {
    super();
    this.subscriptionClient = this.createClient();
  }

  private createClient() {
    const client = new SubscriptionClient(
      getWebSocketUrl(),
      {
        reconnect: true,
        reconnectionAttempts: MAX_WS_RECONNECTION_ATTEMPTS,
        // Exponential backoff for reconnection
        minTimeout: 1000,
        timeout: 30000,
        lazy: true, // Only connect when first subscription is made
        connectionCallback: (error) => {
          if (error) {
            this.handleConnectionError(error);
          } else {
            // Reset failure count on successful connection
            wsAuthFailureCount = 0;
            this.reconnectionAttempts = 0;
          }
        },
      }
    );

    // Handle WebSocket connection errors (including 401)
    client.onError((error) => {
      this.handleConnectionError(error);
    });

    // Track reconnection attempts
    client.onReconnecting(() => {
      this.reconnectionAttempts++;
      
      // If we've hit max attempts, stop trying
      if (this.reconnectionAttempts >= MAX_WS_RECONNECTION_ATTEMPTS) {
        console.warn('[WebSocketLink] Max reconnection attempts reached, closing connection');
        client.close();
      }
    });

    client.onReconnected(() => {
      this.reconnectionAttempts = 0;
      wsAuthFailureCount = 0;
    });

    return client;
  }

  private handleConnectionError(error: any) {
    const errorMessage = error?.message || error?.toString() || '';
    const isAuthError = errorMessage.includes('401') || errorMessage.includes('Unauthorized');

    if (isAuthError) {
      wsAuthFailureCount++;

      // If we've had multiple consecutive auth failures, stop reconnecting and redirect
      if (wsAuthFailureCount >= 2) {
        console.warn('[WebSocketLink] Multiple auth failures, redirecting to login');
        this.subscriptionClient?.close();
        redirectToLogin();
      }
    }
  }

  public reconnect() {
    this.reconnectionAttempts = 0;
    wsAuthFailureCount = 0;
    this.subscriptionClient?.close();
    this.subscriptionClient = this.createClient();
  }

  override request(operation: Operation): Observable<FetchResult> {
    const result = this.subscriptionClient.request(operation);
    // Apollo Client 4 requires Observable, not null
    if (result) {
      return result as Observable<FetchResult>;
    }
    return new Observable(() => {});
  }
}
