import { EmailTemplateDefinition, EmailTemplateType } from '../types';
import * as AccountActivation from './accountActivation';
import * as PasswordReset from './passwordReset';
import * as SubscriptionError from './subscriptionError';
import * as TrialExpiresSoon from './trialExpiresSoon';
import * as UserExport from './userExport';
import * as UserExportAdmin from './userExportAdmin';

import * as TenantInvitation from './tenantInvitation';
//<-- INJECT EMAIL TEMPLATE IMPORT -->

export const templates: Record<EmailTemplateType, EmailTemplateDefinition> = {
  [EmailTemplateType.ACCOUNT_ACTIVATION]: AccountActivation,
  [EmailTemplateType.PASSWORD_RESET]: PasswordReset,
  [EmailTemplateType.SUBSCRIPTION_ERROR]: SubscriptionError,
  [EmailTemplateType.TRIAL_EXPIRES_SOON]: TrialExpiresSoon,
  [EmailTemplateType.USER_EXPORT]: UserExport,
  [EmailTemplateType.USER_EXPORT_ADMIN]: UserExportAdmin,
  [EmailTemplateType.TENANT_INVITATION]: TenantInvitation,
  //<-- INJECT EMAIL TEMPLATE -->
};
