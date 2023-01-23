import { ComponentType } from 'react';

export enum EmailTemplateType {
  ACCOUNT_ACTIVATION = 'ACCOUNT_ACTIVATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  SUBSCRIPTION_ERROR = 'SUBSCRIPTION_ERROR',
  TRIAL_EXPIRES_SOON = 'TRIAL_EXPIRES_SOON',
  //<-- INJECT EMAIL TYPE -->
}

export type EmailComponentProps = {
  to: string;
};

export type EmailTemplateDefinition = {
  Template: ComponentType<any>;
  Subject: ComponentType<any>;
}
