import {
  SSO_CONNECTIONS_QUERY,
  CREATE_SSO_CONNECTION,
  UPDATE_SSO_CONNECTION,
  DELETE_SSO_CONNECTION,
  ACTIVATE_SSO_CONNECTION,
  DEACTIVATE_SSO_CONNECTION,
} from '../useSSOConnections';

describe('useSSOConnections', () => {
  describe('GraphQL queries', () => {
    it('should export SSO_CONNECTIONS_QUERY', () => {
      expect(SSO_CONNECTIONS_QUERY).toBeDefined();
    });

    it('should export CREATE_SSO_CONNECTION mutation', () => {
      expect(CREATE_SSO_CONNECTION).toBeDefined();
    });

    it('should export UPDATE_SSO_CONNECTION mutation', () => {
      expect(UPDATE_SSO_CONNECTION).toBeDefined();
    });

    it('should export DELETE_SSO_CONNECTION mutation', () => {
      expect(DELETE_SSO_CONNECTION).toBeDefined();
    });

    it('should export ACTIVATE_SSO_CONNECTION mutation', () => {
      expect(ACTIVATE_SSO_CONNECTION).toBeDefined();
    });

    it('should export DEACTIVATE_SSO_CONNECTION mutation', () => {
      expect(DEACTIVATE_SSO_CONNECTION).toBeDefined();
    });
  });
});
