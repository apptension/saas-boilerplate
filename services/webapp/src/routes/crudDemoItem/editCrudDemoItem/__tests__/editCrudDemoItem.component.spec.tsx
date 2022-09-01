import userEvent from '@testing-library/user-event';
import { act, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { OperationDescriptor } from 'react-relay/hooks';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { produce } from 'immer';

import EditCrudDemoItemQuery from '../../../../__generated__/editCrudDemoItemQuery.graphql';
import { RoutesConfig } from '../../../../app/config/routes';
import { createMockRouterHistory, render } from '../../../../tests/utils/rendering';
import { prepareState } from '../../../../mocks/store';
import { loggedInAuthFactory } from '../../../../mocks/factories';
import configureStore from '../../../../app/config/store';
import { EditCrudDemoItem } from '../editCrudDemoItem.component';
import { fillCommonQueryWithUser } from '../../../../shared/utils/commonQuery';

describe('EditCrudDemoItem: Component', () => {
  const routePath = RoutesConfig.getLocalePath(['crudDemoItem', 'edit']);
  const Component = () => (
    <Routes>
      <Route path={routePath} element={<EditCrudDemoItem />} />
    </Routes>
  );
  const reduxInitialState = prepareState((state) => {
    state.auth = loggedInAuthFactory();
  });

  const getRelayEnv = () => {
    const relayEnvironment = createMockEnvironment();
    fillCommonQueryWithUser(relayEnvironment);
    return relayEnvironment;
  };

  it('should display prefilled form', () => {
    const routerHistory = createMockRouterHistory(['crudDemoItem', 'edit'], { id: 'test-id' });
    const relayEnvironment = getRelayEnv();
    relayEnvironment.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        CrudDemoItemType: () => ({ name: 'old item' }),
      })
    );
    relayEnvironment.mock.queuePendingOperation(EditCrudDemoItemQuery, { id: 'test-id' });

    render(<Component />, { relayEnvironment, routerHistory });

    expect(screen.getByDisplayValue(/old item/i)).toBeInTheDocument();
  });

  describe('action completes successfully', () => {
    it('should commit mutation', async () => {
      const routerHistory = createMockRouterHistory(['crudDemoItem', 'edit'], { id: 'test-id' });
      const relayEnvironment = getRelayEnv();
      relayEnvironment.mock.queueOperationResolver((operation: OperationDescriptor) =>
        MockPayloadGenerator.generate(operation, {
          CrudDemoItemType: () => ({ id: 'test-id', name: 'old item' }),
        })
      );
      relayEnvironment.mock.queuePendingOperation(EditCrudDemoItemQuery, { id: 'test-id' });

      render(<Component />, { relayEnvironment, routerHistory });

      const nameField = screen.getByPlaceholderText(/name/i);
      await userEvent.clear(nameField);
      await userEvent.type(nameField, 'new item name');
      await userEvent.click(screen.getByRole('button', { name: /save/i }));

      const operation = relayEnvironment.mock.getMostRecentOperation();
      expect(operation.fragment.node.name).toEqual('editCrudDemoItemContentMutation');
      expect(operation.fragment.variables).toEqual({ input: { id: 'test-id', name: 'new item name' } });

      await act(() => {
        relayEnvironment.mock.resolve(operation, MockPayloadGenerator.generate(operation));
      });
    });

    it('should show success message', async () => {
      const routerHistory = createMockRouterHistory(['crudDemoItem', 'edit'], { id: 'test-id' });
      const reduxStore = configureStore(reduxInitialState);
      const relayEnvironment = getRelayEnv();
      relayEnvironment.mock.queueOperationResolver((operation: OperationDescriptor) =>
        MockPayloadGenerator.generate(operation, {
          CrudDemoItemType: () => ({ name: 'old item' }),
        })
      );
      relayEnvironment.mock.queuePendingOperation(EditCrudDemoItemQuery, { id: 'test-id' });

      render(<Component />, { relayEnvironment, routerHistory, reduxStore });

      await userEvent.type(screen.getByPlaceholderText(/name/i), 'new item name');
      await userEvent.click(screen.getByRole('button', { name: /save/i }));

      const operation = relayEnvironment.mock.getMostRecentOperation();
      expect(operation.fragment.node.name).toEqual('editCrudDemoItemContentMutation');
      await act(() => {
        relayEnvironment.mock.resolve(operation, MockPayloadGenerator.generate(operation));
      });

      expect(reduxStore.getState()).toEqual(
        produce(reduxInitialState, (state) => {
          state.snackbar.lastMessageId = 1;
          state.snackbar.messages = [{ id: 1, text: '🎉 Changes saved successfully!' }];
        })
      );
    });
  });
});
