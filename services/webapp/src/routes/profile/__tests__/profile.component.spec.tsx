import React from 'react';

import { makeContextRenderer } from '../../../shared/utils/testUtils';
import { Profile } from '../profile.component';

describe('Profile: Component', () => {
  const component = () => <Profile />;
  const render = makeContextRenderer(component);

  it('should render without errors', () => {
    render();
  });
});
