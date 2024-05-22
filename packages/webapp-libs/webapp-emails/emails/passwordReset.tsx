import { buildEmail } from '../src/email';
import { PasswordResetProps } from '../src/templates/passwordReset';
import { EmailTemplateType } from '../src/types';

const data: PasswordResetProps = { to: 'user@example.com', token: 'token', userId: 'userId' };

function Email() {
  return buildEmail({
    name: EmailTemplateType.PASSWORD_RESET,
    lang: 'en',
    data,
  }).template;
}

export default Email;
