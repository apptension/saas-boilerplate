import { ApolloError } from '@apollo/client';
import { TenantUserRole } from '@sb/webapp-api-client';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { GraphQLError } from 'graphql/error/GraphQLError';

import { render } from '../../../tests/utils/rendering';
import { TenantInvitationForm, TenantInvitationFormProps } from '../tenantInvitationForm.component';

describe('TenantInvitationForm: Component', () => {
  const defaultProps: TenantInvitationFormProps = {
    initialData: {
      email: 'admin@example.com',
      role: TenantUserRole.MEMBER,
    },
    onSubmit: jest.fn(),
    loading: false,
  };

  const Component = (props: Partial<TenantInvitationFormProps>) => (
    <TenantInvitationForm {...defaultProps} {...props} />
  );

  it('should display initial email', async () => {
    render(<Component />);
    const value = (await screen.findByLabelText(/email/i)).getAttribute('value');
    expect(value).toBe(defaultProps.initialData?.email);
  });

  describe('action completes successfully', () => {
    it('should call onSubmit prop', async () => {
      const onSubmit = jest.fn();
      render(<Component onSubmit={onSubmit} />);

      const emailField = await screen.findByLabelText(/email/i);
      await userEvent.clear(emailField);
      const emailValue = 'example@example.com';
      await userEvent.type(emailField, emailValue);

      await userEvent.click(screen.getByDisplayValue(/Member/i));
      await userEvent.click(screen.getByRole('button', { name: /invite/i }));

      expect(onSubmit).toHaveBeenCalledWith({ email: emailValue, role: TenantUserRole.MEMBER });
    });
  });

  it('should show non field error if error', async () => {
    const errorText = 'Provided value is invalid';
    render(<Component error={new ApolloError({ graphQLErrors: [new GraphQLError(errorText)] })} />);

    expect(await screen.findByText(errorText)).toBeInTheDocument();
  });
});
