import { PASSKEYS_QUERY, DELETE_PASSKEY, RENAME_PASSKEY } from '../usePasskeys';

describe('usePasskeys', () => {
  describe('GraphQL queries', () => {
    it('should export PASSKEYS_QUERY', () => {
      expect(PASSKEYS_QUERY).toBeDefined();
    });

    it('should export DELETE_PASSKEY mutation', () => {
      expect(DELETE_PASSKEY).toBeDefined();
    });

    it('should export RENAME_PASSKEY mutation', () => {
      expect(RENAME_PASSKEY).toBeDefined();
    });
  });
});
