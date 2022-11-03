import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../../tests/utils/rendering';
import { Checkbox, CheckboxProps } from '../checkbox.component';

describe('Checkbox: Component', () => {
  const defaultProps: CheckboxProps = {
    label: 'Checkbox label',
  };

  const Component = (props: Partial<CheckboxProps>) => <Checkbox {...defaultProps} {...props} />;

  it('should be unchecked by default', () => {
    render(<Component />);
    expect((screen.getByRole('checkbox', { hidden: true }) as HTMLInputElement).checked).toEqual(false);
  });

  it('should be checked after clicking', async () => {
    render(<Component />);
    await userEvent.click(screen.getByText('Checkbox label'));
    expect((screen.getByRole('checkbox', { hidden: true }) as HTMLInputElement).checked).toEqual(true);
  });

  it('should render provided error message', () => {
    render(<Component error="Invalid value" />);
    expect(screen.getByText('Invalid value')).toBeInTheDocument();
  });
});
