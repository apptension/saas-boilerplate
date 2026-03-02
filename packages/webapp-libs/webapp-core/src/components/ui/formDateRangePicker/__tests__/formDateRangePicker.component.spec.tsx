import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { render } from '../../../../tests/utils/rendering';
import { FormDateRangePicker } from '../formDateRangePicker.component';

describe('FormDateRangePicker', () => {
  it('renders with default placeholder', async () => {
    render(<FormDateRangePicker onStartChange={() => {}} onEndChange={() => {}} />);

    expect(screen.getByText('Select date range')).toBeInTheDocument();
  });

  it('renders with custom placeholder', async () => {
    render(<FormDateRangePicker placeholder="Pick dates" onStartChange={() => {}} onEndChange={() => {}} />);

    expect(screen.getByText('Pick dates')).toBeInTheDocument();
  });

  it('opens popover on click', async () => {
    render(<FormDateRangePicker onStartChange={() => {}} onEndChange={() => {}} />);

    await userEvent.click(screen.getByRole('combobox'));

    expect(screen.getByText('Apply')).toBeInTheDocument();
  });

  it('calls onStartChange and onEndChange when applying with pre-selected range', async () => {
    const onStartChange = jest.fn();
    const onEndChange = jest.fn();
    render(
      <FormDateRangePicker
        startValue="2024-01-01"
        endValue="2024-01-15"
        onStartChange={onStartChange}
        onEndChange={onEndChange}
      />
    );

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByText('Apply'));

    expect(onStartChange).toHaveBeenCalledWith('2024-01-01');
    expect(onEndChange).toHaveBeenCalledWith('2024-01-15');
  });

  it('shows validation error when end date is before start date', async () => {
    render(
      <FormDateRangePicker
        startValue="2024-02-15"
        endValue="2024-02-01"
        onStartChange={() => {}}
        onEndChange={() => {}}
      />
    );

    expect(screen.getByText('End date must be on or after start date')).toBeInTheDocument();
  });
});
