import { keys } from 'ramda';
import enTranslationMessages from './translations/en.json';
import plTranslationMessages from './translations/pl.json';

export const LOCALES = {
  ENGLISH: 'en',
  POLISH: 'pl',
};

export interface TranslationMessage {
  defaultMessage: string;
  description: string;
}
export type TranslationMessagesWithDescriptors = Record<string, TranslationMessage>;
export type TranslationMessages = Record<string, string>;

export const DEFAULT_LOCALE = LOCALES.ENGLISH;

export const appLocales = [LOCALES.ENGLISH, LOCALES.POLISH];

export const formatTranslationMessages = (
  locale: string,
  messages: TranslationMessagesWithDescriptors
): TranslationMessages => {
  const defaultFormattedMessages =
    locale !== DEFAULT_LOCALE ? formatTranslationMessages(DEFAULT_LOCALE, enTranslationMessages) : {};

  return keys(messages).reduce((formattedMessages, key) => {
    const formattedMessage =
      !messages[key]?.defaultMessage && locale !== DEFAULT_LOCALE
        ? defaultFormattedMessages[key]
        : messages[key]?.defaultMessage;
    return Object.assign(formattedMessages, { [key]: formattedMessage });
  }, {});
};

export const translationMessages = {
  [LOCALES.ENGLISH]: formatTranslationMessages(LOCALES.ENGLISH, enTranslationMessages),
  [LOCALES.POLISH]: formatTranslationMessages(LOCALES.POLISH, plTranslationMessages),
};
