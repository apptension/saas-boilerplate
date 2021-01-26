import enTranslationMessages from './translations/en.json';
import plTranslationMessages from './translations/pl.json';

export const LOCALES = {
  ENGLISH: 'en',
  POLISH: 'pl',
};

export type MessagesObject = Record<string, string>;

export const DEFAULT_LOCALE = LOCALES.ENGLISH;

export const appLocales = [LOCALES.ENGLISH, LOCALES.POLISH];

export const formatTranslationMessages = (locale: string, messages: MessagesObject): MessagesObject => {
  const defaultFormattedMessages: MessagesObject =
    locale !== DEFAULT_LOCALE ? formatTranslationMessages(DEFAULT_LOCALE, enTranslationMessages) : {};
  return Object.keys(messages).reduce((formattedMessages, key) => {
    const formattedMessage =
      !messages[key] && locale !== DEFAULT_LOCALE ? defaultFormattedMessages[key] : messages[key];
    return Object.assign(formattedMessages, { [key]: formattedMessage });
  }, {});
};

export const translationMessages = {
  [LOCALES.ENGLISH]: formatTranslationMessages(LOCALES.ENGLISH, enTranslationMessages),
  [LOCALES.POLISH]: formatTranslationMessages(LOCALES.POLISH, plTranslationMessages),
};
