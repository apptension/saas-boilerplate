import { renderHook } from '@testing-library/react';

import { useLocales } from '../';
import { Locale } from '../../../config/i18n';
import { LocalesContext } from '../../../providers/localesProvider';

describe('useLocales', () => {
  it('should return locales and setLanguage function when used inside LocalesProvider', () => {
    const locales = { language: Locale.ENGLISH };
    const dispatch = jest.fn();

    const wrapper = ({ children }: any) => (
      <LocalesContext.Provider value={{ locales, dispatch }}>{children}</LocalesContext.Provider>
    );

    const { result } = renderHook(() => useLocales(), { wrapper });
    expect(result.current).toEqual({ locales, setLanguage: expect.any(Function) });
    expect(typeof result.current.setLanguage).toEqual('function');
  });

  it('should call dispatch with SET_LANGUAGE type and passed language when setLanguage is called', () => {
    const language = Locale.POLISH;
    const locales = { language: Locale.ENGLISH };
    const dispatch = jest.fn();

    const wrapper = ({ children }: any) => (
      <LocalesContext.Provider value={{ locales, dispatch }}>{children}</LocalesContext.Provider>
    );

    const { result } = renderHook(() => useLocales(), { wrapper });
    result.current.setLanguage(language);
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_LANGUAGE', payload: language });
  });
});
