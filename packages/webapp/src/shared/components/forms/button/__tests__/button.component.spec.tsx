import { screen, fireEvent } from '@testing-library/react';
import { Button, ButtonProps } from '../button.component';
import { render } from '../../../../../tests/utils/rendering';

describe('Button: Component', () => {
  const defaultProps = {};

  const Component = (props: Partial<ButtonProps>) => <Button {...defaultProps} {...props} />;

  it('should call onClick prop when clicked', () => {
    const label = <span>PRESS HERE</span>;
    const onClick = jest.fn();
    render(<Component onClick={onClick}>{label}</Component>);

    fireEvent.click(screen.getByText('PRESS HERE'));
    expect(onClick).toHaveBeenCalled();
    onClick.mockReset();

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('should pass native HTML props directly to the button element', () => {
    render(<Component aria-label="some-label" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'some-label');
  });
});
