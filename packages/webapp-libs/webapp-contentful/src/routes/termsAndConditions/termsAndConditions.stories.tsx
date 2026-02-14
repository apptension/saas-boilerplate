import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { createContentfulPageMocks } from '../../components/contentfulContentPage/contentfulContentPage.storyHelpers';
import { withProviders } from '../../utils/storybook';
import { TermsAndConditions } from './termsAndConditions.component';

const sampleContent = `
# Terms and Conditions

## 1. Introduction

Welcome to our service. These Terms and Conditions govern your use of our platform and services. By accessing or using our service, you agree to be bound by these terms.

## 2. Definitions

- **"Service"** refers to the application, website, and any related services provided.
- **"User"** refers to any individual who accesses or uses the Service.
- **"Content"** refers to any text, images, or other materials uploaded to the Service.

## 3. User Accounts

### 3.1 Registration
To access certain features of the Service, you must register for an account. You agree to:
- Provide accurate and complete information
- Maintain the security of your account credentials
- Promptly update any changes to your information

### 3.2 Account Responsibilities
You are responsible for all activities that occur under your account. Please notify us immediately if you suspect any unauthorized use.

## 4. Acceptable Use

You agree not to:
1. Use the Service for any illegal purposes
2. Violate any applicable laws or regulations
3. Infringe on the rights of others
4. Upload malicious code or content
5. Attempt to gain unauthorized access to the Service

## 5. Intellectual Property

All content, trademarks, and other intellectual property on the Service are owned by us or our licensors. You may not use, copy, or distribute any content without permission.

## 6. Limitation of Liability

To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.

## 7. Changes to Terms

We reserve the right to modify these Terms at any time. We will notify users of any material changes via email or through the Service.

## 8. Contact

If you have any questions about these Terms, please contact us at legal@example.com.

---

*Last updated: January 2024*
`;

const mocks = createContentfulPageMocks('termsAndConditions', sampleContent, null);

const Template: StoryFn = () => <TermsAndConditions />;

const meta: Meta = {
  title: 'Routes/TermsAndConditions',
  component: TermsAndConditions,
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
