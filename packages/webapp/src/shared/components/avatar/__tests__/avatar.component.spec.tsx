import { CurrentUserType } from '@sb/webapp-api-client/graphql';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { screen } from '@testing-library/react';

import { render } from '../../../../tests/utils/rendering';
import { Avatar } from '../avatar.component';

describe('Avatar: Component', () => {
  const Component = () => <Avatar />;

  const renderWithProfile = (overrides?: Partial<CurrentUserType>) => {
    const currentUser = currentUserFactory(overrides);
    const apolloMocks = [fillCommonQueryWithUser(currentUser)];

    return { currentUser, ...render(<Component />, { apolloMocks }) };
  };

  it('should render user avatar', async () => {
    const { currentUser } = renderWithProfile();

    // Wait for image to load (Radix UI Avatar loads image asynchronously)
    // Radix UI AvatarImage uses <img> tag, so we can find by alt text
    const image = await screen.findByAltText('user avatar', {}, { timeout: 3000 });
    expect(image).toHaveAttribute('src', currentUser.avatar);
  });

  it('should render user initial', async () => {
    renderWithProfile({
      firstName: 'John',
      avatar: null,
    });

    expect(await screen.findByText('J')).toBeInTheDocument();
  });

  it('should render U if user has no name', async () => {
    renderWithProfile({
      firstName: '',
      lastName: '',
      avatar: null,
    });

    expect(await screen.findByText('U')).toBeInTheDocument();
  });
});
