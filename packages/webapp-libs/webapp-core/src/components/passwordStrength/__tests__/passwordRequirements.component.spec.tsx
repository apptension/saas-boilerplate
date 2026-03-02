import { screen } from '@testing-library/react';

import { render } from '../../../tests/utils/rendering';
import { PasswordRequirements } from '../passwordRequirements.component';

describe('PasswordRequirements: Component', () => {
  it('should display all requirement labels', async () => {
    render(<PasswordRequirements password="" />);
    expect(await screen.findByText(/8\+ characters/i)).toBeInTheDocument();
    expect(screen.getByText(/not a common password/i)).toBeInTheDocument();
    expect(screen.getByText(/contains letters/i)).toBeInTheDocument();
  });

  it('should render requirements for password with input', async () => {
    render(<PasswordRequirements password="RandomP@ss1" />);
    expect(await screen.findByText(/8\+ characters/i)).toBeInTheDocument();
  });

  it('should render requirements for short password', async () => {
    render(<PasswordRequirements password="short" />);
    expect(await screen.findByText(/8\+ characters/i)).toBeInTheDocument();
  });
});
