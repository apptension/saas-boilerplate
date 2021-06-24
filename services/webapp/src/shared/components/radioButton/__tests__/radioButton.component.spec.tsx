import React from 'react';
import { screen } from '@testing-library/react';
import { empty } from 'ramda';
import { makeContextRenderer } from '../../../utils/testUtils';
import { RadioButton, RadioButtonProps } from '../radioButton.component';

describe('RadioButton: Component', () => {
  const defaultProps: RadioButtonProps = { children: 'label' };

  const component = (props: Partial<RadioButtonProps>) => {
    return <RadioButton {...defaultProps} {...props} />;
  };
  const render = makeContextRenderer(component);

  it('should render with correct label', () => {
    render();
    expect(screen.getByLabelText('label')).toBeInTheDocument();
  });

  it('should pass props to input element', () => {
    render({ checked: true, onChange: empty });
    expect(screen.getByRole('radio')).toHaveAttribute('checked');
  });
});
