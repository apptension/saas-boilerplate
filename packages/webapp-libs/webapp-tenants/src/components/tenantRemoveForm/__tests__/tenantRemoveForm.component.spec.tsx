import { ApolloError } from '@apollo/client';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { GraphQLError } from 'graphql/error/GraphQLError';

import { render } from '../../../tests/utils/rendering';
import { TenantRemoveForm, TenantRemoveFormProps } from '../tenantRemoveForm.component';

describe('TenantRemoveForm: Component', () => {
  const defaultProps: TenantRemoveFormProps = {
    onSubmit: jest.fn(),
    loading: false,
  };

  const Component = (props: Partial<TenantRemoveFormProps>) => <TenantRemoveForm {...defaultProps} {...props} />;

  describe('action completes successfully', () => {
    it('should call onSubmit prop', async () => {
      const onSubmit = jest.fn();
      render(<Component onSubmit={onSubmit} />);

      const button = await screen.findByRole('button', { name: /remove organisation/i })
      await userEvent.click(button);

      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('should show non field error if error', async () => {
    render(<Component error={new ApolloError({ graphQLErrors: [new GraphQLError('Provided value is invalid')] })} />);

    expect(await screen.findByText('Provided value is invalid')).toBeInTheDocument();
  });
});
