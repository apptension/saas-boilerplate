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
        getMountPath: expect.any(Function),
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
            getMountPath: expect.any(Function),
          },
          getRelativeUrl: expect.any(Function),
          getLocalePath: expect.any(Function),
          getTenantPath: expect.any(Function),
          getMountPath: expect.any(Function),
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
      it('should propagate prefix through 3 levels of nesting', () => {
        const result = nestedPath('admin', {
          payments: nestedPath('payments', {
            customers: nestedPath('customers', {
              list: '',
              add: 'add',
            }),
          }),
        });
        expect(result.payments.customers.list).toEqual('admin/payments/customers/');
        expect(result.payments.customers.add).toEqual('admin/payments/customers/add');
        expect(result.payments.customers.index).toEqual('admin/payments/customers/*');
      });

      it('should propagate prefix through 4 levels of nesting', () => {
        const result = nestedPath('a', {
          b: nestedPath('b', {
            c: nestedPath('c', {
              d: nestedPath('d', {
                leaf: '',
              }),
            }),
          }),
        });
        expect(result.b.c.d.leaf).toEqual('a/b/c/d/');
      });

      it('should preserve helpers on deeply nested objects', () => {
        const result = nestedPath('admin', {
          payments: nestedPath('payments', {
            customers: nestedPath('customers', {
              list: '',
            }),
          }),
        });
        expect(result.payments.customers.getRelativeUrl('list')).toEqual('');
        expect(getLocalePath(result.payments.customers.list)).toEqual('/:lang/admin/payments/customers/');
      });

      it('should return mount path with wildcard for nested route groups', () => {
        const result = nestedPath('root', {
          step: 'step',
          nestedStep: nestedPath('nested', {
            anotherStep: 'another-step/:id',
          }),
        });
        expect(result.nestedStep.getMountPath()).toEqual('nested/*');
      });

      it('should return mount path correctly at multiple nesting depths', () => {
        const result = nestedPath('admin', {
          payments: nestedPath('payments', {
            customers: nestedPath('customers', {
              list: '',
            }),
          }),
        });
        expect(result.payments.getMountPath()).toEqual('payments/*');
        expect(result.payments.customers.getMountPath()).toEqual('customers/*');
      });

      it('should support mixed getMountPath and getRelativeUrl in route mounts', () => {
        const result = nestedPath('admin', {
          payments: nestedPath('payments', {
            customers: nestedPath('customers', { list: '' }),
            cart: 'cart/:transactionId',
          }),
        });
        expect(result.payments.customers.getMountPath()).toEqual('customers/*');
        expect(result.payments.getRelativeUrl('cart')).toEqual('cart/:transactionId');
      });
    });
  });
});
