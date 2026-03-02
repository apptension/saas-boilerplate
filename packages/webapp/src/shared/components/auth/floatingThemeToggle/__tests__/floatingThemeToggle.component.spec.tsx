import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { createMockRouterProps, render } from '../../../../../tests/utils/rendering';
import { FloatingThemeToggle } from '../floatingThemeToggle.component';

describe('FloatingThemeToggle: Component', () => {
  it('should render settings menu button', async () => {
    render(<FloatingThemeToggle />, {
      routerProps: createMockRouterProps('/'),
    });

    expect(await screen.findByRole('button', { name: /settings menu/i })).toBeInTheDocument();
  });

  it('should open dropdown with theme and language options', async () => {
    render(<FloatingThemeToggle />, {
      routerProps: createMockRouterProps('/'),
    });

    await userEvent.click(await screen.findByRole('button', { name: /settings menu/i }));

    expect(await screen.findByText(/light mode|dark mode/i)).toBeInTheDocument();
    expect(await screen.findByText(/language/i)).toBeInTheDocument();
  });

  it('should toggle theme when theme option is clicked', async () => {
    render(<FloatingThemeToggle />, {
      routerProps: createMockRouterProps('/'),
    });

    await userEvent.click(await screen.findByRole('button', { name: /settings menu/i }));
    const themeOption = await screen.findByRole('menuitem', { name: /light mode|dark mode/i });
    expect(themeOption).toBeInTheDocument();
    await userEvent.click(themeOption);
  });
});
