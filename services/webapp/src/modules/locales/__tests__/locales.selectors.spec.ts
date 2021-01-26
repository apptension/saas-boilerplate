import { selectLocalesLanguage } from '../locales.selectors';

import { prepareState } from '../../../mocks/store';

describe('Locales: selectors', () => {
  const language = 'en';

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
