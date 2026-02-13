import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { screen } from '@testing-library/react';

import { tenantFactory } from '../../../tests/factories/tenant';
import { render } from '../../../tests/utils/rendering';
import { TenantInvitationCreated } from '../tenantInvitationCreated.component';

describe('TenantInvitationCreated: Component', () => {
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
});
