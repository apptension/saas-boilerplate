import { screen } from '@testing-library/react';

import { render } from '../../../tests/utils/rendering';
import { Pagination, PaginationProps } from '../pagination.component';

describe('Pagination: Component', () => {
  const defaultProps: PaginationProps = {
    hasNext: false,
    hasPrevious: false,
    loadNext: () => undefined,
    loadPrevious: () => undefined,
  };
  const Component = (props: Partial<PaginationProps>) => <Pagination {...defaultProps} {...props} />;

  it('Should render disabled pagination buttons', async () => {
    render(<Component />);

    expect(screen.getByTestId('next-button')).toBeDisabled();
    expect(screen.getByTestId('previous-button')).toBeDisabled();
  });

  it('Should render disabled next buttons', async () => {
    render(<Component hasPrevious />);

    expect(screen.getByTestId('next-button')).toBeDisabled();
    expect(screen.getByTestId('previous-button')).not.toBeDisabled();
  });

  it('Should render disabled previous buttons', async () => {
    render(<Component hasNext />);

    expect(screen.getByTestId('next-button')).not.toBeDisabled();
    expect(screen.getByTestId('previous-button')).toBeDisabled();
  });

  it('Should call loadNext function', async () => {
    const mockedLoadNext = jest.fn();
    render(<Component hasNext loadNext={mockedLoadNext} />);

    const nextButton = screen.getByTestId('next-button');

    expect(nextButton).not.toBeDisabled();
    expect(screen.getByTestId('previous-button')).toBeDisabled();

    nextButton.click();

    expect(mockedLoadNext).toBeCalled();
  });

  it('Should call loadPrevious function', async () => {
    const mockedLoadPrevious = jest.fn();
    render(<Component hasPrevious loadPrevious={mockedLoadPrevious} />);

    const previousButton = screen.getByTestId('previous-button');

    expect(previousButton).not.toBeDisabled();
    expect(screen.getByTestId('next-button')).toBeDisabled();

    previousButton.click();

    expect(mockedLoadPrevious).toBeCalled();
  });
});
