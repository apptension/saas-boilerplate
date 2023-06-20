import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Paragraph } from '@sb/webapp-core/components/typography';
import { FormattedMessage } from 'react-intl';

import { AvatarForm } from '../../shared/components/auth/avatarForm';
import { ChangePasswordForm } from '../../shared/components/auth/changePasswordForm';
import { EditProfileForm } from '../../shared/components/auth/editProfileForm';
import { TwoFactorAuthForm } from '../../shared/components/auth/twoFactorAuthForm';
import { useAuth } from '../../shared/hooks';

export const Profile = () => {
  const { currentUser } = useAuth();

  return (
    <PageLayout>
      <PageHeadline
        header={<FormattedMessage defaultMessage="User profile" id="Auth / Profile details / Header" />}
        subheader={
          <FormattedMessage
            defaultMessage="Here you can find more information about your account and edit it"
            id="Auth / Profile details / Label"
          />
        }
      />

      <div className="flex flex-row gap-3">
        <AvatarForm />

        <div>
          <Paragraph>
            <FormattedMessage
              defaultMessage="Name: {firstName} {lastName}"
              id="Auth / Profile details / Name label"
              values={{ firstName: currentUser?.firstName, lastName: currentUser?.lastName }}
            />
          </Paragraph>

          <Paragraph firstChildMargin={false}>
            <FormattedMessage
              defaultMessage="Email: {email}"
              id="Auth / Profile details / Email label"
              values={{ email: currentUser?.email }}
            />
          </Paragraph>

          <Paragraph firstChildMargin={false}>
            <FormattedMessage
              defaultMessage="Roles: {roles}"
              id="Auth / Profile details / Roles label"
              values={{ roles: currentUser?.roles?.join(',') }}
            />
          </Paragraph>
        </div>
      </div>

      <div className="flex w-full flex-col gap-y-6">
        <PageHeadline
          header={
            <FormattedMessage defaultMessage="Personal data" id="Auth / Profile details / Personal data header" />
          }
          subheader={
            <FormattedMessage
              defaultMessage="Update your account details"
              id="Auth / Profile details / Personal data label"
            />
          }
        />
        <EditProfileForm />
      </div>

      <div className="flex w-full flex-col gap-y-6">
        <PageHeadline
          header={
            <FormattedMessage defaultMessage="Change password" id="Auth / Profile details / Change password header" />
          }
          subheader={
            <FormattedMessage
              defaultMessage="Update your password"
              id="Auth / Profile details / Change password label"
            />
          }
        />
        <ChangePasswordForm />
      </div>

      <div className="flex w-full flex-col gap-y-6">
        <PageHeadline
          header={
            <FormattedMessage
              defaultMessage="Two-factor Authentication"
              id="Auth / Profile details / Two-factor Authentication header"
            />
          }
          subheader={
            <FormattedMessage
              defaultMessage="Enable 2FA on your account"
              id="Auth / Profile details / Two-factor Authentication label"
            />
          }
        />

        <TwoFactorAuthForm isEnabled={currentUser?.otpEnabled} />
      </div>
    </PageLayout>
  );
};
