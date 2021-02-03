import React from 'react';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input, InputProps } from '../input.component';
import { makeContextRenderer } from '../../../utils/testUtils';

describe('Input: Component', () => {
  const defaultProps: InputProps = {};

  const component = (props: Partial<InputProps>) => <Input {...defaultProps} {...props} />;
  const render = makeContextRenderer(component);

  it('should display entered value', () => {
    render();
    userEvent.type(screen.getByRole('textbox'), 'My value');
    expect(screen.getByDisplayValue('My value')).toBeInTheDocument();
  });

  it('should render provided error message', () => {
    render({ error: 'Invalid value' });
    expect(screen.getByText('Invalid value')).toBeInTheDocument();
  });
});
