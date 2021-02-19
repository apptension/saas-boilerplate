import { EmailTemplateDefinition, EmailTemplateType } from '../types';
import * as AccountActivation from './accountActivation';
import * as PasswordReset from './passwordReset';

export const templates: Record<EmailTemplateType, EmailTemplateDefinition> = {
  [EmailTemplateType.AccountActivation]: AccountActivation,
  [EmailTemplateType.PasswordReset]: PasswordReset,
};
