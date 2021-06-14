import { nestedPath } from '../app.constants';

describe('App: Constants', () => {
  describe('nestedRoute', () => {
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
