import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { ChangePasswordForm } from '../../shared/components/auth/changePasswordForm';
import { EditProfileForm } from '../../shared/components/auth/editProfileForm';
import { selectProfile } from '../../modules/auth/auth.selectors';
import { Container, Avatar, EmailLabel, RolesLabel, FormHeader, HeaderInfo, Header } from './profile.styles';

export const Profile = () => {
  const profile = useSelector(selectProfile);

  return (
    <Container>
      <Header>
        <FormattedMessage defaultMessage="User profile" description="Auth / Profile details / Header" />
      </Header>

      <HeaderInfo>
        <Avatar />

        <EmailLabel>
          <FormattedMessage defaultMessage="Email:" description="Auth / Profile details / Email label" />{' '}
          {profile?.email}
        </EmailLabel>

        <RolesLabel>
          <FormattedMessage defaultMessage="Roles:" description="Auth / Profile details / Roles label" />{' '}
          {profile?.roles?.join(',')}
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
