import { buildEmail } from '../src/email';
import { EmailTemplateType } from '../src/types';

function Email() {
  return buildEmail({
    name: EmailTemplateType.TENANT_INVITATION,
    lang: 'en',
    data: { to: 'user@example.com', token: 'token' },
  }).template;
}

export default Email;
