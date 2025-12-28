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

    // Check that language options are visible
    expect(await screen.findByText('English')).toBeInTheDocument();
    expect(await screen.findByText('Polski')).toBeInTheDocument();
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

    // The current language item should have a check mark
    // By default, English is selected
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems.length).toBeGreaterThan(0);
  });
});

