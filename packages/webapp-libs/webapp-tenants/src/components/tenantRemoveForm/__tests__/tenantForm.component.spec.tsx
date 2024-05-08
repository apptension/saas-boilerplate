import { ApolloError } from '@apollo/client';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { GraphQLError } from 'graphql/error/GraphQLError';

import { render } from '../../../tests/utils/rendering';
import { TenantRemoveForm, TenantRemoveFormProps } from '../tenantRemoveForm.component';

describe('TenantForm: Component', () => {
  const defaultProps: TenantRemoveFormProps = {
    onSubmit: jest.fn(),
    loading: false,
  };

  const Component = (props: Partial<TenantRemoveFormProps>) => <TenantRemoveForm {...defaultProps} {...props} />;

  describe('action completes successfully', () => {
    it('should call onSubmit prop', async () => {
      const onSubmit = jest.fn();
      render(<Component onSubmit={onSubmit} />);

      const nameField = await screen.findByPlaceholderText(/name/i);
      await userEvent.clear(nameField);
      await userEvent.type(nameField, 'new tenant name');
      await userEvent.click(screen.getByRole('button', { name: /save/i }));

      expect(onSubmit).toHaveBeenCalledWith({ name: 'new tenant name' });
    });
  });

  it('should show non field error if error', async () => {
    render(<Component error={new ApolloError({ graphQLErrors: [new GraphQLError('Provided value is invalid')] })} />);

    expect(await screen.findByText('Provided value is invalid')).toBeInTheDocument();
  });
});
