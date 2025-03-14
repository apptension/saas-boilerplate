import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { render } from '../../../../tests/utils/rendering';
import { TABLE_FILTER_TYPES } from '../../../table';
import { TableToolbar, TableToolbarProps } from '../tableToolbar.component';

describe('TableToolbar: Component', () => {
  const defaultProps: TableToolbarProps<any> = {
    onUpdate: jest.fn(),
    onReset: jest.fn(),
    config: {
      enableSearch: true,
    },
  };

  const Component = (props: Partial<TableToolbarProps<any>>) => <TableToolbar {...defaultProps} {...props} />;

  it('should render with default props', () => {
    render(<Component />);
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  });

  it('should call onUpdate when search input changes', async () => {
    jest.useFakeTimers();
    
    const onUpdate = jest.fn();
    render(<Component onUpdate={onUpdate} />);
    
    const searchInput = screen.getByPlaceholderText('Search');
    
    // Directly trigger change event
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    jest.advanceTimersByTime(1000);
    
    expect(onUpdate).toHaveBeenCalledWith({ search: 'test' });
    
    jest.useRealTimers();
  });

  it('should call onReset when reset button is clicked', async () => {
    const onReset = jest.fn();
    render(<Component values={{ search: 'test' }} onReset={onReset} />);
    const resetButton = screen.getByLabelText('Reset filters');
    await userEvent.click(resetButton);
    expect(onReset).toHaveBeenCalled();
  });

  it('should render filters if provided in config', () => {
    const filters = [{ id: 'filter1', label: 'Filter 1', type: TABLE_FILTER_TYPES.BOOLEAN }];
    render(<Component config={{ filters }} />);
    expect(screen.getByText('Filter 1')).toBeInTheDocument();
  });

  it('should update search state when values prop changes', () => {
    const { rerender } = render(<Component values={{ search: 'initial' }} />);
    expect(screen.getByPlaceholderText('Search')).toHaveValue('initial');
    rerender(<Component values={{ search: 'updated' }} />);
    expect(screen.getByPlaceholderText('Search')).toHaveValue('updated');
  });
});
