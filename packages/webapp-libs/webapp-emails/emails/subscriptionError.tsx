import { buildEmail } from '../src/email';
import { EmailTemplateType } from '../src/types';

function Email() {
  return buildEmail({
    name: EmailTemplateType.SUBSCRIPTION_ERROR,
    lang: 'en',
    data: { to: 'user@example.com' },
  }).template;
}

export default Email;
