import userEvent from '@testing-library/user-event';
import { waitFor, screen } from '@testing-library/react';
import { makeContextRenderer } from '../../../../utils/testUtils';
import { SignupForm } from '../signupForm.component';
import { signup } from '../../../../../modules/auth/auth.actions';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

describe('SignupForm: Component', () => {
  const component = () => <SignupForm />;
  const render = makeContextRenderer(component);

  beforeEach(() => {
    mockDispatch.mockReset();
  });

  it('should call signup action when submitted', async () => {
    const mockCreds = {
      email: 'user@mail.com',
      password: 'abcxyz123456',
    };

    mockDispatch.mockResolvedValue({ error: false });

    render();
    await userEvent.type(screen.getByLabelText(/email/i), mockCreds.email);
    await userEvent.type(screen.getByLabelText(/password/i), mockCreds.password);
    await userEvent.click(screen.getByLabelText(/accept/i));
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(signup(mockCreds));
    });
  });

  it('should show error if password value is missing', async () => {
    render();
    await userEvent.type(screen.getByLabelText(/email/i), 'user@mail.com');
    await userEvent.click(screen.getByLabelText(/accept/i));
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('should show error if terms are not accepted', async () => {
    render();
    await userEvent.type(screen.getByLabelText(/email/i), 'user@mail.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'abcxyz123456');
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('You need to accept terms and conditions')).toBeInTheDocument();
    });
  });

  it('should show field error if action throws error', async () => {
    mockDispatch.mockResolvedValue({
      isError: true,
      password: [{ message: 'Provided password is invalid', code: 'invalid' }],
    });

    render();
    await userEvent.type(screen.getByLabelText(/email/i), 'user@mail.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'abcxyz123456');
    await userEvent.click(screen.getByLabelText(/accept/i));
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('Provided password is invalid')).toBeInTheDocument();
    });
  });

  it('should show generic form error if action throws error', async () => {
    mockDispatch.mockResolvedValue({
      isError: true,
      nonFieldErrors: [{ message: 'Invalid credentials', code: 'invalid' }],
    });

    render();
    await userEvent.type(screen.getByLabelText(/email/i), 'user@mail.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'abcxyz123456');
    await userEvent.click(screen.getByLabelText(/accept/i));
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});
