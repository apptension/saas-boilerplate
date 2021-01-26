import { createSelector } from '@reduxjs/toolkit';

import { GlobalState } from '../../config/reducers';

const selectLocalesDomain = (state: GlobalState) => state.locales;

export const selectLocalesLanguage = createSelector(selectLocalesDomain, (state) => state.language);
