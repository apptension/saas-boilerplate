import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { membershipFactory, tenantFactory } from '../../../tests/factories/tenant';
import { render } from '../../../tests/utils/rendering';
import { TenantInvitationCreated } from '../tenantInvitationCreated.component';

const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}));

describe('TenantInvitationCreated: Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should render notification with invitation message', async () => {
    const apolloMocks = [
      fillCommonQueryWithUser(
        currentUserFactory({
          tenants: [tenantFactory({ name: 'Test Org' })],
        })
      ),
    ];

    render(
      <TenantInvitationCreated
        id="1"
        data={{
          id: 'inv-1',
          tenant_name: 'Test Org',
        }}
        issuer={{ email: 'admin@example.com', avatar: null }}
        readAt={null}
        createdAt="2024-01-01T00:00:00Z"
      />,
      { apolloMocks }
    );

    expect(await screen.findByText(/admin@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/you have been invited to "test org"/i)).toBeInTheDocument();
  });

  it('should navigate to invitation when clicked and tenant has matching membership', async () => {
    const membership = membershipFactory({ id: 'inv-1', invitationToken: 'token-123' });
    const tenant = tenantFactory({ name: 'Test Org', membership });
    const apolloMocks = [
      fillCommonQueryWithUser(currentUserFactory({ tenants: [tenant] })),
    ];

    render(
      <TenantInvitationCreated
        id="1"
        data={{
          id: 'inv-1',
          tenant_name: 'Test Org',
        }}
        issuer={{ email: 'admin@example.com', avatar: null }}
        readAt={null}
        createdAt="2024-01-01T00:00:00Z"
      />,
      { apolloMocks }
    );

    const notification = await screen.findByText(/you have been invited to "test org"/i);
    await userEvent.click(notification);

    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('token-123'));
  });
});
