import { PAGE_SIZE_OPTIONS } from '@sb/webapp-api-client/hooks/usePagedPaginatedQuery';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { render } from '../../../../tests/utils/rendering';
import { TableFooter, TableFooterProps } from '../tableFooter.component';

describe('TableFooter: Component', () => {
  const defaultProps: TableFooterProps = {
    pageSize: 10,
    onPageSizeChange: jest.fn(),
    pagination: {
      around: [
        { cursor: '1', isCurrent: true, page: 1 },
        { cursor: '2', isCurrent: false, page: 2 },
        { cursor: '3', isCurrent: false, page: 3 },
      ],
      first: null,
      last: null,
      next: { cursor: '3', isCurrent: false, page: 2 },
      previous: null,
      onPageClick: jest.fn(),
    },
  };
  const Component = (props: Partial<TableFooterProps>) => <TableFooter {...defaultProps} {...props} />;

  it('Should change page size', async () => {
    const onPageSizeChange = jest.fn();
    render(<Component onPageSizeChange={onPageSizeChange} />);

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: PAGE_SIZE_OPTIONS[1].toString() }));

    expect(onPageSizeChange).toHaveBeenCalledWith(PAGE_SIZE_OPTIONS[1]);
  });

  it('Should handle pagination clicks', async () => {
    const onPageClick = jest.fn();
    const paginationProps = {
      ...defaultProps.pagination,
      onPageClick,
    };

    render(<Component pagination={paginationProps} />);

    await userEvent.click(screen.getByText('2'));
    expect(onPageClick).toHaveBeenCalledWith('2');
  });
});
