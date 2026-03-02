import { Scale } from 'lucide-react';

import type { ContentfulContentPageConfig } from './contentfulContentPage.types';

export const termsAndConditionsConfig: ContentfulContentPageConfig = {
  title: { defaultMessage: 'Terms and Conditions', id: 'Terms And Conditions / Title' },
  description: { defaultMessage: 'Legal terms for using our service', id: 'Terms And Conditions / Description' },
  pageTitle: { defaultMessage: 'Terms and Conditions', id: 'Terms And Conditions / Page title' },
  icon: Scale,
  contentField: 'termsAndConditions',
  emptyTitle: { defaultMessage: 'No Content Available', id: 'Terms And Conditions / Empty title' },
  emptyDescription: {
    defaultMessage:
      "The terms and conditions content hasn't been added yet. Please add content to the 'termsAndConditions' field in your Contentful AppConfig entry.",
    id: 'Terms And Conditions / Empty description',
  },
  errorTitle: {
    defaultMessage: 'Unable to load terms and conditions',
    id: 'Terms And Conditions / Error title',
  },
  errorDescription: {
    defaultMessage: 'There was an error loading this content from Contentful.',
    id: 'Terms And Conditions / Error description',
  },
  notConfiguredTitle: {
    defaultMessage: 'Contentful Integration Not Configured',
    id: 'Terms And Conditions / Not configured title',
  },
  notConfiguredDescription: {
    defaultMessage:
      'This page displays content managed via Contentful CMS. To enable it, you need to configure the Contentful integration.',
    id: 'Terms And Conditions / Not configured description',
  },
  quickSetupTitle: { defaultMessage: 'Quick Setup', id: 'Terms And Conditions / Quick setup title' },
  setupStep1: {
    defaultMessage: 'Create a Contentful account and space at {link}',
    id: 'Terms And Conditions / Setup step 1',
  },
  setupStep2: {
    defaultMessage: 'Add these environment variables to {file}:',
    id: 'Terms And Conditions / Setup step 2',
  },
  setupStep3: {
    defaultMessage: "Create an AppConfig content type with a 'termsAndConditions' field (Long text, Markdown)",
    id: 'Terms And Conditions / Setup step 3',
  },
  setupStep4: { defaultMessage: 'Restart the development server', id: 'Terms And Conditions / Setup step 4' },
  retryButton: { defaultMessage: 'Retry', id: 'Terms And Conditions / Retry button' },
  viewFullDocs: { defaultMessage: 'View Full Documentation', id: 'Terms And Conditions / Docs link' },
  tryAgainButton: { defaultMessage: 'Try again', id: 'Terms And Conditions / Retry button' },
  contentfulDocs: {
    defaultMessage: 'Contentful Documentation',
    id: 'Terms And Conditions / Docs link',
  },
  openContentful: { defaultMessage: 'Open Contentful', id: 'Terms And Conditions / Open Contentful' },
};
