import { IntlProvider } from 'react-intl';
import { DEFAULT_LOCALE } from '../app/config/i18n';
import { EmailComponentProps, EmailTemplateType } from './types';
import templates from './templates';

type AppProps = {
  name: EmailTemplateType;
  data: EmailComponentProps;
  lang: string;
};

export const buildEmail = ({ name, data, lang = DEFAULT_LOCALE }: AppProps) => {
  const { Template, Subject } = templates[name];
  if (!Template) {
    throw new Error(`Missing template ${name}`);
  }

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
