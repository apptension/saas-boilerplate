import { screen } from '@testing-library/react';

import { render } from '../../../../tests/utils/rendering';
import { Avatar } from '../avatar.component';
import { currentUserFactory } from '../../../../mocks/factories';
import { fillCommonQueryWithUser } from '../../../utils/commonQuery';
import { CurrentUserType } from '../../../services/graphqlApi';

describe('Avatar: Component', () => {
  const Component = () => <Avatar />;

  const renderWithProfile = (overrides?: Partial<CurrentUserType>) => {
    const currentUser = currentUserFactory(overrides);
    const apolloMocks = [fillCommonQueryWithUser(undefined, currentUser)];

    return { currentUser, ...render(<Component />, { apolloMocks }) };
  };

  it('should render user avatar', async () => {
    const { currentUser } = renderWithProfile();

    expect(await screen.findByRole('img')).toHaveAttribute('src', currentUser.avatar);
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
