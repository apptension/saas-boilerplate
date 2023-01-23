import { selectLocalesLanguage } from '../locales.selectors';
import { prepareState } from '../../../mocks/store';
import { Locale } from '../../../app/config/i18n';

describe('Locales: selectors', () => {
  const language = Locale.ENGLISH;

  const defaultState = prepareState((state) => {
    state.locales = {
      language,
    };
  });

  describe('selectLocalesLanguage', () => {
    it('should select language', () => {
      expect(selectLocalesLanguage(defaultState)).toEqual(language);
    });
  });
});
