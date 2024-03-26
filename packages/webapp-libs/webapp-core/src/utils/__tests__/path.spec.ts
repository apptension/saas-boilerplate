import { getLocalePath, nestedPath } from '../path';

describe('Utils: path', () => {
  describe('nestedRoute', () => {
    jest.mock('@sb/webapp-core/config/i18n', () => ({
      ...(jest.requireActual('@sb/webapp-core/config/i18n') as any),
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
        getTenantPath: expect.any(Function),
      });
    });

    it('should return relative url using getRelativeUrl property', () => {
      const result = nestedPath('root', {
        step: 'step',
        anotherStep: 'another-step/:id',
      });

      expect(result.getRelativeUrl('anotherStep')).toEqual('another-step/:id');
    });

    describe('nesting', () => {
      it('should create nested route based on provided config', () => {
        const result = nestedPath('root', {
          step: 'step',
          nestedStep: nestedPath('nested', {
            anotherStep: 'another-step/:id',
          }),
        });

        expect(result).toEqual({
          index: 'root/*',
          step: 'root/step',
          nestedStep: {
            index: 'root/nested/*',
            anotherStep: 'root/nested/another-step/:id',
            getRelativeUrl: expect.any(Function),
            getLocalePath: expect.any(Function),
            getTenantPath: expect.any(Function),
          },
          getRelativeUrl: expect.any(Function),
          getLocalePath: expect.any(Function),
          getTenantPath: expect.any(Function),
        });
      });

      it('should return relative url using getRelativeUrl property', () => {
        const result = nestedPath('root', {
          nestedStep: nestedPath('nested', {
            anotherStep: nestedPath('another-step/:id', {
              yetAnotherStep: 'yet-another-step',
            }),
            anotherStep2: 'another-step-2/:id',
          }),
        });

        expect(result.nestedStep.getRelativeUrl('anotherStep2')).toEqual('another-step-2/:id');
        expect(result.nestedStep.anotherStep.getRelativeUrl('yetAnotherStep')).toEqual('yet-another-step');
      });

      it('should return locale path using getLocalePath property', () => {
        const result = nestedPath('root', {
          step: 'step',
          nestedStep: nestedPath('nested', {
            anotherStep: 'another-step/:id',
          }),
        });

        expect(getLocalePath(result.nestedStep.anotherStep)).toEqual('/:lang/root/nested/another-step/:id');
      });
    });
  });
});
