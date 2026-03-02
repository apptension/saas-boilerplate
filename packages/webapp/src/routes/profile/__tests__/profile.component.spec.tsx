import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { screen } from '@testing-library/react';

import { Role } from '../../../modules/auth/auth.types';
import { render } from '../../../tests/utils/rendering';
import { Profile } from '../profile.component';

describe('Profile: Component', () => {
  const Component = () => <Profile />;

  it('should display profile data', async () => {
    const apolloMocks = [
      fillCommonQueryWithUser(
        currentUserFactory({
          firstName: 'Jack',
          lastName: 'White',
          email: 'jack.white@mail.com',
          roles: [Role.ADMIN, Role.USER],
        })
      ),
    ];
    render(<Component />, { apolloMocks });
    expect(await screen.findByDisplayValue('Jack')).toBeInTheDocument();
    expect(screen.getByDisplayValue('White')).toBeInTheDocument();
    expect(screen.getByText(/jack.white@mail.com/i)).toBeInTheDocument();
    // Roles are now displayed as badges, so we check for individual role text
    expect(screen.getByText(/admin/i)).toBeInTheDocument();
    // Check for USER role badge specifically (case-insensitive, but not matching "User profile" heading)
    const roleBadges = screen.getAllByText(/user/i);
    expect(roleBadges.length).toBeGreaterThan(0);
  });
});
