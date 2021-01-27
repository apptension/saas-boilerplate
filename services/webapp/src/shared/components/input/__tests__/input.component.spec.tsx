import React from 'react';

import { Input, InputProps } from '../input.component';
import { makeContextRenderer } from '../../../utils/testUtils';

describe('Input: Component', () => {
  const defaultProps: InputProps = {};

  const component = (props: Partial<InputProps>) => <Input {...defaultProps} {...props} />;
  const render = makeContextRenderer(component);

  it('should render without errors', () => {
    render();
  });
});
