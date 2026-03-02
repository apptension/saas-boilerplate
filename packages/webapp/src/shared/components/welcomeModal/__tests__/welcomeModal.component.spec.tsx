import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { render } from '../../../../tests/utils/rendering';

jest.mock('canvas-confetti');
import { triggerWelcomeModal, WelcomeModal } from '../welcomeModal.component';


describe('WelcomeModal: Component', () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  it('should not render when sessionStorage is empty', () => {
    render(<WelcomeModal />);

    expect(screen.queryByText(/welcome aboard/i)).not.toBeInTheDocument();
  });

  it('should render when sessionStorage has show flag', async () => {
    sessionStorage.setItem('sb_show_welcome_modal', 'true');
    render(<WelcomeModal />);

    expect(await screen.findByText(/welcome aboard/i)).toBeInTheDocument();
  });

  it('should remove sessionStorage flag after showing', async () => {
    sessionStorage.setItem('sb_show_welcome_modal', 'true');
    render(<WelcomeModal />);

    await screen.findByText(/welcome aboard/i);
    expect(sessionStorage.getItem('sb_show_welcome_modal')).toBeNull();
  });

  it('should close modal when Start Exploring is clicked', async () => {
    sessionStorage.setItem('sb_show_welcome_modal', 'true');
    render(<WelcomeModal />);

    await screen.findByText(/welcome aboard/i);
    await userEvent.click(await screen.findByRole('button', { name: /start exploring/i }));

    expect(screen.queryByText(/welcome aboard/i)).not.toBeInTheDocument();
  });

  it('triggerWelcomeModal should set sessionStorage', () => {
    triggerWelcomeModal();
    expect(sessionStorage.getItem('sb_show_welcome_modal')).toBe('true');
  });
});
