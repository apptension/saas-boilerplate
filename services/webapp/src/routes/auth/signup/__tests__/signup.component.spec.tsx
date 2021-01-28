import React from 'react';

import { makeContextRenderer } from '../../../../shared/utils/testUtils';
import { Signup } from '../signup.component';

describe('Signup: Component', () => {
  const component = () => <Signup />;
  const render = makeContextRenderer(component);

  it('should render correctly', () => {
    const { container } = render();
    expect(container.firstChild).toMatchSnapshot();
  });
});
