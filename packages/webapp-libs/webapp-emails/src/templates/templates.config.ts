import { EmailTemplateDefinition, EmailTemplateType } from '../types';
import * as AccountActivation from './accountActivation';
import * as PasswordReset from './passwordReset';
import * as SubscriptionError from './subscriptionError';
import * as TenantInvitation from './tenantInvitation';
import * as TrialExpiresSoon from './trialExpiresSoon';
import * as UserExport from './userExport';
import * as UserExportAdmin from './userExportAdmin';
import * as InvoiceRequestAssigned from './invoiceRequestAssigned';
import * as InvoiceRequestComment from './invoiceRequestComment';
import * as InvoiceRequestMention from './invoiceRequestMention';
import * as InvoiceCreated from './invoiceCreated';
import * as InvoiceFileAdded from './invoiceFileAdded';
import * as ProjectNoteMention from './projectNoteMention';
import * as BackupReady from './backupReady';

//<-- INJECT EMAIL TEMPLATE IMPORT -->

export const templates: Record<EmailTemplateType, EmailTemplateDefinition> = {
  [EmailTemplateType.ACCOUNT_ACTIVATION]: AccountActivation,
  [EmailTemplateType.PASSWORD_RESET]: PasswordReset,
  [EmailTemplateType.SUBSCRIPTION_ERROR]: SubscriptionError,
  [EmailTemplateType.TRIAL_EXPIRES_SOON]: TrialExpiresSoon,
  [EmailTemplateType.USER_EXPORT]: UserExport,
  [EmailTemplateType.USER_EXPORT_ADMIN]: UserExportAdmin,
  [EmailTemplateType.TENANT_INVITATION]: TenantInvitation,
  [EmailTemplateType.INVOICE_REQUEST_ASSIGNED]: InvoiceRequestAssigned,
  [EmailTemplateType.INVOICE_REQUEST_COMMENT]: InvoiceRequestComment,
  [EmailTemplateType.INVOICE_REQUEST_MENTION]: InvoiceRequestMention,
  [EmailTemplateType.INVOICE_CREATED]: InvoiceCreated,
  [EmailTemplateType.INVOICE_FILE_ADDED]: InvoiceFileAdded,
  [EmailTemplateType.PROJECT_NOTE_MENTION]: ProjectNoteMention,
  [EmailTemplateType.BACKUP_READY]: BackupReady,
  //<-- INJECT EMAIL TEMPLATE -->
};
