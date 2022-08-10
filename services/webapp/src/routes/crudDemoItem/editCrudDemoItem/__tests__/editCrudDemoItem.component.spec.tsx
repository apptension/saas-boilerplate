import userEvent from '@testing-library/user-event';
import { act, screen } from '@testing-library/react';
import { generatePath } from 'react-router';
import { OperationDescriptor } from 'react-relay/hooks';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { ContextData, makeContextRenderer } from '../../../../shared/utils/testUtils';
import EditCrudDemoItemQuery from '../../../../__generated__/editCrudDemoItemQuery.graphql';
import { Routes } from '../../../../app/config/routes';
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
  const routePath = Routes.getLocalePath(['crudDemoItem', 'edit']);
  const render = (context?: Partial<ContextData>) =>
    renderWithContext(
      {},
      {
        ...context,
        router: {
          url: generatePath(routePath, { lang: 'en', id: 'test-id' }),
          routePath,
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

    expect(screen.getByDisplayValue(/old item/i)).toBeInTheDocument();
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
      const relayEnvironment = createMockEnvironment();
      relayEnvironment.mock.queueOperationResolver((operation: OperationDescriptor) =>
        MockPayloadGenerator.generate(operation, {
          CrudDemoItemType: () => ({ name: 'old item' }),
        })
      );
      relayEnvironment.mock.queuePendingOperation(EditCrudDemoItemQuery, { id: 'test-id' });

      render({ relayEnvironment });

      await userEvent.type(screen.getByPlaceholderText(/name/i), 'new item name');
      await userEvent.click(screen.getByRole('button', { name: /save/i }));

      const operation = relayEnvironment.mock.getMostRecentOperation();
      expect(operation.fragment.node.name).toEqual('editCrudDemoItemContentMutation');
      await act(() => {
        relayEnvironment.mock.resolve(operation, MockPayloadGenerator.generate(operation));
      });

      expect(mockDispatch).toHaveBeenCalledWith(snackbarActions.showMessage('🎉 Changes saved successfully!'))
    });
  });
});
