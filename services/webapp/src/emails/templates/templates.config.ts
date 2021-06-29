import { EmailTemplateDefinition, EmailTemplateType } from '../types';
import * as AccountActivation from './accountActivation';
import * as PasswordReset from './passwordReset';
import * as SubscriptionError from './subscriptionError';
import * as TrialExpiresSoon from './trialExpiresSoon';
//<-- INJECT EMAIL TEMPLATE IMPORT -->

export const templates: Record<EmailTemplateType, EmailTemplateDefinition> = {
  [EmailTemplateType.ACCOUNT_ACTIVATION]: AccountActivation,
  [EmailTemplateType.PASSWORD_RESET]: PasswordReset,
  [EmailTemplateType.SUBSCRIPTION_ERROR]: SubscriptionError,
  [EmailTemplateType.TRIAL_EXPIRES_SOON]: TrialExpiresSoon,
  //<-- INJECT EMAIL TEMPLATE -->
};
