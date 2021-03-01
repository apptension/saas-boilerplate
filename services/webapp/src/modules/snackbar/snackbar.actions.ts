import { actionCreator } from '../helpers/actionCreator';
import { Message } from './snackbar.types';

const { createAction, createActionRoutine } = actionCreator('SNACKBAR');

export const showMessage = createActionRoutine<string | null, Message>('SHOW_MESSAGE');
export const hideMessage = createAction<number>('HIDE_MESSAGE');
