import { EmailTemplateDefinition, EmailTemplateType } from '../types';
import * as AccountActivation from './accountActivation';

export const templates: Record<EmailTemplateType, EmailTemplateDefinition> = {
  [EmailTemplateType.AccountActivation]: AccountActivation,
};
