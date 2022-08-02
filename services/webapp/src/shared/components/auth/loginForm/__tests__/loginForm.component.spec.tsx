import userEvent from '@testing-library/user-event';
import { waitFor, screen } from '@testing-library/react';
import { makeContextRenderer } from '../../../../utils/testUtils';
import { LoginForm } from '../loginForm.component';
import { login } from '../../../../../modules/auth/auth.actions';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

describe('LoginForm: Component', () => {
  const component = () => <LoginForm />;
  const render = makeContextRenderer(component);

  beforeEach(() => {
    mockDispatch.mockReset();
  });

  it('should call login action when submitted', async () => {
    const mockCreds = {
      email: 'user@mail.com',
      password: 'abcxyz',
    };

    mockDispatch.mockResolvedValue({ isError: false });

    render();
    await userEvent.type(screen.getByLabelText(/email/i), mockCreds.email);
    await userEvent.type(screen.getByLabelText(/password/i), mockCreds.password);
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(login(mockCreds));
    });
  });

  it('should show error if required value is missing', async () => {
    render();
    await userEvent.type(screen.getByLabelText(/email/i), 'user@mail.com');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('should show field error if action throws error', async () => {
    const mockCreds = {
      email: 'user@mail.com',
      password: 'abcxyz',
    };

    mockDispatch.mockResolvedValue({
      isError: true,
      password: [{ message: 'Provided password is invalid', code: 'invalid' }],
    });

    render();
    await userEvent.type(screen.getByLabelText(/email/i), mockCreds.email);
    await userEvent.type(screen.getByLabelText(/password/i), mockCreds.password);
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('Provided password is invalid')).toBeInTheDocument();
    });
  });

  it('should show generic form error if action throws error', async () => {
    const mockCreds = {
      email: 'user@mail.com',
      password: 'abcxyz',
    };

    mockDispatch.mockResolvedValue({
      isError: true,
      nonFieldErrors: [{ message: 'Invalid credentials', code: 'invalid' }],
    });

    render();
    await userEvent.type(screen.getByLabelText(/email/i), mockCreds.email);
    await userEvent.type(screen.getByLabelText(/password/i), mockCreds.password);
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});
