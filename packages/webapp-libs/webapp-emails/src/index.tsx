import { TranslationMessages } from '@sb/webapp-core/config/i18n';
import { camelCaseKeys } from '@sb/webapp-core/utils/object';
import { UnknownObject } from '@sb/webapp-core/utils/types';
import juice from 'juice';
import { renderToString } from 'react-dom/server';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

import { buildEmail } from './email';
import { EmailComponentProps, EmailTemplateType } from './types';

/**
 * Render an email template with translations.
 *
 * @param name - Email template type
 * @param rawData - Data to pass to the template
 * @param lang - Locale code (e.g., 'en', 'pl')
 * @param messages - Translation messages from the database (optional, falls back to bundled translations)
 */
export const renderEmail = (
  name: EmailTemplateType,
  rawData: UnknownObject,
  lang: string,
  messages?: TranslationMessages
) => {
  const data = camelCaseKeys(rawData) as EmailComponentProps;
  const email = buildEmail({ name, data, lang, messages });

  const sheet = new ServerStyleSheet();
  const subject = renderToString(email.subject);
  const bodyHtml = renderToString(<StyleSheetManager sheet={sheet.instance}>{email.template}</StyleSheetManager>);
  const styleTags = sheet.getStyleTags();
  sheet.seal();

  const rawHtml = `<html><head><title>${name}</title></head><body>${bodyHtml}${styleTags}</body></html>`;
  const html = juice(rawHtml, { preserveFontFaces: true });
  return { subject, html };
};
