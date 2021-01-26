import { actionCreator } from '../helpers';

const { createAction } = actionCreator('STARTUP');

export const startup = createAction<void>('STARTUP');
