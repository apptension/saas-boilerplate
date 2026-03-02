import { FileText } from 'lucide-react';

import type { ContentfulContentPageConfig } from './contentfulContentPage.types';

export const privacyPolicyConfig: ContentfulContentPageConfig = {
  title: { defaultMessage: 'Privacy Policy', id: 'Privacy Policy / Title' },
  description: { defaultMessage: 'How we handle and protect your data', id: 'Privacy Policy / Description' },
  pageTitle: { defaultMessage: 'Privacy Policy', id: 'Privacy Policy / Page title' },
  icon: FileText,
  contentField: 'privacyPolicy',
  emptyTitle: { defaultMessage: 'No Content Available', id: 'Privacy Policy / Empty title' },
  emptyDescription: {
    defaultMessage:
      "The privacy policy content hasn't been added yet. Please add content to the 'privacyPolicy' field in your Contentful AppConfig entry.",
    id: 'Privacy Policy / Empty description',
  },
  errorTitle: {
    defaultMessage: 'Unable to load privacy policy',
    id: 'Privacy Policy / Error title',
  },
  errorDescription: {
    defaultMessage: 'There was an error loading this content from Contentful.',
    id: 'Privacy Policy / Error description',
  },
  notConfiguredTitle: {
    defaultMessage: 'Contentful Integration Not Configured',
    id: 'Privacy Policy / Not configured title',
  },
  notConfiguredDescription: {
    defaultMessage:
      'This page displays content managed via Contentful CMS. To enable it, you need to configure the Contentful integration.',
    id: 'Privacy Policy / Not configured description',
  },
  quickSetupTitle: { defaultMessage: 'Quick Setup', id: 'Privacy Policy / Quick setup title' },
  setupStep1: {
    defaultMessage: 'Create a Contentful account and space at {link}',
    id: 'Privacy Policy / Setup step 1',
  },
  setupStep2: {
    defaultMessage: 'Add these environment variables to {file}:',
    id: 'Privacy Policy / Setup step 2',
  },
  setupStep3: {
    defaultMessage: "Create an AppConfig content type with a 'privacyPolicy' field (Long text, Markdown)",
    id: 'Privacy Policy / Setup step 3',
  },
  setupStep4: { defaultMessage: 'Restart the development server', id: 'Privacy Policy / Setup step 4' },
  retryButton: { defaultMessage: 'Retry', id: 'Privacy Policy / Retry button' },
  viewFullDocs: { defaultMessage: 'View Full Documentation', id: 'Privacy Policy / Docs link' },
  tryAgainButton: { defaultMessage: 'Try again', id: 'Privacy Policy / Retry button' },
  contentfulDocs: {
    defaultMessage: 'Contentful Documentation',
    id: 'Privacy Policy / Docs link',
  },
  openContentful: { defaultMessage: 'Open Contentful', id: 'Privacy Policy / Open Contentful' },
};
