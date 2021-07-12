import { screen } from '@testing-library/react';
import { makeContextRenderer } from '../../../utils/testUtils';
import { Avatar } from '../avatar.component';
import { prepareState } from '../../../../mocks/store';
import { loggedInAuthFactory, userProfileFactory } from '../../../../mocks/factories';
import { Profile } from '../../../../modules/auth/auth.types';

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

    return { profile, ...render({}, { store }) };
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
