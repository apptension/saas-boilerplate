import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { render } from '../../../../tests/utils/rendering';
import { DueDatePicker } from '../dueDatePicker.component';

describe('DueDatePicker', () => {
  it('renders date picker without reference date', () => {
    const onChange = jest.fn();
    render(<DueDatePicker onChange={onChange} />);

    expect(screen.queryByText('7d')).not.toBeInTheDocument();
  });

  it('renders quick select buttons when reference date is set', () => {
    const onChange = jest.fn();
    render(<DueDatePicker referenceDate="2024-01-15" onChange={onChange} />);

    expect(screen.getByText(/7d/)).toBeInTheDocument();
    expect(screen.getByText(/14d/)).toBeInTheDocument();
    expect(screen.getByText(/30d/)).toBeInTheDocument();
    expect(screen.getByText(/60d/)).toBeInTheDocument();
  });

  it('calls onChange when quick select button is clicked', async () => {
    const onChange = jest.fn();
    render(<DueDatePicker referenceDate="2024-01-15" onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: /7d/ }));

    expect(onChange).toHaveBeenCalledWith('2024-01-22');
  });

  it('uses custom day offset labels when provided', () => {
    const onChange = jest.fn();
    render(
      <DueDatePicker
        referenceDate="2024-01-15"
        dayOffsets={[7]}
        dayOffsetLabels={{ 7: 'Net 7' }}
        onChange={onChange}
      />
    );

    expect(screen.getByRole('button', { name: /Net 7/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /7d/ })).not.toBeInTheDocument();
  });
});
