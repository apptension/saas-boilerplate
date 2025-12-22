import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { render } from '../../../tests/utils/rendering';
import { NotFound } from '../notFound.component';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('NotFound: Component', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('should display 404 error badge', async () => {
    render(<NotFound />);
    // 404 is rendered as pixel art SVG, so we check the error code badge instead
    expect(await screen.findByText(/ERROR_CODE: 404/i)).toBeInTheDocument();
  });

  it('should display headline message', async () => {
    render(<NotFound />);
    expect(await screen.findByText('PAGE NOT FOUND')).toBeInTheDocument();
  });

  it('should display description message', async () => {
    render(<NotFound />);
    expect(
      await screen.findByText(/This page has been corrupted/)
    ).toBeInTheDocument();
  });

  it('should display navigation buttons', async () => {
    render(<NotFound />);
    expect(await screen.findByRole('button', { name: /go back/i })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /home/i })).toBeInTheDocument();
  });

  it('should navigate back when "Go back" button is clicked', async () => {
    render(<NotFound />);

    const goBackButton = await screen.findByRole('button', { name: /go back/i });
    await userEvent.click(goBackButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('should have correct link to home page', async () => {
    render(<NotFound />);

    const homeLink = await screen.findByRole('link', { name: /home/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should display the status message', async () => {
    render(<NotFound />);
    expect(await screen.findByText(/STATUS: PAGE_MISSING/i)).toBeInTheDocument();
  });

  it('should set the page title', async () => {
    render(<NotFound />);
    // The Helmet component sets the document title
    expect(document.title).toBe('Page Not Found');
  });
});

