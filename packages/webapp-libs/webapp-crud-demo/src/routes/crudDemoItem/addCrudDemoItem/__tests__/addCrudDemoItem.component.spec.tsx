import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { tenantFactory } from '@sb/webapp-tenants/tests/factories/tenant';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { render } from '../../../../tests/utils/rendering';
import { crudDemoItemListQuery } from '../../crudDemoItemList/crudDemoItemList.component';
import { AddCrudDemoItem, addCrudDemoItemMutation } from '../addCrudDemoItem.component';

jest.mock('@sb/webapp-core/services/analytics');

const tenantId = 'tenantId';

describe('AddCrudDemoItem: Component', () => {
  const Component = () => <AddCrudDemoItem />;

  it('should display empty form', async () => {
    const { waitForApolloMocks } = render(<Component />);
    await waitForApolloMocks();
    const value = (await screen.findByPlaceholderText(/name/i)).getAttribute('value');
    expect(value).toBe('');
  });

  describe('action completes successfully', () => {
    it('should commit mutation', async () => {
      const commonQueryMock = fillCommonQueryWithUser(
        currentUserFactory({
          tenants: [
            tenantFactory({
              id: tenantId,
            }),
          ],
        })
      );

      const variables = {
        input: { name: 'new item name', tenantId },
      };
      const data = {
        createCrudDemoItem: {
          crudDemoItemEdge: {
            node: {
              id: 1,
              ...variables.input,
            },
          },
        },
      };
      const requestMock = composeMockedQueryResult(addCrudDemoItemMutation, {
        variables,
        data,
      });

      const refetchMock = composeMockedQueryResult(crudDemoItemListQuery, {
        variables: {
          tenantId,
          first: 8,
        },
        data: [data],
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
    });

    it('should show success message', async () => {
      const commonQueryMock = fillCommonQueryWithUser(
        currentUserFactory({
          tenants: [
            tenantFactory({
              id: tenantId,
            }),
          ],
        })
      );
      const variables = {
        input: { name: 'new item', tenantId },
      };
      const data = {
        createCrudDemoItem: {
          crudDemoItemEdge: {
            node: {
              id: 1,
              ...variables.input,
            },
          },
        },
      };
      const requestMock = composeMockedQueryResult(addCrudDemoItemMutation, {
        variables,
        data,
      });

      render(<Component />, {
        apolloMocks: [commonQueryMock, requestMock],
      });

      await userEvent.type(await screen.findByPlaceholderText(/name/i), 'new item');
      await userEvent.click(screen.getByRole('button', { name: /save/i }));

      const toast = await screen.findByTestId('toast-1');

      expect(trackEvent).toHaveBeenCalledWith('crud', 'add', 1);
      expect(toast).toHaveTextContent('🎉 Item added successfully!');
    });
  });
});
