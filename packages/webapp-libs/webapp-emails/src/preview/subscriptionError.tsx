import { buildEmail } from '../email';
import { EmailTemplateType } from '../types';

function Email() {
  return buildEmail({
    name: EmailTemplateType.SUBSCRIPTION_ERROR,
    lang: 'en',
    data: { to: 'user@example.com' },
  }).template;
}

export default Email;
