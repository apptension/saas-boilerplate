import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedListQueryResult } from '@sb/webapp-api-client/tests/utils';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { GraphQLError } from 'graphql/error/GraphQLError';

import { allOrganizationRolesQuery } from '../../../routes/tenantSettings/tenantRoles/tenantRoles.graphql';
import { tenantFactory } from '../../../tests/factories/tenant';
import { render } from '../../../tests/utils/rendering';
import { TenantInvitationForm, TenantInvitationFormProps } from '../tenantInvitationForm.component';

const MOCKED_TENANT_ID = '2';

const mockRoles = [
  {
    id: 'role-1',
    name: 'Member',
    description: 'Basic member role',
    color: 'BLUE',
    isSystemRole: true,
    isOwnerRole: false,
    memberCount: 5,
    permissions: [],
  },
  {
    id: 'role-2',
    name: 'Admin',
    description: 'Admin role',
    color: 'GREEN',
    isSystemRole: true,
    isOwnerRole: false,
    memberCount: 2,
    permissions: [],
  },
];

const createRolesMock = () => {
  return composeMockedListQueryResult(allOrganizationRolesQuery, 'allOrganizationRoles', 'OrganizationRoleType', {
    variables: { tenantId: MOCKED_TENANT_ID },
    data: mockRoles,
  });
};

describe('TenantInvitationForm: Component', () => {
  const defaultProps: TenantInvitationFormProps = {
    initialData: {
      email: 'admin@example.com',
      organizationRoleIds: [],
    },
    onSubmit: jest.fn(),
    loading: false,
  };

  const setupMocks = () => {
    const user = currentUserFactory({
      tenants: [
        tenantFactory({
          name: 'name',
          id: MOCKED_TENANT_ID,
        }),
      ],
    });
    const commonQueryMock = fillCommonQueryWithUser(user);
    const rolesMock = createRolesMock();
    return { commonQueryMock, rolesMock };
  };

  const Component = (props: Partial<TenantInvitationFormProps>) => (
    <TenantInvitationForm {...defaultProps} {...props} />
  );

  it('should display initial email', async () => {
    const { commonQueryMock, rolesMock } = setupMocks();

    render(<Component />, {
      apolloMocks: [commonQueryMock, rolesMock],
    });

    const emailInput = await screen.findByLabelText(/email/i);
    expect(emailInput).toHaveValue(defaultProps.initialData?.email);
  });

  it('should render role selection dropdown', async () => {
    const { commonQueryMock, rolesMock } = setupMocks();

    render(<Component />, {
      apolloMocks: [commonQueryMock, rolesMock],
    });

    // Wait for roles to load
    await waitFor(() => {
      expect(screen.getByText(/Select roles/i)).toBeInTheDocument();
    });
  });

  it('should call onSubmit with email and selected roles', async () => {
    const onSubmit = jest.fn();
    const { commonQueryMock, rolesMock } = setupMocks();

    render(<Component onSubmit={onSubmit} />, {
      apolloMocks: [commonQueryMock, rolesMock],
    });

    // Clear and type email
    const emailField = await screen.findByLabelText(/email/i);
    await userEvent.clear(emailField);
    const emailValue = 'example@example.com';
    await userEvent.type(emailField, emailValue);

    // Wait for roles to load and open dropdown
    const rolesButton = await screen.findByText(/Select roles/i);
    await userEvent.click(rolesButton);

    // Select a role
    const memberRole = await screen.findByText('Member');
    await userEvent.click(memberRole);

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /invite/i });
    await userEvent.click(submitButton);

    // Verify onSubmit was called with correct data
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: emailValue,
        organizationRoleIds: ['role-1'],
      });
    });
  });

  it('should show non field error if error', async () => {
    const errorText = 'Provided value is invalid';
    const mockError = { graphQLErrors: [new GraphQLError(errorText)] } as any;
    const { commonQueryMock, rolesMock } = setupMocks();

    render(<Component error={mockError as Error} />, {
      apolloMocks: [commonQueryMock, rolesMock],
    });

    expect(await screen.findByText(errorText)).toBeInTheDocument();
  });
});
