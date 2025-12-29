import { ApolloLink, Observable, Operation, FetchResult } from '@apollo/client';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { RoutesConfig } from '@sb/webapp-core/config/routes';

/**
 * Redirects to the login page when authentication fails.
 * Extracts the current locale from the URL and constructs the login path.
 */
const redirectToLogin = () => {
  // Extract locale from current pathname (e.g., /en/... or /pl/...)
  const pathname = window.location.pathname;
  const localeMatch = pathname.match(/^\/([a-z]{2})\//);
  const locale = localeMatch ? localeMatch[1] : 'en'; // Default to 'en' if no locale found
  
  // Construct login path with locale
  const loginPath = `/${locale}/${RoutesConfig.login}`;
  
  // Check if we're already on the login page to avoid redirect loops
  if (!pathname.includes('/auth/login')) {
    // Force a full page reload to clear any cached state
    window.location.href = loginPath;
  }
};

export class WebSocketLink extends ApolloLink {
  subscriptionClient: SubscriptionClient;

  constructor() {
    super();
    this.subscriptionClient = this.createClient();
  }

  private createClient() {
    const client = new SubscriptionClient(
      `${window.location.protocol.startsWith('https') ? 'wss' : 'ws'}://${window.location.host}/api/graphql/`,
      {
        reconnect: true,
      }
    );
    
    // Handle WebSocket connection errors (including 401)
    client.onError((error) => {
      // Check if it's an authentication error
      const errorMessage = error?.message || error?.toString() || '';
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        redirectToLogin();
      }
    });
    
    return client;
  }

  public reconnect() {
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
