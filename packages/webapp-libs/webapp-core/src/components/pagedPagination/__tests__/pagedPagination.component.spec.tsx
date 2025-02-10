import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { render } from '../../../tests/utils/rendering';
import { PagedPagination, PagedPaginationProps } from '../pagedPagination.component';

describe('PagedPagination: Component', () => {
  const defaultProps: PagedPaginationProps = {
    around: [
      { cursor: 'cursor1', page: 1, isCurrent: true },
      { cursor: 'cursor2', page: 2, isCurrent: false },
      { cursor: 'cursor3', page: 3, isCurrent: false },
    ],
    first: null,
    last: { cursor: 'last', page: 10, isCurrent: false },
    next: { cursor: 'next', page: 4, isCurrent: false },
    previous: { cursor: 'prev', page: 2, isCurrent: false },
    onPageClick: jest.fn(),
  };

  const Component = (props: Partial<PagedPaginationProps>) => <PagedPagination {...defaultProps} {...props} />;

  it('should render pagination with all elements', () => {
    render(<Component />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should call onPageClick with correct cursor when clicking page number', async () => {
    const onPageClick = jest.fn();
    render(<Component onPageClick={onPageClick} />);

    await userEvent.click(screen.getByText('2'));
    expect(onPageClick).toHaveBeenCalledWith('cursor2');
  });

  it('should call onPageClick with next cursor when clicking next button', async () => {
    const onPageClick = jest.fn();
    render(<Component onPageClick={onPageClick} />);

    await userEvent.click(screen.getByTestId('paged-pagination-next-button'));
    expect(onPageClick).toHaveBeenCalledWith('next');
  });

  it('should call onPageClick with previous cursor when clicking previous button', async () => {
    const onPageClick = jest.fn();
    render(<Component onPageClick={onPageClick} />);

    await userEvent.click(screen.getByTestId('paged-pagination-prev-button'));
    expect(onPageClick).toHaveBeenCalledWith('prev');
  });

  it('should disable next button when next is null', () => {
    render(<Component next={null} />);

    expect(screen.getByTestId('paged-pagination-next-button')).toBeDisabled();
  });

  it('should disable previous button when previous is null', () => {
    render(<Component previous={null} />);

    expect(screen.getByTestId('paged-pagination-prev-button')).toBeDisabled();
  });

  it('should render last page with ellipsis when first is null', () => {
    render(<Component />);

    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<Component className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
