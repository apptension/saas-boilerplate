import { createReducer, PayloadAction } from '@reduxjs/toolkit';

import * as actions from './locales.actions';
import { LocalesState } from './locales.types';

export const INITIAL_STATE: LocalesState = {
  language: null,
};

const handleSetLanguage = (state: LocalesState, { payload }: PayloadAction<string>) => {
  state.language = payload;
};

export const reducer = createReducer(INITIAL_STATE, (builder) => {
  builder.addCase(actions.setLanguage, handleSetLanguage);
});
