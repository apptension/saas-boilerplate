---
title: Emails
---

Project is configured with flow to implement email templates using React, so you can prepare email templates using your project styles and components.

Default email templates are prepared to support Gmail, Apple mail client and Microsoft Outlook.

Backend and frontend share the `name` which is a `CONSTANT_CASED` identifier.

## Adding new email template

To generate a new email simply run:

```shell
yarn plop email <name>
```

> `name' is the email identifier and name at once

It generates `component` and `story` files under the `src/emails/templates/<type>/` path. The email is automatically registered, no further actions required.

## Testing email templates

You can test email templates using storybooks and wrapping email with `EmailStory`:

```typescript jsx
const StorybookTemplate: Story<PasswordResetProps> = (args) => (
  <EmailStory type={EmailTemplateType.PasswordReset} subject={<PasswordResetSubject />} emailData={args}>
    <PasswordResetEmail {...args} />
  </EmailStory>
);
```

It allows you to see email subject & template within the storybook.
It also shows a button to send each email to specific email address.

To be able to use email send button you need to run storybook using your AWS credentials and have the recipient email whitelisted in SES by project admin.

Example usage:

```shell
aws-vault exec saas-boilerplate-user -- yarn storybook

```

## Using static assets in the template

- To use static assets in email, they should be saved inside `/public/email-assets/` folder.
- You should reference them by using `REACT_APP_EMAIL_ASSETS_URL` url, i.e. ``<img src={`${process.env.REACT_APP_EMAIL_ASSETS_URL ?? ''}/image.png`} />``
- `REACT_APP_EMAIL_ASSETS_URL` should point to public website URL (alternatively directly to s3 bucket, in case of environment protected by basic auth)


