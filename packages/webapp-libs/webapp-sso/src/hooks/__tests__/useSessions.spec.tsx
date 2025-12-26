import { SESSIONS_QUERY, REVOKE_SESSION, REVOKE_ALL_SESSIONS } from '../useSessions';

describe('useSessions', () => {
  describe('GraphQL queries', () => {
    it('should export SESSIONS_QUERY', () => {
      expect(SESSIONS_QUERY).toBeDefined();
    });

    it('should export REVOKE_SESSION mutation', () => {
      expect(REVOKE_SESSION).toBeDefined();
    });

    it('should export REVOKE_ALL_SESSIONS mutation', () => {
      expect(REVOKE_ALL_SESSIONS).toBeDefined();
    });
  });
});
