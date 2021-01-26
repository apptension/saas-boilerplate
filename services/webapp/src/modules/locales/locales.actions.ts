import { actionCreator } from '../helpers';

const { createAction } = actionCreator('LOCALES');

export const setLanguage = createAction<string>('SET_LANGUAGE');
