import { keys } from 'ramda';

import enTranslationMessages from '../translations/en.json';
import plTranslationMessages from '../translations/pl.json';

export enum Locale {
  ENGLISH = 'en',
  POLISH = 'pl',
}

export const DEFAULT_LOCALE = Locale.ENGLISH;

export const appLocales = Object.values(Locale);

export interface TranslationMessage {
  defaultMessage: string;
  description?: string;
}

export type TranslationMessagesWithDescriptors = Record<
  string,
  TranslationMessage
>;

export type TranslationMessages = Record<string, string>;

export const formatTranslationMessages = (
  locale: Locale,
  messages: TranslationMessagesWithDescriptors
): TranslationMessages => {
  const defaultFormattedMessages =
    locale !== DEFAULT_LOCALE
      ? formatTranslationMessages(DEFAULT_LOCALE, enTranslationMessages)
      : {};

  return keys(messages).reduce((formattedMessages, key) => {
    const formattedMessage =
      !messages[key]?.defaultMessage && locale !== DEFAULT_LOCALE
        ? defaultFormattedMessages[key]
        : messages[key]?.defaultMessage;
    return Object.assign(formattedMessages, { [key]: formattedMessage });
  }, {});
};

export const translationMessages: Record<Locale, TranslationMessages> = {
  [Locale.ENGLISH]: formatTranslationMessages(
    Locale.ENGLISH,
    enTranslationMessages
  ),
  [Locale.POLISH]: formatTranslationMessages(
    Locale.POLISH,
    plTranslationMessages
  ),
};
