import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Routes, Route } from 'react-router';
import { createMemoryHistory } from 'history';

import { LanguageSwitcher } from '../index';
import { render } from '../../../../tests/utils/rendering';

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
    const routerHistory = createMemoryHistory({
      initialEntries: [enPath],
    });
    render(<Component />, { routerHistory });

    await userEvent.selectOptions(screen.getByRole('combobox'), 'pl');

    expect(screen.getByText(placeholder)).toBeInTheDocument();
  });
});
