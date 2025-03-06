import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { render } from '../../../../tests/utils/rendering';
import { TABLE_FILTER_TYPES } from '../../table.types';
import { TableToolbarFacetedFilter, TableToolbarFacetedFilterProps } from '../tableToolbarFacetedFilter.component';

describe('TableToolbarFacetedFilter: Component', () => {
  const defaultProps: TableToolbarFacetedFilterProps = {
    value: undefined,
    config: {
      id: 'test-filter',
      label: 'Test Filter',
      type: TABLE_FILTER_TYPES.BOOLEAN,
      switchLabel: 'Show test',
      options: [],
    },
    onChange: jest.fn(),
  };

  const Component = (props: Partial<TableToolbarFacetedFilterProps>) => (
    <TableToolbarFacetedFilter {...defaultProps} {...props} />
  );

  it('should render boolean selection', () => {
    render(<Component value={true} />);
    expect(screen.getByText('Test Filter')).toBeInTheDocument();
    expect(screen.getByTestId('checked')).toBeInTheDocument();
  });

  it('should render select selection', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ];
    render(
      <Component config={{ ...defaultProps.config, type: TABLE_FILTER_TYPES.SELECT, options }} value={['option1']} />
    );
    expect(screen.getByText('Test Filter')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('should open boolean popover and change value', async () => {
    render(<Component />);
    await userEvent.click(screen.getByRole('button', { name: /test filter/i }));
    const switchElement = screen.getByText('Show test');
    await userEvent.click(switchElement);
    expect(defaultProps.onChange).toHaveBeenCalledWith('test-filter', true);
  });

  it('should open select popover and change value', async () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ];
    render(<Component config={{ ...defaultProps.config, type: TABLE_FILTER_TYPES.SELECT, options }} />);
    await userEvent.click(screen.getByRole('button', { name: /test filter/i }));
    const optionElement = screen.getByText('Option 1');
    expect(optionElement).toBeInTheDocument();
    await userEvent.click(optionElement);
    expect(defaultProps.onChange).toHaveBeenCalledWith('test-filter', ['option1']);
  });

  it('should clear filters', async () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ];
    render(
      <Component config={{ ...defaultProps.config, type: TABLE_FILTER_TYPES.SELECT, options }} value={['option1']} />
    );
    await userEvent.click(screen.getByRole('button', { name: /test filter/i }));
    const clearButton = screen.getByText('Clear filters');
    expect(clearButton).toBeInTheDocument();
    await userEvent.click(clearButton);
    expect(defaultProps.onChange).toHaveBeenCalledWith('test-filter', undefined);
  });
});
