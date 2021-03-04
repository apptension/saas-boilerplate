import React from 'react';
import userEvent from '@testing-library/user-event';
import { act, waitFor, screen } from '@testing-library/react';
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
      password: 'abcxyz',
    };

    mockDispatch.mockResolvedValue({ error: false });

    render();
    userEvent.type(screen.getByLabelText(/email/gi), mockCreds.email);
    userEvent.type(screen.getByLabelText(/password/gi), mockCreds.password);
    userEvent.click(screen.getByLabelText(/accept/gi));
    act(() => userEvent.click(screen.getByRole('button', { name: /sign up/gi })));
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(signup(mockCreds));
    });
  });

  it('should show error if password value is missing', async () => {
    render();
    userEvent.type(screen.getByLabelText(/email/gi), 'user@mail.com');
    userEvent.click(screen.getByLabelText(/accept/gi));
    userEvent.click(screen.getByRole('button', { name: /sign up/gi }));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('should show error if terms are not accepted', async () => {
    render();
    userEvent.type(screen.getByLabelText(/email/gi), 'user@mail.com');
    userEvent.type(screen.getByLabelText(/password/gi), 'asdzxc');
    userEvent.click(screen.getByRole('button', { name: /sign up/gi }));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('You need to accept terms and conditions')).toBeInTheDocument();
    });
  });

  it('should show field error if action throws error', async () => {
    mockDispatch.mockResolvedValue({ isError: true, password: ['Provided password is invalid'] });

    render();
    userEvent.type(screen.getByLabelText(/email/gi), 'user@mail.com');
    userEvent.type(screen.getByLabelText(/password/gi), 'abcxyz');
    userEvent.click(screen.getByLabelText(/accept/gi));
    act(() => userEvent.click(screen.getByRole('button', { name: /sign up/gi })));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('Provided password is invalid')).toBeInTheDocument();
    });
  });

  it('should show generic form error if action throws error', async () => {
    mockDispatch.mockResolvedValue({ isError: true, nonFieldErrors: ['Invalid credentials'] });

    render();
    userEvent.type(screen.getByLabelText(/email/gi), 'user@mail.com');
    userEvent.type(screen.getByLabelText(/password/gi), 'abcxyz');
    userEvent.click(screen.getByLabelText(/accept/gi));
    act(() => userEvent.click(screen.getByRole('button', { name: /sign up/gi })));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});
