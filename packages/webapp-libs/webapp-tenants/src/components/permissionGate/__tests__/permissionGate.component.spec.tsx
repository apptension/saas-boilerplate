import { screen } from '@testing-library/react';

import { render } from '../../../tests/utils/rendering';
import { PermissionGate } from '../permissionGate.component';

jest.mock('../../../hooks/usePermissionCheck', () => ({
  usePermissionCheck: jest.fn(),
}));

const mockUsePermissionCheck = jest.requireMock('../../../hooks/usePermissionCheck').usePermissionCheck;

describe('PermissionGate: Component', () => {
  beforeEach(() => {
    mockUsePermissionCheck.mockReturnValue({
      hasPermission: true,
      hasAnyPermission: true,
      hasAllPermissions: true,
      loading: false,
    });
  });

  it('should render children when user has permission', async () => {
    mockUsePermissionCheck.mockReturnValue({
      hasPermission: true,
      hasAnyPermission: true,
      hasAllPermissions: true,
      loading: false,
    });

    render(
      <PermissionGate permissions="org.settings.edit">
        <button>Edit</button>
      </PermissionGate>
    );

    expect(await screen.findByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('should render fallback when user lacks permission', async () => {
    mockUsePermissionCheck.mockReturnValue({
      hasPermission: false,
      hasAnyPermission: false,
      hasAllPermissions: false,
      loading: false,
    });

    render(
      <PermissionGate permissions="org.settings.edit" fallback={<span>Access denied</span>}>
        <button>Edit</button>
      </PermissionGate>
    );

    expect(await screen.findByText('Access denied')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });

  it('should render nothing when loading and not optimistic', async () => {
    mockUsePermissionCheck.mockReturnValue({
      hasPermission: false,
      hasAnyPermission: false,
      hasAllPermissions: false,
      loading: true,
    });

    const { container } = render(
      <PermissionGate permissions="org.settings.edit">
        <button>Edit</button>
      </PermissionGate>
    );

    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });

  it('should render children when loading and optimistic', async () => {
    mockUsePermissionCheck.mockReturnValue({
      hasPermission: false,
      hasAnyPermission: false,
      hasAllPermissions: false,
      loading: true,
    });

    render(
      <PermissionGate permissions="org.settings.edit" optimistic>
        <button>Edit</button>
      </PermissionGate>
    );

    expect(await screen.findByRole('button', { name: /edit/i })).toBeInTheDocument();
  });
});
