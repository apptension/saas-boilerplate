import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { produce } from 'immer';

import { render } from '../../../../tests/utils/rendering';
import { prepareState } from '../../../../mocks/store';
import { AddCrudDemoItem, addCrudDemoItemMutation } from '../addCrudDemoItem.component';
import configureStore from '../../../../app/config/store';
import { fillCommonQueryWithUser } from '../../../../shared/utils/commonQuery';
import { composeMockedQueryResult } from '../../../../tests/utils/fixtures';

describe('AddCrudDemoItem: Component', () => {
  const reduxInitialState = prepareState((state) => state);

  const Component = () => <AddCrudDemoItem />;

  it('should display empty form', async () => {
    const { waitForApolloMocks } = render(<Component />);
    await waitForApolloMocks();
    const value = (await screen.findByPlaceholderText(/name/i)).getAttribute('value');
    expect(value).toBeNull();
  });

  describe('action completes successfully', () => {
    it('should commit mutation', async () => {
      const commonQueryMock = fillCommonQueryWithUser();

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
      const requestMock = composeMockedQueryResult(addCrudDemoItemMutation, {
        variables,
        data,
      });
      requestMock.newData = jest.fn(() => ({
        data,
      }));

      render(<Component />, { apolloMocks: [commonQueryMock, requestMock] });

      await userEvent.type(await screen.findByPlaceholderText(/name/i), 'new item name');
      await userEvent.click(screen.getByRole('button', { name: /save/i }));
      expect(requestMock.newData).toHaveBeenCalled();
    });

    it('should show success message', async () => {
      const commonQueryMock = fillCommonQueryWithUser();
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
      const requestMock = composeMockedQueryResult(addCrudDemoItemMutation, {
        variables,
        data,
      });

      render(<Component />, { reduxStore, apolloMocks: [commonQueryMock, requestMock] });

      await userEvent.type(await screen.findByPlaceholderText(/name/i), 'new item');
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
