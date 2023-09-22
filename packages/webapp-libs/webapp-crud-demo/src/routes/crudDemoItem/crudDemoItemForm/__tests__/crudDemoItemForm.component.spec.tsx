import { ApolloError } from '@apollo/client';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { GraphQLError } from 'graphql/error/GraphQLError';

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

  it('should display empty string', async () => {
    render(<Component initialData={{ name: '' }} />);
    const value = (await screen.findByPlaceholderText(/name/i)).getAttribute('value');
    expect(value).toBe('');
  });

  describe('action completes successfully', () => {
    it('should call onSubmit prop', async () => {
      const onSubmit = jest.fn();
      render(<Component onSubmit={onSubmit} />);

      const nameField = await screen.findByPlaceholderText(/name/i);
      await userEvent.clear(nameField);
      await userEvent.type(nameField, 'new item name');
      await userEvent.click(screen.getByRole('button', { name: /save/i }));

      expect(onSubmit).toHaveBeenCalledWith({ name: 'new item name' });
    });
  });

  it('should show non field error if error', async () => {
    render(<Component error={new ApolloError({ graphQLErrors: [new GraphQLError('Provided value is invalid')] })} />);

    expect(await screen.findByText('Provided value is invalid')).toBeInTheDocument();
  });
});
