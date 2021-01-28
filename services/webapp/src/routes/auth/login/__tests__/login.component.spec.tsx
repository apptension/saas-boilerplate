import React from 'react';

import { makeContextRenderer } from '../../../../shared/utils/testUtils';
import { Login } from '../login.component';

describe('Login: Component', () => {
  const component = () => <Login />;
  const render = makeContextRenderer(component);

  it('should render correctly', () => {
    const { container } = render();
    expect(container.firstChild).toMatchSnapshot();
  });
});
