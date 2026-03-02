import type { LucideIcon } from 'lucide-react';

export type ContentfulContentPageConfig = {
  title: { defaultMessage: string; id: string };
  description: { defaultMessage: string; id: string };
  pageTitle: { defaultMessage: string; id: string };
  icon: LucideIcon;
  contentField: 'termsAndConditions' | 'privacyPolicy';
  emptyTitle: { defaultMessage: string; id: string };
  emptyDescription: { defaultMessage: string; id: string };
  errorTitle: { defaultMessage: string; id: string };
  errorDescription: { defaultMessage: string; id: string };
  notConfiguredTitle: { defaultMessage: string; id: string };
  notConfiguredDescription: { defaultMessage: string; id: string };
  quickSetupTitle: { defaultMessage: string; id: string };
  setupStep1: { defaultMessage: string; id: string };
  setupStep2: { defaultMessage: string; id: string };
  setupStep3: { defaultMessage: string; id: string };
  setupStep4: { defaultMessage: string; id: string };
  retryButton: { defaultMessage: string; id: string };
  viewFullDocs: { defaultMessage: string; id: string };
  tryAgainButton: { defaultMessage: string; id: string };
  contentfulDocs: { defaultMessage: string; id: string };
  openContentful: { defaultMessage: string; id: string };
};
