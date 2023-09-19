import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { getLocalePath } from '@sb/webapp-core/utils';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Route, Routes } from 'react-router';

import { RoutesConfig } from '../../../../config/routes';
import { fillEditCrudDemoItemQuery } from '../../../../tests/factories';
import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
import { EditCrudDemoItem } from '../editCrudDemoItem.component';
import { editCrudDemoItemMutation } from '../editCrudDemoItem.graphql';

jest.mock('@sb/webapp-core/services/analytics');

describe('EditCrudDemoItem: Component', () => {
  const defaultItemId = 'test-id';
  const oldName = 'old item';
  const newName = 'new item';
  const routePath = getLocalePath(RoutesConfig.crudDemoItem.edit);

  const queryData = {
    id: defaultItemId,
    name: oldName,
    __typename: 'CrudDemoItemType',
  };
  const queryVariables = { id: defaultItemId };

  const mutationVariables = { input: { id: defaultItemId, name: newName } };
  const mutationData = {
    updateCrudDemoItem: { crudDemoItem: { id: defaultItemId, name: newName, __typename: 'CrudDemoItemType' } },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const Component = () => (
    <Routes>
      <Route path={routePath} element={<EditCrudDemoItem />} />
    </Routes>
  );

  it('should display prefilled form', async () => {
    const routerProps = createMockRouterProps(RoutesConfig.crudDemoItem.edit, { id: defaultItemId });
    const queryMock = fillEditCrudDemoItemQuery(queryData, queryVariables);

    render(<Component />, {
      routerProps,
      apolloMocks: (defaultMocks) => defaultMocks.concat(queryMock),
    });

    expect(await screen.findByDisplayValue(oldName)).toBeInTheDocument();
  });

  describe('action completes successfully', () => {
    it('should commit mutation', async () => {
      const routerProps = createMockRouterProps(RoutesConfig.crudDemoItem.edit, { id: defaultItemId });

      const queryMock = fillEditCrudDemoItemQuery(queryData, queryVariables);
      const requestMock = composeMockedQueryResult(editCrudDemoItemMutation, {
        variables: mutationVariables,
        data: mutationData,
      });

      requestMock.newData = jest.fn(() => ({
        data: mutationData,
      }));

      render(<Component />, {
        routerProps,
        apolloMocks: (defaultMocks) => defaultMocks.concat(queryMock, requestMock),
      });

      const nameField = await screen.findByPlaceholderText(/name/i);
      await userEvent.clear(nameField);
      await userEvent.type(nameField, newName);
      await userEvent.click(screen.getByRole('button', { name: /save/i }));

      expect(requestMock.newData).toHaveBeenCalled();
    });

    it('should show success message', async () => {
      const routerProps = createMockRouterProps(RoutesConfig.crudDemoItem.edit, { id: defaultItemId });
      const queryMock = fillEditCrudDemoItemQuery(queryData, queryVariables);
      const requestMock = composeMockedQueryResult(editCrudDemoItemMutation, {
        variables: mutationVariables,
        data: mutationData,
      });

      render(<Component />, {
        routerProps,
        apolloMocks: (defaultMocks) => defaultMocks.concat(queryMock, requestMock),
      });

      const nameField = await screen.findByPlaceholderText(/name/i);

      await userEvent.clear(nameField);
      await userEvent.type(nameField, newName);
      await userEvent.click(screen.getByRole('button', { name: /save/i }));

      const toast = await screen.findByTestId('toast-1');
      expect(trackEvent).toHaveBeenCalledWith('crud', 'edit', defaultItemId);
      expect(toast).toHaveTextContent('🎉 Changes saved successfully!');
    });
  });
});
