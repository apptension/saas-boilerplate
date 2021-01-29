import { actionCreator } from '../helpers';

const { createAction } = actionCreator('STARTUP');

export const startup = createAction<void>('STARTUP');
export const profileStartup = createAction<void>('PROFILE_STARTUP');
export const completeProfileStartup = createAction<void>('COMPLETE_PROFILE_STARTUP');
