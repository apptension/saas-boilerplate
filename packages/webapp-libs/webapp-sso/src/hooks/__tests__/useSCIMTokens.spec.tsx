import { SCIM_TOKENS_QUERY, CREATE_SCIM_TOKEN, REVOKE_SCIM_TOKEN } from '../useSCIMTokens';

describe('useSCIMTokens', () => {
  describe('GraphQL queries', () => {
    it('should export SCIM_TOKENS_QUERY', () => {
      expect(SCIM_TOKENS_QUERY).toBeDefined();
    });

    it('should export CREATE_SCIM_TOKEN mutation', () => {
      expect(CREATE_SCIM_TOKEN).toBeDefined();
    });

    it('should export REVOKE_SCIM_TOKEN mutation', () => {
      expect(REVOKE_SCIM_TOKEN).toBeDefined();
    });
  });
});
