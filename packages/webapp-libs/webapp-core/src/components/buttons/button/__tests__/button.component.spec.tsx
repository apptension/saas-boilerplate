import { screen, fireEvent } from '@testing-library/react';

import { render } from '../../../../tests/utils/rendering';
import { Button, ButtonProps } from '../button.component';

describe('Button: Component', () => {
  const defaultProps = {};

  const Component = (props: Partial<ButtonProps>) => <Button {...defaultProps} {...props} />;

  it('should call onClick prop when clicked', async () => {
    const label = <span>PRESS HERE</span>;
    const onClick = jest.fn();
    render(<Component onClick={onClick}>{label}</Component>);

    fireEvent.click(await screen.findByText('PRESS HERE'));
    expect(onClick).toHaveBeenCalled();
    onClick.mockReset();

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('should pass native HTML props directly to the button element', async () => {
    render(<Component aria-label="some-label" />);
    expect(await screen.findByRole('button')).toHaveAttribute('aria-label', 'some-label');
  });
});
