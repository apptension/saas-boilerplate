import { buildEmail } from '../src/email';
import { AccountActivationProps } from '../src/templates/accountActivation';
import { EmailTemplateType } from '../src/types';

const data: AccountActivationProps = { to: 'user@example.com', token: 'token', userId: 'userId' };

function Email() {
  return buildEmail({
    name: EmailTemplateType.ACCOUNT_ACTIVATION,
    lang: 'en',
    data,
  }).template;
}

export default Email;
