import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { render } from '../../../../tests/utils/rendering';
import { DataTable, DataTableProps } from '../dataTable.component';

describe('DataTable: Component', () => {
  const defaultProps: DataTableProps<any, any> = {
    columns: [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: (info) => info.getValue(),
      },
    ],
    data: [],
  };

  const Component = (props: Partial<DataTableProps<any, any>>) => <DataTable {...defaultProps} {...props} />;

  it('should render with data', () => {
    const data = [{ name: 'John Doe' }];
    render(<Component data={data} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    render(<Component isLoading={true} />);
    expect(screen.getAllByRole('row')).toHaveLength(4);
  });

  it('should display empty state message', () => {
    render(<Component data={[]} emptyMessage="No data available" />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should call onRowClick when a row is clicked', async () => {
    const onRowClick = jest.fn();
    const data = [{ name: 'John Doe' }];
    render(<Component data={data} onRowClick={onRowClick} />);
    await userEvent.click(screen.getByText('John Doe'));
    expect(onRowClick).toHaveBeenCalled();
  });
});
