import { DEFAULT_LOCALE, Locale } from '@sb/webapp-core/config/i18n';
import { LocalesProvider } from '@sb/webapp-core/providers';
import { renderHook } from '@testing-library/react-hooks';
import { ReactNode } from 'react';

import { useLanguageFromParams } from '../useLanguageFromParams.hook';

const mockSetLanguage = jest.fn();

jest.mock('@sb/webapp-core/hooks', () => ({
  ...jest.requireActual('@sb/webapp-core/hooks'),
  useLocales: () => ({
    setLanguage: mockSetLanguage,
  }),
}));

const mockParams = jest.fn();

const wrapper = ({ children }: { children: ReactNode }) => <LocalesProvider>{children}</LocalesProvider>;

const render = () =>
  renderHook(useLanguageFromParams, {
    wrapper,
  });

jest.mock('react-router-dom', () => ({
  useParams: () => mockParams(),
}));

describe('useLanguageFromParams: Hook', () => {
  afterEach(() => {
    mockParams.mockClear();
  });

  it('should set proper language based on url', () => {
    mockParams.mockReturnValue({ lang: 'pl' });
    render();
    expect(mockSetLanguage).toHaveBeenCalledWith(Locale.POLISH);
  });

  it('should set default language if it is not matched', () => {
    mockParams.mockReturnValue({ lang: null });
    render();
    expect(mockSetLanguage).toHaveBeenCalledWith(DEFAULT_LOCALE);
  });

  it('should update language when url changes', () => {
    mockParams.mockReturnValue({ lang: 'pl' });
    render();
    mockSetLanguage.mockClear();
    mockParams.mockReturnValue({ lang: 'en' });
    render();
    expect(mockSetLanguage).toHaveBeenCalledWith(Locale.ENGLISH);
  });
});
