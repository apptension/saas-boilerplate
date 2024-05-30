import { buildEmail } from '../email';
import { UserExportAdminProps } from '../templates/userExportAdmin';
import { EmailTemplateType } from '../types';

const data: UserExportAdminProps = {
  to: 'user@example.com',
  data: [
    { export_url: 'https://localhost:3000', email: 'email@example.com' },
    { export_url: 'https://localhost:3000', email: 'email@example.com' },
  ],
};

function Email() {
  return buildEmail({
    name: EmailTemplateType.USER_EXPORT_ADMIN,
    lang: 'en',
    data,
  }).template;
}

export default Email;
