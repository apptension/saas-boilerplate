import { actionCreator } from '../helpers/actionCreator';

const { createAction } = actionCreator('STARTUP');

export const startup = createAction<void>('STARTUP');
