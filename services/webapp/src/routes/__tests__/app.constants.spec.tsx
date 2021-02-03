import { nestedRoute } from '../app.constants';

describe('App: Constants', () => {
  describe('nestedRoute', () => {
    it('should create nested route based on provided config', () => {
      const result = nestedRoute('/root', {
        step: '/step',
        anotherStep: '/another-step/:id',
      });

      expect(result).toEqual({
        index: '/root',
        step: '/root/step',
        anotherStep: '/root/another-step/:id',
        getRelativeUrl: expect.any(Function),
      });
    });

    it('should return relative url using getRelativeUrl property', () => {
      const result = nestedRoute('/root', {
        step: '/step',
        anotherStep: '/another-step/:id',
      });

      expect(result.getRelativeUrl('anotherStep')).toEqual('/another-step/:id');
    });
  });
});
