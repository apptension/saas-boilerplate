import { DEFAULT_LOCALE } from '@sb/webapp-core/config/i18n';
import { renderToStaticMarkup } from 'react-dom/server';

import { buildEmail } from '../email';
import templates from '../templates';
import { EmailTemplateType } from '../types';

const { Template: mockTemplate, Subject: mockSubject } = templates.ACCOUNT_ACTIVATION;

jest.mock('../templates', () => ({
  ACCOUNT_ACTIVATION: {
    Template: jest.fn(() => <div>Mock Template</div>),
    Subject: jest.fn(() => 'Mock Subject'),
  },
}));

describe('buildEmail', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders the email template and subject', () => {
    const result = buildEmail({
      name: EmailTemplateType.ACCOUNT_ACTIVATION,
      data: {
        to: 'Test User',
      },
      lang: DEFAULT_LOCALE,
    });

    const expectedTemplate = `<div>Mock Template</div>`;
    expect(renderToStaticMarkup(result.template)).toEqual(expectedTemplate);

    const expectedSubject = 'Mock Subject';
    expect(renderToStaticMarkup(result.subject)).toEqual(expectedSubject);

    expect(mockTemplate).toHaveBeenCalledWith({ to: 'Test User' }, {});
    expect(mockSubject).toHaveBeenCalledWith({ to: 'Test User' }, {});
  });

  it('throws an error when template is missing', () => {
    expect(() =>
      buildEmail({
        name: 'missingTemplate' as unknown as EmailTemplateType,
        data: { to: 'Test User' },
        lang: DEFAULT_LOCALE,
      })
    ).toThrowError('Missing template missingTemplate');

    expect(mockTemplate).not.toHaveBeenCalled();
    expect(mockSubject).not.toHaveBeenCalled();
  });
});
