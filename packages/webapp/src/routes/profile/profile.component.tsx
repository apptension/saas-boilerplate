import { H2, H3, Paragraph } from '@sb/webapp-core/components/typography';
import { FormattedMessage } from 'react-intl';

import { AvatarForm } from '../../shared/components/auth/avatarForm';
import { ChangePasswordForm } from '../../shared/components/auth/changePasswordForm';
import { EditProfileForm } from '../../shared/components/auth/editProfileForm';
import { TwoFactorAuthForm } from '../../shared/components/auth/twoFactorAuthForm';
import { useAuth } from '../../shared/hooks';

export const Profile = () => {
  const { currentUser } = useAuth();

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-8 px-4 py-6 md:mx-0 md:max-w-none md:items-start">
      <H2 className="w-full text-left">
        <FormattedMessage defaultMessage="User profile" id="Auth / Profile details / Header" />
      </H2>

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

          <Paragraph notFirstChildMargin={false}>
            <FormattedMessage
              defaultMessage="Email: {email}"
              id="Auth / Profile details / Email label"
              values={{ email: currentUser?.email }}
            />
          </Paragraph>

          <Paragraph notFirstChildMargin={false}>
            <FormattedMessage
              defaultMessage="Roles: {roles}"
              id="Auth / Profile details / Roles label"
              values={{ roles: currentUser?.roles?.join(',') }}
            />
          </Paragraph>
        </div>
      </div>

      <H3 className="w-full text-left">
        <FormattedMessage defaultMessage="Personal data" id="Auth / Profile details / Personal data header" />
      </H3>
      <EditProfileForm />

      <H3 className="w-full text-left">
        <FormattedMessage defaultMessage="Change password" id="Auth / Profile details / Change password header" />
      </H3>
      <ChangePasswordForm />

      <H3 className="w-full text-left">
        <FormattedMessage
          defaultMessage="Two-factor Authentication"
          id="Auth / Profile details / Two-factor Authentication header"
        />
      </H3>
      <TwoFactorAuthForm isEnabled={currentUser?.otpEnabled} />
    </div>
  );
};
