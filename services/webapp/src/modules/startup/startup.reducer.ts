import { createReducer } from '@reduxjs/toolkit';

import { StartupState } from './startup.types';

export const INITIAL_STATE: StartupState = {};

export const reducer = createReducer(INITIAL_STATE, {});
