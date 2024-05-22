import { buildEmail } from '../src/email';
import { TrialExpiresSoonProps } from '../src/templates/trialExpiresSoon';
import { EmailTemplateType } from '../src/types';

const data: TrialExpiresSoonProps = { to: 'user@example.com', expiryDate: new Date().toISOString() };

function Email() {
  return buildEmail({
    name: EmailTemplateType.TRIAL_EXPIRES_SOON,
    lang: 'en',
    data,
  }).template;
}

export default Email;
