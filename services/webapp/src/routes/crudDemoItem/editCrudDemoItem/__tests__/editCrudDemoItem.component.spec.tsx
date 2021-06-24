import React from 'react';
import userEvent from '@testing-library/user-event';
import { act, screen, waitFor } from '@testing-library/react';
import { generatePath } from 'react-router';
import { OperationDescriptor } from 'react-relay/hooks';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { ContextData, makeContextRenderer } from '../../../../shared/utils/testUtils';
import EditCrudDemoItemQuery from '../../../../__generated__/editCrudDemoItemQuery.graphql';
import { ROUTES } from '../../../app.constants';
import { snackbarActions } from '../../../../modules/snackbar';
import { EditCrudDemoItem } from '../editCrudDemoItem.component';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

describe('EditCrudDemoItem: Component', () => {
  const renderWithContext = makeContextRenderer(() => <EditCrudDemoItem />);
  const render = (context?: Partial<ContextData>) =>
    renderWithContext(
      {},
      {
        ...context,
        router: {
          url: generatePath(ROUTES.crudDemoItem.edit, { lang: 'en', id: 'test-id' }),
          routePath: ROUTES.crudDemoItem.edit,
        },
      }
    );

  beforeEach(() => {
    mockDispatch.mockReset();
  });

  it('should display prefilled form', () => {
    const relayEnvironment = createMockEnvironment();
    relayEnvironment.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        CrudDemoItemType: () => ({ name: 'old item' }),
      })
    );
    relayEnvironment.mock.queuePendingOperation(EditCrudDemoItemQuery, { id: 'test-id' });

    render({ relayEnvironment });

    expect(screen.getByDisplayValue(/old item/gi)).toBeInTheDocument();
  });

  describe('action completes successfully', () => {
    it('should commit mutation', async () => {
      const relayEnvironment = createMockEnvironment();
      relayEnvironment.mock.queueOperationResolver((operation: OperationDescriptor) =>
        MockPayloadGenerator.generate(operation, {
          CrudDemoItemType: () => ({ id: 'test-id', name: 'old item' }),
        })
      );
      relayEnvironment.mock.queuePendingOperation(EditCrudDemoItemQuery, { id: 'test-id' });

      render({ relayEnvironment });

      act(() => {
        const nameField = screen.getByPlaceholderText(/name/gi);
        userEvent.clear(nameField);
        userEvent.type(nameField, 'new item name');
        userEvent.click(screen.getByRole('button', { name: /save/gi }));
      });

      await waitFor(() => {
        const operation = relayEnvironment.mock.getMostRecentOperation();
        expect(operation.fragment.node.name).toEqual('editCrudDemoItemContentMutation');
        expect(operation.fragment.variables).toEqual({ input: { id: 'test-id', name: 'new item name' } });

        act(() => {
          relayEnvironment.mock.resolve(
            operation,
            MockPayloadGenerator.generate(operation)
          );
        });
      });
    });

    it('should show success message', async () => {
      const relayEnvironment = createMockEnvironment();
      relayEnvironment.mock.queueOperationResolver((operation: OperationDescriptor) =>
        MockPayloadGenerator.generate(operation, {
          CrudDemoItemType: () => ({ name: 'old item' }),
        })
      );
      relayEnvironment.mock.queuePendingOperation(EditCrudDemoItemQuery, { id: 'test-id' });

      render({ relayEnvironment });

      userEvent.type(screen.getByPlaceholderText(/name/gi), 'new item name');
      act(() => userEvent.click(screen.getByRole('button', { name: /save/gi })));

      await waitFor(() => {
        const operation = relayEnvironment.mock.getMostRecentOperation();
        expect(operation.fragment.node.name).toEqual('editCrudDemoItemContentMutation');
        act(() => {
          relayEnvironment.mock.resolve(
            operation,
            MockPayloadGenerator.generate(operation)
          );
        });
      });

      await waitFor(() =>
        expect(mockDispatch).toHaveBeenCalledWith(snackbarActions.showMessage('🎉 Changes saved successfully!'))
      );
    });
  });
});
