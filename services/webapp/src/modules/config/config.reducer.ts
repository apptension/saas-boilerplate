import { createReducer, PayloadAction } from '@reduxjs/toolkit';

import * as configActions from './config.actions';
import { ConfigState, ContentfulAppConfigPlain } from './config.types';

export const INITIAL_STATE: ConfigState = {};

const handleSetAppConfig = (state: ConfigState, { payload }: PayloadAction<ContentfulAppConfigPlain>) => {
  state.contentfulConfig = payload;
};

export const reducer = createReducer(INITIAL_STATE, (builder) => {
  builder.addCase(configActions.setAppConfig, handleSetAppConfig);
});
