import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { createMockEnvironment } from 'relay-test-utils';
import { produce } from 'immer';

import { render } from '../../../../tests/utils/rendering';
import { prepareState } from '../../../../mocks/store';
import { AddCrudDemoItem, ADD_CRUD_DEMO_ITEM_MUTATION } from '../addCrudDemoItem.component';
import configureStore from '../../../../app/config/store';
import { fillCommonQueryWithUser } from '../../../../shared/utils/commonQuery';
import { composeMockedQueryResult } from '../../../../tests/utils/fixtures';

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

      const variables = {
        input: { name: 'new item name' },
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
      const requestMock = composeMockedQueryResult(ADD_CRUD_DEMO_ITEM_MUTATION, {
        variables,
        data,
      });

      requestMock.newData = jest.fn(() => ({
        data,
      }));

      render(<Component />, { relayEnvironment, apolloMocks: [requestMock] });

      await userEvent.type(screen.getByPlaceholderText(/name/i), 'new item name');
      await userEvent.click(screen.getByRole('button', { name: /save/i }));
      expect(requestMock.newData).toHaveBeenCalled();
    });

    it('should show success message', async () => {
      const relayEnvironment = createMockEnvironment();
      fillCommonQueryWithUser(relayEnvironment);
      const reduxStore = configureStore(reduxInitialState);

      const variables = {
        input: { name: 'new item' },
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
      const requestMock = composeMockedQueryResult(ADD_CRUD_DEMO_ITEM_MUTATION, {
        variables,
        data,
      });

      render(<Component />, { reduxStore, relayEnvironment, apolloMocks: [requestMock] });

      await userEvent.type(screen.getByPlaceholderText(/name/i), 'new item');
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
