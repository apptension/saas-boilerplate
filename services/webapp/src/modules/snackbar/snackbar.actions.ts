import { actionCreator } from '../helpers';
import { Message } from './snackbar.types';

const { createAction, createActionRoutine } = actionCreator('SNACKBAR');

export const showMessage = createActionRoutine<string, Message>('SHOW_MESSAGE');
export const hideMessage = createAction<number>('HIDE_MESSAGE');
