import { getRequiredEnvValue } from '../app.utils';

jest.mock('../utils/env', () => ({
  env: {
    TEST_VARIABLE: 'test value',
  },
}));

describe('getRequiredEnvValue', () => {
  it('should return the value of the specified environment variable', async () => {
    const result = getRequiredEnvValue('TEST_VARIABLE');

    expect(result).toEqual('test value');
  });

  it('should throw an error if the specified environment variable is not set', () => {
    expect(() => {
      getRequiredEnvValue('UNDEFINED_VARIABLE');
    }).toThrow('Env variable UNDEFINED_VARIABLE not set');
  });
});
