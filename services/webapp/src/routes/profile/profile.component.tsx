import React from 'react';

import { FormattedMessage } from 'react-intl';
import { ChangePasswordForm } from '../../shared/components/auth/changePasswordForm';
import { ProfileDetails } from '../auth/profileDetails';
import { Container } from './profile.styles';

export const Profile = () => {
  return (
    <Container>
      <h1>
        <FormattedMessage defaultMessage="My profile" description="Profile / heading" />
      </h1>

      <ProfileDetails />

      <ChangePasswordForm />
    </Container>
  );
};
