import { nestedPath } from '../path';

describe('Utils: path', () => {
  describe('nestedRoute', () => {
    jest.mock('../../../app/config/i18n', () => ({
      ...(jest.requireActual('../../../app/config/i18n') as any),
      appLocales: ['en', 'pl'],
    }));

    it('should create nested route based on provided config', () => {
      const result = nestedPath('root', {
        step: 'step',
        anotherStep: 'another-step/:id',
      });

      expect(result).toEqual({
        index: 'root/*',
        step: 'root/step',
        anotherStep: 'root/another-step/:id',
        getRelativeUrl: expect.any(Function),
        getLocalePath: expect.any(Function),
      });
    });

    it('should return relative url using getRelativeUrl property', () => {
      const result = nestedPath('root', {
        step: 'step',
        anotherStep: 'another-step/:id',
      });

      expect(result.getRelativeUrl('anotherStep')).toEqual('another-step/:id');
    });
  });
});
