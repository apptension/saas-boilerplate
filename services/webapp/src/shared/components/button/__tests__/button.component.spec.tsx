import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { Button, ButtonProps } from '../button.component';
import { makePropsRenderer } from '../../../utils/testUtils';

describe('Button: Component', () => {
  const defaultProps = {};

  const component = (props: Partial<ButtonProps>) => <Button {...defaultProps} {...props} />;
  const render = makePropsRenderer(component);

  it('should call onClick prop when clicked', () => {
    const label = <span>PRESS HERE</span>;
    const onClick = jest.fn();
    render({ onClick, children: label });

    fireEvent.click(screen.getByText('PRESS HERE'));
    expect(onClick).toHaveBeenCalled();
    onClick.mockReset();

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('should pass native HTML props directly to the button element', () => {
    render({ 'aria-label': 'some-label' });
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'some-label');
  });
});
