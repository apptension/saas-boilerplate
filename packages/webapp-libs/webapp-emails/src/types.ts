import { ComponentType } from 'react';

export enum EmailTemplateType {
  ACCOUNT_ACTIVATION = 'ACCOUNT_ACTIVATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  SUBSCRIPTION_ERROR = 'SUBSCRIPTION_ERROR',
  TRIAL_EXPIRES_SOON = 'TRIAL_EXPIRES_SOON',
  USER_EXPORT = 'USER_EXPORT',
  USER_EXPORT_ADMIN = 'USER_EXPORT_ADMIN',
  TENANT_INVITATION = 'TENANT_INVITATION',
  //<-- INJECT EMAIL TYPE -->
}

export type EmailComponentProps = {
  to: string;
};

export type EmailTemplateDefinition = {
  Template: ComponentType<any>;
  Subject: ComponentType<any>;
};
