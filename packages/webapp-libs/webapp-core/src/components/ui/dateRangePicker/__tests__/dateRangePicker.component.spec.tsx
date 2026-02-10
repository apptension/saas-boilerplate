import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { render } from '../../../../tests/utils/rendering';
import { DateRangePicker } from '../dateRangePicker.component';

describe('DateRangePicker', () => {
  it('renders with default placeholder', async () => {
    render(<DateRangePicker onChange={() => {}} />);

    expect(screen.getByText('Select date range')).toBeInTheDocument();
  });

  it('renders with custom placeholder', async () => {
    render(<DateRangePicker placeholder="Pick range" onChange={() => {}} />);

    expect(screen.getByText('Pick range')).toBeInTheDocument();
  });

  it('opens popover on click', async () => {
    render(<DateRangePicker onChange={() => {}} />);

    await userEvent.click(screen.getByRole('button'));

    expect(screen.getByText('This Month')).toBeInTheDocument();
    expect(screen.getByText('Apply')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('displays preset labels', async () => {
    render(<DateRangePicker onChange={() => {}} />);

    await userEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Last Month')).toBeInTheDocument();
    expect(screen.getByText('This Quarter')).toBeInTheDocument();
    expect(screen.getByText('This Year')).toBeInTheDocument();
  });

  it('calls onChange when applying selected range', async () => {
    const onChange = jest.fn();
    render(<DateRangePicker onChange={onChange} />);

    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText('This Month'));
    await userEvent.click(screen.getByText('Apply'));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        from: expect.any(Date),
        to: expect.any(Date),
      })
    );
  });
});
