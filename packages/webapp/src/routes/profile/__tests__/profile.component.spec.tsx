import { screen } from '@testing-library/react';

import { render } from '../../../tests/utils/rendering';
import { Profile } from '../profile.component';
import { currentUserFactory } from '../../../mocks/factories';
import { Role } from '../../../modules/auth/auth.types';
import { fillCommonQueryWithUser } from '../../../shared/utils/commonQuery';

describe('Profile: Component', () => {
  const Component = () => <Profile />;

  it('should display profile data', async () => {
    const apolloMocks = [
      fillCommonQueryWithUser(
        undefined,
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
    expect(screen.getByText(/admin,user/i)).toBeInTheDocument();
  });
});
