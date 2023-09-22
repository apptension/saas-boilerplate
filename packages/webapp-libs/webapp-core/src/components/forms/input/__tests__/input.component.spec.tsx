import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { render } from '../../../../tests/utils/rendering';
import { Input, InputProps } from '../input.component';

describe('Input: Component', () => {
  const defaultProps: InputProps = {};

  const Component = (props: Partial<InputProps>) => <Input {...defaultProps} {...props} />;

  it('should display entered value', async () => {
    render(<Component />);
    await userEvent.type(await screen.findByRole('textbox'), 'My value');
    expect(screen.getByDisplayValue('My value')).toBeInTheDocument();
  });

  it('should render provided error message', async () => {
    render(<Component error="Invalid value" />);
    expect(await screen.findByText('Invalid value')).toBeInTheDocument();
  });
});
