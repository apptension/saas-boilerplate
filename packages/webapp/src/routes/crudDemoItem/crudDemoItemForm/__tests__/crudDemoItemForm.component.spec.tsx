import userEvent from '@testing-library/user-event';
import { act, screen } from '@testing-library/react';
import { produce } from 'immer';
import { PayloadError } from 'relay-runtime';
import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql/error/GraphQLError';

import { CrudDemoItemForm, CrudDemoItemFormProps } from '../crudDemoItemForm.component';
import { render } from '../../../../tests/utils/rendering';
import configureStore from '../../../../app/config/store';
import { prepareState } from '../../../../mocks/store';
import { unpackPromise } from '../../../../tests/utils/promise';

describe('CrudDemoItemForm: Component', () => {
  const defaultProps: CrudDemoItemFormProps = {
    initialData: {
      name: 'initial name',
    },
    onSubmit: jest.fn(),
  };

  const Component = (props: Partial<CrudDemoItemFormProps>) => <CrudDemoItemForm {...defaultProps} {...props} />;

  const reduxInitialState = prepareState((state) => state);

  it('should display empty form', () => {
    render(<Component />);
    const value = screen.getByPlaceholderText(/name/i).getAttribute('value');
    expect(value).toBeNull();
  });

  describe('action completes successfully', () => {
    it('should call onSubmit prop', async () => {
      const onSubmit = jest.fn().mockReturnValue({ errors: null });
      render(<Component onSubmit={onSubmit} />);

      const nameField = screen.getByPlaceholderText(/name/gi);
      await userEvent.clear(nameField);
      await userEvent.type(nameField, 'new item name');
      await userEvent.click(screen.getByRole('button', { name: /save/i }));

      expect(onSubmit).toHaveBeenCalledWith({ name: 'new item name' });
    });

    it('should show success message', async () => {
      const reduxStore = configureStore(reduxInitialState);
      const { resolve: resolveSubmit, promise } = unpackPromise<{ errors?: PayloadError[] | null }>();
      const onSubmit = jest.fn().mockReturnValue(promise);

      render(<Component onSubmit={onSubmit} />, { reduxStore });

      await userEvent.type(screen.getByPlaceholderText(/name/gi), 'new item name');
      await userEvent.click(screen.getByRole('button', { name: /save/i }));

      await act(async () => {
        resolveSubmit({ errors: null });
      });

      expect(reduxStore.getState()).toEqual(
        produce(reduxInitialState, (state) => {
          state.snackbar.lastMessageId = 1;
          state.snackbar.messages = [{ id: 1, text: '🎉 Changes saved successfully!' }];
        })
      );
    });
  });

  it('should show field error if action throws error', async () => {
    const reduxStore = configureStore(reduxInitialState);
    const { promise, reject: rejectSubmit } = unpackPromise<{ errors?: PayloadError[] | null }>();
    const onSubmit = jest.fn().mockReturnValue(promise);

    render(<Component onSubmit={onSubmit} />, { reduxStore });

    await userEvent.type(screen.getByPlaceholderText(/name/gi), 'new item name');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await act(async () => {
      const error = new ApolloError({ graphQLErrors: [new GraphQLError('Provided value is invalid')] });
      rejectSubmit(error);
    });

    expect(screen.getByText('Provided value is invalid')).toBeInTheDocument();
  });
});
