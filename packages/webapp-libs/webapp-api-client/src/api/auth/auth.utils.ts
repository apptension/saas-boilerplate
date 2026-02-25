/**
 * Store auth tokens in localStorage for Safari/mobile fallback.
 * Safari and iOS block third-party cookies (ITP), so we use the Authorization
 * header as backup (tokens sent via Apollo authLink).
 *
 * Used by: login form, passkey login, SSO callback, OTP validation, token refresh.
 */
export const storeAuthTokens = (access: string, refresh?: string) => {
  try {
    localStorage.setItem('token', access);
    if (refresh) {
      localStorage.setItem('refresh_token', refresh);
    }
  } catch {
    // Ignore storage errors (e.g., private browsing mode)
  }
};
