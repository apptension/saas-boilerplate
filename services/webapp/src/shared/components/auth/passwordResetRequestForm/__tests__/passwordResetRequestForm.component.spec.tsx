import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { makeContextRenderer } from '../../../../utils/testUtils';
import { PasswordResetRequestForm } from '../passwordResetRequestForm.component';
import { requestPasswordReset } from '../../../../../modules/auth/auth.actions';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

describe('PasswordResetRequestForm: Component', () => {
  beforeEach(() => {
    mockDispatch.mockReset();
  });

  const component = () => <PasswordResetRequestForm />;
  const render = makeContextRenderer(component);

  it('should call requestPasswordReset action when submitted', async () => {
    const email = 'user@mail.com';
    mockDispatch.mockResolvedValue({ isError: false });

    render();
    await userEvent.type(screen.getByLabelText(/email/i), email);
    await userEvent.click(screen.getByRole('button', { name: /send the link/i }));
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(requestPasswordReset({ email }));
    });
  });

  it('should show resend button if action completes successfully', async () => {
    const email = 'user@mail.com';

    mockDispatch.mockResolvedValue({ isError: false });

    render();
    await userEvent.type(screen.getByLabelText(/email/i), email);
    await userEvent.click(screen.getByRole('button', { name: /send the link/i }));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText(/send the link again/i)).toBeInTheDocument();
    });
  });

  it('should show error if required value is missing', async () => {
    render();
    await userEvent.click(screen.getByRole('button', { name: /send the link/i }));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  it('should show field error if action throws error', async () => {
    const email = 'user@mail.com';

    mockDispatch.mockResolvedValue({ isError: true, email: [{ message: 'Email is invalid', code: 'invalid' }] });

    render();
    await userEvent.type(screen.getByLabelText(/email/i), email);
    await userEvent.click(screen.getByRole('button', { name: /send the link/i }));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('Email is invalid')).toBeInTheDocument();
    });
  });

  it('should show generic form error if action throws error', async () => {
    const email = 'user@mail.com';

    mockDispatch.mockResolvedValue({ isError: true, nonFieldErrors: [{ message: 'Invalid data', code: 'invalid' }] });

    render();
    await userEvent.type(screen.getByLabelText(/email/i), email);
    await userEvent.click(screen.getByRole('button', { name: /send the link/i }));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('Invalid data')).toBeInTheDocument();
    });
  });
});
