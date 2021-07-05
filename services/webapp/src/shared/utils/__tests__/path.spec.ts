import { nestedPath } from '../path';

describe('Utils: path', () => {
  describe('nestedRoute', () => {
    jest.mock('../../../i18n.ts', () => ({
      ...(jest.requireActual('../../../i18n.ts') as any),
      appLocales: ['en', 'pl'],
    }));

    const langPart = '/:lang(en|pl)';

    it('should create nested route based on provided config', () => {
      const result = nestedPath('/root', {
        step: '/step',
        anotherStep: '/another-step/:id',
      });

      expect(result).toEqual({
        index: `${langPart}/root`,
        step: `${langPart}/root/step`,
        anotherStep: `${langPart}/root/another-step/:id`,
        getRelativeUrl: expect.any(Function),
      });
    });

    it('should return relative url using getRelativeUrl property', () => {
      const result = nestedPath('/root', {
        step: '/step',
        anotherStep: '/another-step/:id',
      });

      expect(result.getRelativeUrl('anotherStep')).toEqual('/another-step/:id');
    });
  });
});
