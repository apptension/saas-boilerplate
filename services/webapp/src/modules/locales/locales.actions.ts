import { actionCreator } from '../helpers/actionCreator';
import { Locale } from '../../app/config/i18n';

const { createAction } = actionCreator('LOCALES');

export const setLanguage = createAction<Locale>('SET_LANGUAGE');
