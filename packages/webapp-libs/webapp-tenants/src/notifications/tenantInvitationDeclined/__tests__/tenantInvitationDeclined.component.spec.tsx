import { screen } from '@testing-library/react';

import { render } from '../../../tests/utils/rendering';
import { TenantInvitationDeclined } from '../tenantInvitationDeclined.component';

describe('TenantInvitationDeclined: Component', () => {
  it('should render notification with declined invitation message', async () => {
    render(
      <TenantInvitationDeclined
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
    expect(screen.getByText(/invitation to "test org" has been declined by "john doe"/i)).toBeInTheDocument();
  });

  it('should use issuer email when name is empty', async () => {
    render(
      <TenantInvitationDeclined
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

    expect(await screen.findByText(/invitation to "test org" has been declined by "jane@example.com"/i)).toBeInTheDocument();
  });
});
