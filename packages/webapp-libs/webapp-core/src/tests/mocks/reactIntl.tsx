/**
 * React-intl mock for tests.
 * 
 * This mock preserves the original behavior of react-intl so that
 * tests can verify actual translated messages. The previous implementation
 * replaced all message IDs with 'mock-message-id' which prevented testing
 * of actual message content.
 */

// Re-export the actual react-intl module without modifications
// This allows tests to use real translations from the IntlProvider
const mockReactIntl = jest.requireActual('react-intl');

// No mocking needed - just ensure react-intl is properly initialized
// The CoreTestProviders wrapper provides IntlProvider with real translations
