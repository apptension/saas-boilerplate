import { actionCreator } from '../helpers/actionCreator';
import { Message } from './snackbar.types';

const { createAction } = actionCreator('SNACKBAR');

export const showMessage = createAction<Message>('SHOW_MESSAGE');
export const hideMessage = createAction<number>('HIDE_MESSAGE');
