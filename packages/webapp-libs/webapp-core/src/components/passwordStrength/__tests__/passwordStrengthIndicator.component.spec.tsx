import { screen } from '@testing-library/react';

import { render } from '../../../tests/utils/rendering';
import { PasswordStrengthIndicator } from '../passwordStrengthIndicator.component';

describe('PasswordStrengthIndicator: Component', () => {
  it('should not render when password is empty', async () => {
    render(<PasswordStrengthIndicator password="" />);
    expect(screen.queryByText(/password strength/i)).not.toBeInTheDocument();
  });

  it('should display weak strength for short password', async () => {
    render(<PasswordStrengthIndicator password="short" />);
    expect(await screen.findByText(/weak/i)).toBeInTheDocument();
  });

  it('should display strong strength for strong password', async () => {
    render(<PasswordStrengthIndicator password="Abcdefgh1!ab" />);
    expect(await screen.findByText(/strong/i)).toBeInTheDocument();
  });

  it('should display password strength label', async () => {
    render(<PasswordStrengthIndicator password="test" />);
    expect(await screen.findByText(/password strength/i)).toBeInTheDocument();
  });
});
