import userEvent from '@testing-library/user-event';
import { act, screen } from '@testing-library/react';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { ConnectionHandler } from 'relay-runtime';
import { produce } from 'immer';

import { render } from '../../../../tests/utils/rendering';
import { prepareState } from '../../../../mocks/store';
import { AddCrudDemoItem } from '../addCrudDemoItem.component';
import configureStore from '../../../../app/config/store';
import { fillCommonQueryWithUser } from '../../../../shared/utils/commonQuery';

describe('AddCrudDemoItem: Component', () => {
  const reduxInitialState = prepareState((state) => state);

  const Component = () => <AddCrudDemoItem />;

  it('should display empty form', () => {
    render(<Component />);
    const value = screen.getByPlaceholderText(/name/i).getAttribute('value');
    expect(value).toBeNull();
  });

  describe('action completes successfully', () => {
    it('should commit mutation', async () => {
      const relayEnvironment = createMockEnvironment();
      fillCommonQueryWithUser(relayEnvironment);

      render(<Component />, { relayEnvironment });

      await userEvent.type(screen.getByPlaceholderText(/name/i), 'new item name');
      await userEvent.click(screen.getByRole('button', { name: /save/i }));

      const operation = relayEnvironment.mock.getMostRecentOperation();
      expect(operation.fragment.node.name).toEqual('addCrudDemoItemMutation');
      expect(operation.fragment.variables).toEqual({
        input: { name: 'new item name' },
        connections: [ConnectionHandler.getConnectionID('root', 'crudDemoItemList_allCrudDemoItems')],
      });

      await act(async () => {
        relayEnvironment.mock.resolve(operation, MockPayloadGenerator.generate(operation));
      });
    });

    it('should show success message', async () => {
      const relayEnvironment = createMockEnvironment();
      fillCommonQueryWithUser(relayEnvironment);
      const reduxStore = configureStore(reduxInitialState);

      render(<Component />, { reduxStore, relayEnvironment });

      await userEvent.type(screen.getByPlaceholderText(/name/i), 'new item');
      await userEvent.click(screen.getByRole('button', { name: /save/i }));

      const operation = relayEnvironment.mock.getMostRecentOperation();
      expect(operation.fragment.node.name).toEqual('addCrudDemoItemMutation');
      await act(async () => {
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
