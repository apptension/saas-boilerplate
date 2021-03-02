import { actionCreator } from '../helpers/actionCreator';

const { createAction } = actionCreator('STARTUP');

export const startup = createAction<void>('STARTUP');
export const profileStartup = createAction<void>('PROFILE_STARTUP');

export const startProfileStartup = createAction<void>('START_PROFILE_STARTUP');
export const completeProfileStartup = createAction<void>('COMPLETE_PROFILE_STARTUP');
