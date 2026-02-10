import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { render } from '../../../../../tests/utils/rendering';
import { AddPasskeyModal } from '../addPasskeyModal';

describe('AddPasskeyModal: Component', () => {
  const closeModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'PublicKeyCredential', {
      value: {},
      configurable: true,
    });
  });

  it('should render passkey registration form', async () => {
    render(<AddPasskeyModal closeModal={closeModal} />);

    expect(await screen.findByText(/register a passkey/i)).toBeInTheDocument();
    expect(screen.getByText(/secure, passwordless sign-in/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/give your passkey a name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should disable Continue button when name is empty', async () => {
    render(<AddPasskeyModal closeModal={closeModal} />);

    const continueButton = await screen.findByRole('button', { name: /continue/i });
    expect(continueButton).toBeDisabled();
  });

  it('should enable Continue button when name is entered', async () => {
    render(<AddPasskeyModal closeModal={closeModal} />);

    const input = await screen.findByPlaceholderText(/macbook touch id/i);
    await userEvent.type(input, 'My Passkey');

    expect(screen.getByRole('button', { name: /continue/i })).not.toBeDisabled();
  });

  it('should call closeModal when Cancel is clicked', async () => {
    render(<AddPasskeyModal closeModal={closeModal} />);

    const cancelButton = await screen.findByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    expect(closeModal).toHaveBeenCalled();
  });

});
