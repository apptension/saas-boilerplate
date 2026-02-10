import { screen } from '@testing-library/react';

import { render } from '../../../tests/utils/rendering';
import { TenantInvitationAccepted } from '../tenantInvitationAccepted.component';

describe('TenantInvitationAccepted: Component', () => {
  it('should render notification with accepted invitation message', async () => {
    render(
      <TenantInvitationAccepted
        id="1"
        data={{
          id: 'inv-1',
          name: 'John Doe',
          tenant_name: 'Test Org',
        }}
        issuer={{ email: 'john@example.com', avatar: null }}
        readAt={null}
        createdAt="2024-01-01T00:00:00Z"
      />
    );

    expect(await screen.findByText(/john@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/invitation to "test org" has been accepted by "john doe"/i)).toBeInTheDocument();
  });

  it('should use issuer email when name is empty', async () => {
    render(
      <TenantInvitationAccepted
        id="1"
        data={{
          id: 'inv-1',
          name: '',
          tenant_name: 'Test Org',
        }}
        issuer={{ email: 'jane@example.com', avatar: null }}
        readAt={null}
        createdAt="2024-01-01T00:00:00Z"
      />
    );

    expect(await screen.findByText(/invitation to "test org" has been accepted by "jane@example.com"/i)).toBeInTheDocument();
  });
});
