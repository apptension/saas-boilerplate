import React from 'react';

import { screen } from '@testing-library/react';
import { makeContextRenderer } from '../../../utils/testUtils';
import { Avatar } from '../avatar.component';
import { prepareState } from '../../../../mocks/store';
import { loggedInAuthFactory, userProfileFactory } from '../../../../mocks/factories';

describe('Avatar: Component', () => {
  const store = prepareState((state) => {
    state.auth = loggedInAuthFactory();
    state.auth.profile = userProfileFactory({ firstName: 'John' });
  });
  const component = () => <Avatar />;
  const render = makeContextRenderer(component);

  it('should render user initial', () => {
    render({}, { store });
    expect(screen.getByText('J')).toBeInTheDocument();
  });
});
