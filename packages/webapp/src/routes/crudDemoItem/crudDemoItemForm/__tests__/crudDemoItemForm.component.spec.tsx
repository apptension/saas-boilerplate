import { ApolloError } from '@apollo/client';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql/error/GraphQLError';

import configureStore from '../../../../app/config/store';
import { prepareState } from '../../../../mocks/store';
import { render } from '../../../../tests/utils/rendering';
import { CrudDemoItemForm, CrudDemoItemFormProps } from '../crudDemoItemForm.component';

describe('CrudDemoItemForm: Component', () => {
  const defaultProps: CrudDemoItemFormProps = {
    initialData: {
      name: 'initial name',
    },
    onSubmit: jest.fn(),
    loading: false,
  };

  const Component = (props: Partial<CrudDemoItemFormProps>) => <CrudDemoItemForm {...defaultProps} {...props} />;

  const reduxInitialState = prepareState((state) => state);

  it('should display empty form', async () => {
    render(<Component />);
    const value = (await screen.findByPlaceholderText(/name/i)).getAttribute('value');
    expect(value).toBeNull();
  });

  describe('action completes successfully', () => {
    it('should call onSubmit prop', async () => {
      const onSubmit = jest.fn();
      render(<Component onSubmit={onSubmit} />);

      const nameField = await screen.findByPlaceholderText(/name/gi);
      await userEvent.clear(nameField);
      await userEvent.type(nameField, 'new item name');
      await userEvent.click(screen.getByRole('button', { name: /save/i }));

      expect(onSubmit).toHaveBeenCalledWith({ name: 'new item name' });
    });
  });

  it('should show non field error if error', async () => {
    const reduxStore = configureStore(reduxInitialState);

    render(<Component error={new ApolloError({ graphQLErrors: [new GraphQLError('Provided value is invalid')] })} />, {
      reduxStore,
    });

    expect(await screen.findByText('Provided value is invalid')).toBeInTheDocument();
  });
});
