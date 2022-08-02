import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeContextRenderer } from '../../../../utils/testUtils';
import { Checkbox, CheckboxProps } from '../checkbox.component';

describe('Checkbox: Component', () => {
  const defaultProps: CheckboxProps = {
    label: 'Checkbox label',
  };

  const component = (props: Partial<CheckboxProps>) => <Checkbox {...defaultProps} {...props} />;
  const render = makeContextRenderer(component);

  it('should be unchecked by default', () => {
    render();
    expect((screen.getByRole('checkbox', { hidden: true }) as HTMLInputElement).checked).toEqual(false);
  });

  it('should be checked after clicking', async () => {
    render();
    await userEvent.click(screen.getByText('Checkbox label'));
    expect((screen.getByRole('checkbox', { hidden: true }) as HTMLInputElement).checked).toEqual(true);
  });

  it('should render provided error message', () => {
    render({ error: 'Invalid value' });
    expect(screen.getByText('Invalid value')).toBeInTheDocument();
  });
});
