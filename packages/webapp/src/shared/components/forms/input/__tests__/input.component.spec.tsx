import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input, InputProps } from '../input.component';
import { render } from '../../../../../tests/utils/rendering';

describe('Input: Component', () => {
  const defaultProps: InputProps = {};

  const Component = (props: Partial<InputProps>) => <Input {...defaultProps} {...props} />;

  it('should display entered value', async () => {
    render(<Component />);
    await userEvent.type(screen.getByRole('textbox'), 'My value');
    expect(screen.getByDisplayValue('My value')).toBeInTheDocument();
  });

  it('should render provided error message', () => {
    render(<Component error="Invalid value" />);
    expect(screen.getByText('Invalid value')).toBeInTheDocument();
  });
});
