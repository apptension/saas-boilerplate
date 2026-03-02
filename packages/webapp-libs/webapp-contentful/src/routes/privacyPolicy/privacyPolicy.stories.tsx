import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { createContentfulPageMocks } from '../../components/contentfulContentPage/contentfulContentPage.storyHelpers';
import { withProviders } from '../../utils/storybook';
import { PrivacyPolicy } from './privacyPolicy.component';

const sampleContent = `
# Privacy Policy

## 1. Introduction

This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service. Please read this privacy policy carefully.

## 2. Information We Collect

### 2.1 Personal Data
We may collect personally identifiable information, including but not limited to:
- Name and email address
- Phone number
- Billing and payment information
- Usage data and preferences

### 2.2 Automatically Collected Information
When you access our service, we automatically collect:
- Device and browser information
- IP address and location data
- Usage patterns and preferences
- Cookies and similar tracking technologies

## 3. How We Use Your Information

We use the information we collect to:
1. Provide and maintain our service
2. Process transactions and send related information
3. Send promotional communications (with your consent)
4. Respond to your inquiries and support requests
5. Improve our services and user experience
6. Comply with legal obligations

## 4. Data Sharing and Disclosure

We may share your information with:
- **Service Providers**: Third parties that help us operate our service
- **Business Partners**: For joint marketing or service offerings
- **Legal Compliance**: When required by law or to protect our rights

We do not sell your personal information to third parties.

## 5. Data Security

We implement appropriate technical and organizational measures to protect your data, including:
- Encryption of data in transit and at rest
- Regular security assessments
- Access controls and authentication
- Employee training on data protection

## 6. Your Rights

Depending on your location, you may have the right to:
- Access your personal data
- Correct inaccurate data
- Delete your data
- Object to processing
- Data portability
- Withdraw consent

## 7. Cookies and Tracking

We use cookies and similar technologies to:
- Remember your preferences
- Analyze usage patterns
- Provide personalized content
- Improve our services

You can control cookies through your browser settings.

## 8. Children's Privacy

Our service is not intended for children under 13. We do not knowingly collect information from children under 13.

## 9. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.

## 10. Contact Us

If you have questions about this Privacy Policy, please contact us at:
- Email: privacy@example.com
- Address: 123 Privacy Street, Data City, DC 12345

---

*Last updated: January 2024*
`;

const mocks = createContentfulPageMocks('privacyPolicy', sampleContent, null);

const Template: StoryFn = () => <PrivacyPolicy />;

const meta: Meta = {
  title: 'Routes/PrivacyPolicy',
  component: PrivacyPolicy,
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: Template,
  decorators: [
    withProviders({
      apolloMocks: (defaultMocks) => mocks.default(defaultMocks),
    }),
  ],
};

export const Loading: StoryObj<typeof meta> = {
  render: Template,
  decorators: [
    withProviders({
      apolloMocks: (defaultMocks) => mocks.loading(defaultMocks),
    }),
  ],
};

export const EmptyContent: StoryObj<typeof meta> = {
  render: Template,
  decorators: [
    withProviders({
      apolloMocks: (defaultMocks) => mocks.empty(defaultMocks),
    }),
  ],
};

export const NotConfigured: StoryObj<typeof meta> = {
  render: Template,
  decorators: [
    withProviders({
      apolloMocks: (defaultMocks) => mocks.notConfigured(defaultMocks),
    }),
  ],
};

export const WithError: StoryObj<typeof meta> = {
  render: Template,
  decorators: [
    withProviders({
      apolloMocks: (defaultMocks) => mocks.withError(defaultMocks),
    }),
  ],
};
