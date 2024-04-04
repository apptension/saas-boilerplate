import { TenantType as TenantTypeField } from '@sb/webapp-api-client/constants';
import { commonQueryCurrentUserQuery } from '@sb/webapp-api-client/providers';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { TenantRole } from '../../../modules/auth/tenantRole.types';
import { membershipFactory, tenantFactory } from '../../../tests/factories/tenant';
import { render } from '../../../tests/utils/rendering';
import { AddTenantForm, addTenantMutation } from '../addTenantForm.component';

jest.mock('@sb/webapp-core/services/analytics');

describe('AddTenantForm: Component', () => {
  const Component = () => <AddTenantForm />;

  it('should display empty form', async () => {
    const { waitForApolloMocks } = render(<Component />);
    await waitForApolloMocks();
    const value = (await screen.findByPlaceholderText(/name/i)).getAttribute('value');
    expect(value).toBe('');
  });

  describe('action completes successfully', () => {
    it('should commit mutation', async () => {
      const user = currentUserFactory();
      const commonQueryMock = fillCommonQueryWithUser(user);

      const variables = {
        input: { name: 'new item name' },
      };
      const data = {
        createTenant: {
          tenantEdge: {
            node: {
              id: '1',
              ...variables.input,
            },
          },
        },
      };
      const requestMock = composeMockedQueryResult(addTenantMutation, {
        variables,
        data,
      });

      const refetchMock = composeMockedQueryResult(commonQueryCurrentUserQuery, {
        data: {
          ...user,
          tenants: [
            ...user.tenants!,
            tenantFactory({
              id: '1',
              name: variables.input.name,
              type: TenantTypeField.ORGANIZATION,
              membership: membershipFactory({ role: TenantRole.OWNER }),
            }),
          ],
        },
      });

      requestMock.newData = jest.fn(() => ({
        data,
      }));

      refetchMock.newData = jest.fn(() => ({
        data: [data],
      }));

      render(<Component />, { apolloMocks: [commonQueryMock, requestMock, refetchMock] });

      await userEvent.type(await screen.findByPlaceholderText(/name/i), 'new item name');
      await userEvent.click(screen.getByRole('button', { name: /save/i }));
      expect(requestMock.newData).toHaveBeenCalled();
      expect(refetchMock.newData).toHaveBeenCalled();

      const toast = await screen.findByTestId('toast-1');

      expect(trackEvent).toHaveBeenCalledWith('tenant', 'add', '1');
      expect(toast).toHaveTextContent('🎉 Tenant added successfully!');
    });
  });
});