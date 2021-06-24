import { ComponentType } from 'react';

export enum EmailTemplateType {
  AccountActivation = 'accountActivation',
  PasswordReset = 'passwordReset',
  SubscriptionError = 'subscriptionError',
  TrialExpiresSoon = 'trialExpiresSoon',
}

export type EmailComponentProps = {
  to: string;
};

export interface EmailTemplateDefinition {
  Template: ComponentType<any>;
  Subject: ComponentType<any>;
}
