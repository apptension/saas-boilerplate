import { buildEmail } from '../email';
import { PasswordResetProps } from '../templates/passwordReset';
import { EmailTemplateType } from '../types';

const data: PasswordResetProps = { to: 'user@example.com', token: 'token', userId: 'userId' };

function Email() {
  return buildEmail({
    name: EmailTemplateType.PASSWORD_RESET,
    lang: 'en',
    data,
  }).template;
}

export default Email;
