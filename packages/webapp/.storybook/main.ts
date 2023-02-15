import type { StorybookViteConfig } from '@storybook/builder-vite';

const { mergeConfig } = require('vite');

const config: StorybookViteConfig = {
  stories: [
    // todo: uncomment line below after relay removal
    // '../src/**/*.stories.tsx',

    '../src/emails/templates/accountActivation/accountActivation.stories.tsx',
    '../src/emails/templates/passwordReset/passwordReset.stories.tsx',
    '../src/emails/templates/subscriptionError/subscriptionError.stories.tsx',
    '../src/emails/templates/trialExpiresSoon/trialExpiresSoon.stories.tsx',
    '../src/routes/auth/login/login.stories.tsx',
    '../src/routes/auth/passwordReset/passwordResetConfirm/passwordResetConfirm.stories.tsx',
    '../src/routes/auth/passwordReset/passwordResetRequest/passwordResetRequest.stories.tsx',
    '../src/routes/auth/signup/signup.stories.tsx',
    '../src/routes/crudDemoItem/addCrudDemoItem/addCrudDemoItem.stories.tsx',
    '../src/routes/crudDemoItem/crudDemoItemDetails/crudDemoItemDetails.stories.tsx',
    '../src/routes/crudDemoItem/crudDemoItemForm/crudDemoItemForm.stories.tsx',
    '../src/routes/crudDemoItem/crudDemoItemList/crudDemoItemList.stories.tsx',
    '../src/routes/crudDemoItem/crudDemoItemList/crudDemoItemListItem/crudDemoItemListItem.stories.tsx',
    '../src/routes/crudDemoItem/editCrudDemoItem/editCrudDemoItem.stories.tsx',
    '../src/routes/demoItem/demoItem.stories.tsx',
    // '../src/routes/demoItems/demoItems.stories.tsx',
    '../src/routes/documents/document/document.stories.tsx',
    '../src/routes/documents/document/skeleton/skeleton.stories.tsx',
    '../src/routes/documents/documents.stories.tsx',
    '../src/routes/finances/cancelSubscription/cancelSubscription.stories.tsx',
    '../src/routes/finances/editPaymentMethod/editPaymentMethodForm/editPaymentMethodForm.stories.tsx',
    '../src/routes/finances/editSubscription/editSubscription.stories.tsx',
    '../src/routes/finances/editSubscription/subscriptionPlanItem/subscriptionPlanItem.stories.tsx',
    '../src/routes/finances/paymentConfirm/paymentConfirm.stories.tsx',
    '../src/routes/finances/subscriptions/subscriptions.stories.tsx',
    '../src/routes/finances/transactionHistory/transactionHistory.stories.tsx',
    '../src/routes/privacyPolicy/privacyPolicy.stories.tsx',
    '../src/routes/profile/profile.stories.tsx',
    '../src/routes/termsAndConditions/termsAndConditions.stories.tsx',
    '../src/shared/components/auth/avatarForm/avatarForm.stories.tsx',
    '../src/shared/components/auth/changePasswordForm/changePasswordForm.stories.tsx',
    '../src/shared/components/auth/editProfileForm/editProfileForm.stories.tsx',
    '../src/shared/components/auth/loginForm/loginForm.stories.tsx',
    '../src/shared/components/auth/passwordResetConfirmForm/passwordResetConfirmForm.stories.tsx',
    '../src/shared/components/auth/passwordResetRequestForm/passwordResetRequestForm.stories.tsx',
    '../src/shared/components/auth/signupForm/signupForm.stories.tsx',
    '../src/shared/components/auth/socialLoginButtons/socialLoginButtons.stories.tsx',
    '../src/shared/components/avatar/avatar.stories.tsx',
    '../src/shared/components/backButton/backButton.stories.tsx',
    '../src/shared/components/dateTime/formattedDate/formattedDate.stories.tsx',
    '../src/shared/components/dateTime/relativeDate/relativeDate.stories.tsx',
    '../src/shared/components/emptyState/emptyState.stories.tsx',
    '../src/shared/components/fileSize/fileSize.stories.tsx',
    '../src/shared/components/finances/stripe/stripeCardForm/stripeCardForm.stories.tsx',
    '../src/shared/components/finances/stripe/stripePaymentForm/stripePaymentForm.stories.tsx',
    '../src/shared/components/finances/stripe/stripePaymentMethodInfo/stripePaymentMethodInfo.stories.tsx',
    '../src/shared/components/finances/stripe/stripePaymentMethodSelector/stripePaymentMethodSelector.stories.tsx',
    '../src/shared/components/finances/stripe/transactionHistory/transactionHistory.stories.tsx',
    '../src/shared/components/forms/button/button.stories.tsx',
    '../src/shared/components/forms/checkbox/checkbox.stories.tsx',
    '../src/shared/components/forms/dropzone/dropzone.stories.tsx',
    '../src/shared/components/forms/input/input.stories.tsx',
    '../src/shared/components/forms/radioButton/radioButton.stories.tsx',
    '../src/shared/components/icon/icon.stories.tsx',
    '../src/shared/components/languageSwitcher/languageSwitcher.stories.tsx',
    '../src/shared/components/layout/header/header.stories.tsx',
    '../src/shared/components/layout/layout.stories.tsx',
    '../src/shared/components/layout/sidebar/sidebar.stories.tsx',
    '../src/shared/components/link/link.stories.tsx',
    '../src/shared/components/markdownPage/markdownPage.stories.tsx',
    '../src/shared/components/notifications/notification/notification.stories.tsx',
    '../src/shared/components/notifications/notification/skeleton/skeleton.stories.tsx',
    '../src/shared/components/notifications/notificationsButton/notificationsButton.stories.tsx',
    '../src/shared/components/notifications/notificationsList/notificationsList.stories.tsx',
    '../src/shared/components/notifications/templates/crudItemCreated/crudItemCreated.stories.tsx',
    '../src/shared/components/notifications/templates/crudItemUpdated/crudItemUpdated.stories.tsx',
    '../src/shared/components/snackbar/snackbar.stories.tsx',
    '../src/theme/stories/elevation.stories.tsx',
    '../src/theme/stories/typography.stories.tsx',
  ],
  addons: ['@storybook/addon-essentials', 'storybook-dark-mode'],
  staticDirs: ['../public'],
  core: {
    builder: '@storybook/builder-vite',
  },
  async viteFinal(config, options) {
    const defaultViteConfig = (await import('../vite.config')).default({});
    // filter out deprecated plugins
    config.plugins = config.plugins
      .flat()
      .filter((p) => !['vite:react-jsx', 'vite:react-refresh', 'vite:react-babel'].includes(p.name));
    return mergeConfig(config, {
      plugins: defaultViteConfig.plugins,
      resolve: defaultViteConfig.resolve,
      define: {
        ...defaultViteConfig.define,
        jest: {},
        global: {},
      },
    });
  },
};

export default config;
