import { actionCreator } from '../helpers/actionCreator';

const { createAction } = actionCreator('LOCALES');

export const setLanguage = createAction<string>('SET_LANGUAGE');
