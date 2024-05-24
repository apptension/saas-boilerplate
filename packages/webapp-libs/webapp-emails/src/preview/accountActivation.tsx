import { buildEmail } from '../email';
import { AccountActivationProps } from '../templates/accountActivation';
import { EmailTemplateType } from '../types';

const data: AccountActivationProps = { to: 'user@example.com', token: 'token', userId: 'userId' };

function Email() {
  return buildEmail({
    name: EmailTemplateType.ACCOUNT_ACTIVATION,
    lang: 'en',
    data,
  }).template;
}

export default Email;
