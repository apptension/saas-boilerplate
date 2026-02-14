import { addDays } from 'date-fns';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { render } from '../../../../tests/utils/rendering';
import { CalendarHeatmap } from '../calendarHeatmap.component';

const FIXED_DATE = new Date(2025, 0, 15);
const WEEKS_TO_SHOW = 4;

describe('CalendarHeatmap', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_DATE);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders navigation buttons', () => {
    render(<CalendarHeatmap weeksToShow={WEEKS_TO_SHOW} visibleStart={FIXED_DATE} />);

    expect(screen.getByRole('button', { name: /go to previous year/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go to previous month/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go to next month/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go to next year/i })).toBeInTheDocument();
  });

  it('renders Today button', () => {
    render(<CalendarHeatmap weeksToShow={WEEKS_TO_SHOW} visibleStart={FIXED_DATE} />);

    expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument();
  });

  it('renders date range display', () => {
    render(<CalendarHeatmap weeksToShow={WEEKS_TO_SHOW} visibleStart={FIXED_DATE} />);

    expect(screen.getByText(/Jan 2025/)).toBeInTheDocument();
  });

  it('renders initial selection hint', () => {
    render(<CalendarHeatmap weeksToShow={WEEKS_TO_SHOW} visibleStart={FIXED_DATE} />);

    expect(screen.getByText(/click to select start date/i)).toBeInTheDocument();
  });

  it('calls onSelect when day is clicked', async () => {
    jest.useRealTimers();
    const onSelect = jest.fn();

    render(
      <CalendarHeatmap
        weeksToShow={WEEKS_TO_SHOW}
        visibleStart={FIXED_DATE}
        onSelect={onSelect}
      />
    );

    const dayButton = screen.getByRole('button', { name: /Wed, Jan 15, 2025/i });
    await userEvent.click(dayButton);

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        from: expect.any(Date),
        to: undefined,
      })
    );
    jest.useFakeTimers();
  });

  it('shows selection info when range is selected', () => {
    const from = FIXED_DATE;
    const to = addDays(FIXED_DATE, 3);

    render(
      <CalendarHeatmap
        weeksToShow={WEEKS_TO_SHOW}
        visibleStart={FIXED_DATE}
        selected={{ from, to }}
      />
    );

    expect(screen.getByText(/4 days selected/i)).toBeInTheDocument();
  });

  it('shows click to select end date when start is selected', () => {
    render(
      <CalendarHeatmap
        weeksToShow={WEEKS_TO_SHOW}
        visibleStart={FIXED_DATE}
        selected={{ from: FIXED_DATE }}
      />
    );

    expect(screen.getByText(/click to select end date/i)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <CalendarHeatmap weeksToShow={WEEKS_TO_SHOW} visibleStart={FIXED_DATE} className="custom-class" />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-class');
  });
});
