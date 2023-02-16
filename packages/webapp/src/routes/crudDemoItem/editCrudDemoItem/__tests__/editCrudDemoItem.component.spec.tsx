import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { produce } from 'immer';
import { Route, Routes } from 'react-router';

import { RoutesConfig } from '../../../../app/config/routes';
import configureStore from '../../../../app/config/store';
import { fillEditCrudDemoItemQuery } from '../../../../mocks/factories/crudDemoItem';
import { prepareState } from '../../../../mocks/store';
import { composeMockedQueryResult } from '../../../../tests/utils/fixtures';
import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
import { EditCrudDemoItem } from '../editCrudDemoItem.component';
import { editCrudDemoItemMutation } from '../editCrudDemoItem.graphql';

describe('EditCrudDemoItem: Component', () => {
  const defaultItemId = 'test-id';
  const oldName = 'old item';
  const newName = 'new item';
  const routePath = RoutesConfig.getLocalePath(['crudDemoItem', 'edit']);

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

  const Component = () => (
    <Routes>
      <Route path={routePath} element={<EditCrudDemoItem />} />
    </Routes>
  );
  const reduxInitialState = prepareState((state) => state);

  it('should display prefilled form', async () => {
    const routerProps = createMockRouterProps(['crudDemoItem', 'edit'], { id: defaultItemId });
    const queryMock = fillEditCrudDemoItemQuery(queryData, queryVariables);

    render(<Component />, {
      routerProps,
      apolloMocks: (defaultMocks) => defaultMocks.concat(queryMock),
    });

    expect(await screen.findByDisplayValue(oldName)).toBeInTheDocument();
  });

  describe('action completes successfully', () => {
    it('should commit mutation', async () => {
      const routerProps = createMockRouterProps(['crudDemoItem', 'edit'], { id: defaultItemId });

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
      const routerProps = createMockRouterProps(['crudDemoItem', 'edit'], { id: defaultItemId });
      const reduxStore = configureStore(reduxInitialState);
      const queryMock = fillEditCrudDemoItemQuery(queryData, queryVariables);
      const requestMock = composeMockedQueryResult(editCrudDemoItemMutation, {
        variables: mutationVariables,
        data: mutationData,
      });

      render(<Component />, {
        routerProps,
        reduxStore,
        apolloMocks: (defaultMocks) => defaultMocks.concat(queryMock, requestMock),
      });

      const nameField = await screen.findByPlaceholderText(/name/i);
      await userEvent.clear(nameField);
      await userEvent.type(nameField, newName);
      await userEvent.click(screen.getByRole('button', { name: /save/i }));

      expect(reduxStore.getState()).toEqual(
        produce(reduxInitialState, (state) => {
          state.snackbar.lastMessageId = 1;
          state.snackbar.messages = [{ id: 1, text: '🎉 Changes saved successfully!' }];
        })
      );
    });
  });
});
