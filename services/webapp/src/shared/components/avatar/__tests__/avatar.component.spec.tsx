import { screen } from '@testing-library/react';
import { createMockEnvironment } from 'relay-test-utils';

import { makeContextRenderer } from '../../../utils/testUtils';
import { Avatar } from '../avatar.component';
import { prepareState } from '../../../../mocks/store';
import { currentUserFactory } from '../../../../mocks/factories';
import { fillCommonQueryWithUser } from '../../../utils/commonQuery';
import { CurrentUserType } from '../../../services/graphqlApi/__generated/types';

describe('Avatar: Component', () => {
  const component = () => <Avatar />;
  const render = makeContextRenderer(component);

  const renderWithProfile = (overrides?: Partial<CurrentUserType>) => {
    const store = prepareState((state) => state);

    const relayEnvironment = createMockEnvironment();
    const currentUser = currentUserFactory(overrides);
    fillCommonQueryWithUser(relayEnvironment, currentUser);

    return { currentUser, ...render({}, { store, relayEnvironment }) };
  };

  it('should render user avatar', () => {
    const { currentUser } = renderWithProfile();

    expect(screen.getByRole('img')).toHaveAttribute('src', currentUser.avatar);
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
