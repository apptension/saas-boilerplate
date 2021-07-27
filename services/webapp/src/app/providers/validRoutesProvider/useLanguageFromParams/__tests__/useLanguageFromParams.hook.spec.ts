import { renderHook } from '@testing-library/react-hooks';
import { useLanguageFromParams } from '../useLanguageFromParams.hook';
import { localesActions } from '../../../../../modules/locales';
import { DEFAULT_LOCALE, Locale } from '../../../../config/i18n';
import { store } from '../../../../../mocks/store';

const render = () => renderHook(() => useLanguageFromParams());

const mockDispatch = jest.fn();
const mockParams = jest.fn();
const mockStore = store;

jest.mock('react-router-dom', () => ({
  useParams: () => mockParams(),
}));

jest.mock('react-redux', () => ({
  useSelector: (selector: (state: any) => any) => selector(mockStore),
  useDispatch: () => mockDispatch,
}));

describe('useLanguageFromParams: Hook', () => {
  afterEach(() => {
    mockParams.mockClear();
  });

  it('should set proper language based on url', () => {
    mockParams.mockReturnValue({ lang: 'pl' });
    render();
    expect(mockDispatch).toHaveBeenCalledWith(localesActions.setLanguage(Locale.POLISH));
  });

  it('should set default language if it is not matched', () => {
    mockParams.mockReturnValue({ lang: null });
    render();
    expect(mockDispatch).toHaveBeenCalledWith(localesActions.setLanguage(DEFAULT_LOCALE));
  });

  it('should update language when url changes', () => {
    mockParams.mockReturnValue({ lang: 'pl' });
    render();
    mockDispatch.mockClear();
    mockParams.mockReturnValue({ lang: 'en' });
    render();
    expect(mockDispatch).toHaveBeenCalledWith(localesActions.setLanguage(Locale.ENGLISH));
  });
});
