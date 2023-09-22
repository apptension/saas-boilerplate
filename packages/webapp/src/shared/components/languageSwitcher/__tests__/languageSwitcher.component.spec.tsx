import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Route, Routes } from 'react-router';

import { render } from '../../../../tests/utils/rendering';
import { LanguageSwitcher } from '../index';

describe('LanguageSwitcher: Component', () => {
  const enPath = '/';
  const plPath = '/pl/';
  const placeholder = 'pl placeholder';
  const Component = () => (
    <Routes>
      <Route path={enPath} element={<LanguageSwitcher />} />
      <Route path={plPath} element={<span>{placeholder}</span>} />
    </Routes>
  );

  it('should redirect after option click', async () => {
    render(<Component />, { routerProps: { initialEntries: [enPath] } });

    await userEvent.selectOptions(await screen.findByRole('combobox'), 'pl');

    expect(screen.getByText(placeholder)).toBeInTheDocument();
  });
});
