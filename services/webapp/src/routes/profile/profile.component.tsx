import { FormattedMessage } from 'react-intl';
import { ChangePasswordForm } from '../../shared/components/auth/changePasswordForm';
import { EditProfileForm } from '../../shared/components/auth/editProfileForm';
import { useAuth } from '../../shared/hooks/useAuth/useAuth';
import { AvatarForm } from '../../shared/components/auth/avatarForm';
import { Container, EmailLabel, RolesLabel, FormHeader, HeaderInfo, Header } from './profile.styles';

export const Profile = () => {
  const { currentUser } = useAuth();

  return (
    <Container>
      <Header>
        <FormattedMessage defaultMessage="User profile" description="Auth / Profile details / Header" />
      </Header>

      <HeaderInfo>
        <AvatarForm />

        <EmailLabel>
          <FormattedMessage
            defaultMessage="Email: {email}"
            description="Auth / Profile details / Email label"
            values={{ email: currentUser?.email }}
          />
        </EmailLabel>

        <RolesLabel>
          <FormattedMessage
            defaultMessage="Roles: {roles}"
            description="Auth / Profile details / Roles label"
            values={{ roles: currentUser?.roles?.join(',') }}
          />
        </RolesLabel>
      </HeaderInfo>

      <FormHeader>
        <FormattedMessage defaultMessage="Personal data" description="Auth / Profile details / Personal data header" />
      </FormHeader>
      <EditProfileForm />

      <FormHeader>
        <FormattedMessage
          defaultMessage="Change password"
          description="Auth / Profile details / Change password header"
        />
      </FormHeader>
      <ChangePasswordForm />
    </Container>
  );
};
