import { ComponentType } from 'react';

export enum EmailTemplateType {
  AccountActivation = 'accountActivation',
  PasswordReset = 'passwordReset',
  SubscriptionError = 'subscriptionError',
}

export interface EmailComponentProps {
  to: string;
}

export interface EmailTemplateDefinition {
  Template: ComponentType<any>;
  Subject: ComponentType<any>;
}
