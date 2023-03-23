import { DEFAULT_LOCALE } from '@sb/webapp-core/config/i18n';
import { IntlProvider } from 'react-intl';

import templates from './templates';
import { EmailComponentProps, EmailTemplateType } from './types';

type AppProps = {
  name: EmailTemplateType;
  data: EmailComponentProps;
  lang: string;
};

export const buildEmail = ({ name, data, lang = DEFAULT_LOCALE }: AppProps) => {
  if (!templates[name]?.Template) {
    throw new Error(`Missing template ${name}`);
  }

  const { Template, Subject } = templates[name];

  return {
    template: (
      <IntlProvider locale={lang}>
        <Template {...data} />
      </IntlProvider>
    ),
    subject: (
      <IntlProvider locale={lang}>
        <Subject {...data} />
      </IntlProvider>
    ),
  };
};
