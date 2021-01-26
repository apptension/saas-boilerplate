import React from 'react';
import { Home } from '../home.component';
import { makeContextRenderer } from '../../../shared/utils/testUtils';

describe('Home: Component', () => {
  const component = () => <Home />;
  const render = makeContextRenderer(component);

  it('should render correctly', () => {
    const { container } = render();
    expect(container.firstChild).toMatchSnapshot();
  });
});
