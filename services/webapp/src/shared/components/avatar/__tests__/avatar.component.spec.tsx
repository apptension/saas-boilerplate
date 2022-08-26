import { screen } from '@testing-library/react';
import { createMockEnvironment } from 'relay-test-utils';

import { makeContextRenderer } from '../../../utils/testUtils';
import { Avatar } from '../avatar.component';
import { prepareState } from '../../../../mocks/store';
import { currentUserFactory, loggedInAuthFactory, userProfileFactory } from '../../../../mocks/factories';
import { Profile } from '../../../../modules/auth/auth.types';
import { fillCommonQueryWithUser } from '../../../utils/commonQuery';

describe('Avatar: Component', () => {
  const component = () => <Avatar />;
  const render = makeContextRenderer(component);

  const renderWithProfile = (overrides?: Partial<Profile>) => {
    const profile = userProfileFactory(overrides);
    const store = prepareState((state) => {
      state.auth = loggedInAuthFactory({
        profile,
      });
    });

    const relayEnvironment = createMockEnvironment();
    fillCommonQueryWithUser(relayEnvironment, currentUserFactory(overrides));

    return { profile, ...render({}, { store, relayEnvironment }) };
  };

  it('should render user avatar', () => {
    const { profile } = renderWithProfile();

    expect(screen.getByRole('img')).toHaveAttribute('src', profile.avatar);
  });

  it('should render user initial', () => {
    renderWithProfile({
      firstName: 'John',
      avatar: null,
    });

    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('should render U if user has no name', () => {
    renderWithProfile({
      firstName: '',
      lastName: '',
      avatar: null,
    });

    expect(screen.getByText('U')).toBeInTheDocument();
  });
});
