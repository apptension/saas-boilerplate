import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { screen } from '@testing-library/react';

import { Role } from '../../../modules/auth/auth.types';
import { render } from '../../../tests/utils/rendering';
import { Admin } from '../admin.component';

describe('Profile: Component', () => {
  const Component = () => <Admin />;

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

    expect(screen.getByText(/This page is only visible for admins/i)).toBeInTheDocument();
    expect(screen.getByText(/It's fully secure/i)).toBeInTheDocument();
    expect(screen.getByText(/Regular users do not have access here/i)).toBeInTheDocument();
  });
});
