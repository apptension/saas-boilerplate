import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { render } from '../../../../tests/utils/rendering';
import { Checkbox, CheckboxProps } from '../checkbox.component';

describe('Checkbox: Component', () => {
  const defaultProps: CheckboxProps = {
    label: 'Checkbox label',
  };

  const Component = (props: Partial<CheckboxProps>) => <Checkbox {...defaultProps} {...props} />;

  it('should be unchecked by default', async () => {
    render(<Component />);
    expect(((await screen.findByRole('checkbox', { hidden: true })) as HTMLInputElement).checked).toEqual(false);
  });

  it('should be checked after clicking', async () => {
    render(<Component />);
    await userEvent.click(await screen.findByText('Checkbox label'));
    expect((screen.getByRole('checkbox', { hidden: true }) as HTMLInputElement).checked).toEqual(true);
  });

  it('should render provided error message', async () => {
    render(<Component error="Invalid value" />);
    expect(await screen.findByText('Invalid value')).toBeInTheDocument();
  });
});
