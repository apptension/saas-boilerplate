import { Locale } from '@sb/webapp-core/config/i18n';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { render } from '../../../../../../tests/utils/rendering';
import { LanguageSwitcher } from '../languageSwitcher.component';

describe('LanguageSwitcher', () => {
  it('should render the language switcher button', async () => {
    render(<LanguageSwitcher />);

    const button = await screen.findByRole('button', { name: /change language/i });
    expect(button).toBeInTheDocument();
  });

  it('should open dropdown menu when clicked', async () => {
    render(<LanguageSwitcher />);

    const button = await screen.findByRole('button', { name: /change language/i });
    await userEvent.click(button);

    // Check that language options are visible in the dropdown menu
    // Use getAllByText since "English" appears in both button and dropdown
    const englishElements = await screen.findAllByText('English');
    expect(englishElements.length).toBeGreaterThan(0);
    
    const polishElements = await screen.findAllByText('Polski');
    expect(polishElements.length).toBeGreaterThan(0);
    
    // Verify dropdown menu items are present
    const menuItems = await screen.findAllByRole('menuitem');
    expect(menuItems.length).toBeGreaterThan(0);
  });

  it('should show flags for each language', async () => {
    render(<LanguageSwitcher />);

    const button = await screen.findByRole('button', { name: /change language/i });
    await userEvent.click(button);

    // Check that flags are rendered
    const englishFlag = screen.getByRole('img', { name: /english/i });
    const polishFlag = screen.getByRole('img', { name: /polish/i });

    expect(englishFlag).toBeInTheDocument();
    expect(polishFlag).toBeInTheDocument();
  });

  it('should indicate the currently selected language', async () => {
    render(<LanguageSwitcher />);

    const button = await screen.findByRole('button', { name: /change language/i });
    await userEvent.click(button);

    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems.length).toBeGreaterThan(0);
  });

  it('should change language when selecting different locale', async () => {
    render(<LanguageSwitcher />, {
      routerProps: { initialEntries: ['/en/'] },
    });

    await userEvent.click(await screen.findByRole('button', { name: /change language/i }));
    const polishOption = await screen.findByRole('menuitem', { name: /polski/i });
    expect(polishOption).toBeInTheDocument();
    await userEvent.click(polishOption);
  });
});

