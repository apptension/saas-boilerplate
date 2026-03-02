import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { render } from '../../../tests/utils/rendering';
import { Button } from '../button.component';

describe('Notification Button: Component', () => {
  it('should render children', async () => {
    render(<Button>Click me</Button>);

    expect(await screen.findByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should call onClick and stop propagation', async () => {
    const onClick = jest.fn();
    const parentOnClick = jest.fn();

    render(
      <div onClick={parentOnClick}>
        <Button onClick={onClick}>Click me</Button>
      </div>
    );

    const button = await screen.findByRole('button', { name: /click me/i });
    await userEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(parentOnClick).not.toHaveBeenCalled();
  });
});
