import { DEFAULT_LOCALE, Locale, TranslationMessages, translationMessages } from '@sb/webapp-core/config/i18n';
import { IntlProvider } from 'react-intl';

import templates from './templates';
import { EmailComponentProps, EmailTemplateType } from './types';

type AppProps = {
  name: EmailTemplateType;
  data: EmailComponentProps;
  lang: string;
  messages?: TranslationMessages;
};

/**
 * Get translation messages for the specified locale.
 * Falls back to bundled translations if no messages provided.
 */
const getBundledMessages = (lang: string): TranslationMessages => {
  const locale = lang as Locale;
  if (translationMessages[locale]) {
    return translationMessages[locale];
  }
  // Fallback to English if locale not found
  return translationMessages[Locale.ENGLISH];
};

export const buildEmail = ({ name, data, lang = DEFAULT_LOCALE, messages }: AppProps) => {
  if (!templates[name]?.Template) {
    throw new Error(`Missing template ${name}`);
  }

  const { Template, Subject } = templates[name];

  // Use provided messages from database, or fall back to bundled translations
  const translationMsgs =
    messages && Object.keys(messages).length > 0 ? messages : getBundledMessages(lang);

  return {
    template: (
      <IntlProvider locale={lang} messages={translationMsgs}>
        <Template {...data} />
      </IntlProvider>
    ),
    subject: (
      <IntlProvider locale={lang} messages={translationMsgs}>
        <Subject {...data} />
      </IntlProvider>
    ),
  };
};
