import { buildEmail } from '../email';
import { EmailTemplateType } from '../types';

function Email() {
  return buildEmail({
    name: EmailTemplateType.TENANT_INVITATION,
    lang: 'en',
    data: { to: 'user@example.com', token: 'token' },
  }).template;
}

export default Email;
