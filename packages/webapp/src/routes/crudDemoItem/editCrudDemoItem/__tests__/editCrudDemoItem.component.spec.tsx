import userEvent from '@testing-library/user-event';
import { act, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { MockPayloadGenerator } from 'relay-test-utils';
import { produce } from 'immer';

import { RoutesConfig } from '../../../../app/config/routes';
import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
import { prepareState } from '../../../../mocks/store';
import configureStore from '../../../../app/config/store';
import { EditCrudDemoItem } from '../editCrudDemoItem.component';
import { getRelayEnv } from '../../../../tests/utils/relay';
import { fillEditCrudDemoItemQuery } from '../../../../mocks/factories/crudDemoItem';

describe('EditCrudDemoItem: Component', () => {
  const defaultItemId = 'test-id';
  const routePath = RoutesConfig.getLocalePath(['crudDemoItem', 'edit']);

  const data = {
    id: defaultItemId,
    name: 'old item',
    __typename: 'CrudDemoItemType',
  };
  const variables = { id: defaultItemId };

  const Component = () => (
    <Routes>
      <Route path={routePath} element={<EditCrudDemoItem />} />
    </Routes>
  );
  const reduxInitialState = prepareState((state) => state);

  it('should display prefilled form', async () => {
    const routerProps = createMockRouterProps(['crudDemoItem', 'edit'], { id: defaultItemId });
    const queryMock = fillEditCrudDemoItemQuery(undefined, data, variables);

    render(<Component />, {
      routerProps,
      apolloMocks: (defaultMocks) => defaultMocks.concat(queryMock),
    });

    expect(await screen.findByDisplayValue(/old item/i)).toBeInTheDocument();
  });

  describe('action completes successfully', () => {
    it('should commit mutation', async () => {
      const routerProps = createMockRouterProps(['crudDemoItem', 'edit'], { id: defaultItemId });
      const relayEnvironment = getRelayEnv();
      const queryMock = fillEditCrudDemoItemQuery(undefined, data, variables);

      render(<Component />, {
        relayEnvironment,
        routerProps,
        apolloMocks: (defaultMocks) => defaultMocks.concat(queryMock),
      });

      const nameField = await screen.findByPlaceholderText(/name/i);
      await userEvent.clear(nameField);
      await userEvent.type(nameField, 'new item name');
      await userEvent.click(screen.getByRole('button', { name: /save/i }));

      const operation = relayEnvironment.mock.getMostRecentOperation();
      await expect(operation.fragment.node.name).toEqual('editCrudDemoItemContentMutation');
      expect(operation.fragment.variables).toEqual({ input: { id: defaultItemId, name: 'new item name' } });

      act(() => {
        relayEnvironment.mock.resolve(operation, MockPayloadGenerator.generate(operation));
      });
    });

    it('should show success message', async () => {
      const routerProps = createMockRouterProps(['crudDemoItem', 'edit'], { id: defaultItemId });
      const reduxStore = configureStore(reduxInitialState);
      const relayEnvironment = getRelayEnv();
      const queryMock = fillEditCrudDemoItemQuery(undefined, data, variables);

      render(<Component />, {
        relayEnvironment,
        routerProps,
        reduxStore,
        apolloMocks: (defaultMocks) => defaultMocks.concat(queryMock),
      });

      expect(await screen.findByDisplayValue(/old item/i)).toBeInTheDocument();

      await userEvent.type(await screen.findByPlaceholderText(/name/i), 'new item name');
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
