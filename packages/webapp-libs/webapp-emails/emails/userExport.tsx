import { buildEmail } from '../src/email';
import { UserExportProps } from '../src/templates/userExport';
import { EmailTemplateType } from '../src/types';

const data: UserExportProps = {
  to: 'user@example.com',
  data: { export_url: 'https://localhost:3000', email: 'email@example.com' },
};

function Email() {
  return buildEmail({
    name: EmailTemplateType.USER_EXPORT,
    lang: 'en',
    data,
  }).template;
}

export default Email;