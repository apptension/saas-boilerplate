import React from 'react';

import { screen } from '@testing-library/react';
import { makeContextRenderer } from '../../../../shared/utils/testUtils';
import { ProfileDetails } from '../profileDetails.component';
import { prepareState } from '../../../../mocks/store';
import { userProfileFactory } from '../../../../mocks/factories';
import { Role } from '../../../../modules/auth/auth.types';

describe('ProfileDetails: Component', () => {
  const component = () => <ProfileDetails />;
  const store = prepareState((state) => {
    state.auth.profile = userProfileFactory({
      firstName: 'Jack',
      lastName: 'White',
      email: 'jack.white@mail.com',
      roles: [Role.ADMIN, Role.USER],
    });
  });
  const render = makeContextRenderer(component);

  it('should render profile data', () => {
    render({}, { store });
    expect(screen.getByText('Jack')).toBeInTheDocument();
    expect(screen.getByText('White')).toBeInTheDocument();
    expect(screen.getByText('jack.white@mail.com')).toBeInTheDocument();
    expect(screen.getByText('admin,user')).toBeInTheDocument();
  });
});
