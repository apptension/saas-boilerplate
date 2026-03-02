import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { render } from '../../../../tests/utils/rendering';
import { MonthPicker } from '../monthPicker.component';

describe('MonthPicker', () => {
  it('renders with default placeholder', () => {
    render(<MonthPicker onChange={() => {}} />);

    expect(screen.getByText('Select month')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<MonthPicker placeholder="Choose month" onChange={() => {}} />);

    expect(screen.getByText('Choose month')).toBeInTheDocument();
  });

  it('opens popover on click', async () => {
    render(<MonthPicker onChange={() => {}} />);

    await userEvent.click(screen.getByRole('combobox'));

    expect(screen.getByText('Jan')).toBeInTheDocument();
    expect(screen.getByText('This month')).toBeInTheDocument();
  });

  it('displays selected month', async () => {
    render(<MonthPicker value="2024-03" onChange={() => {}} />);

    expect(screen.getByText('Mar 2024')).toBeInTheDocument();
  });

  it('calls onChange when month is selected', async () => {
    const onChange = jest.fn();
    render(<MonthPicker onChange={onChange} />);

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByText('Mar'));

    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/202\d-03/));
  });

  it('calls onChange with undefined when clear is clicked', async () => {
    const onChange = jest.fn();
    render(<MonthPicker value="2024-03" onChange={onChange} />);

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByText('Clear'));

    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});
