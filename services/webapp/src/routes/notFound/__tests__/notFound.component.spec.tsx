import React from 'react';

import { makeContextRenderer } from '../../../shared/utils/testUtils';
import { NotFound } from '../notFound.component';

describe('NotFound: Component', () => {
  const component = () => <NotFound />;
  const render = makeContextRenderer(component);

  it('should render correctly', () => {
    const { container } = render();
    expect(container).toMatchSnapshot();
  });
});
