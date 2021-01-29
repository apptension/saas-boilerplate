import React from 'react';

import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { selectProfile } from '../../../modules/auth/auth.selectors';
import { Container, Row, Label, Value } from './profileDetails.styles';

export const ProfileDetails = () => {
  const profile = useSelector(selectProfile);

  return (
    <Container>
      <Row>
        <Label>
          <FormattedMessage defaultMessage="First name:" description="Auth / Profile details / First name label" />
        </Label>
        <Value>{profile?.firstName}</Value>
      </Row>

      <Row>
        <Label>
          <FormattedMessage defaultMessage="Last name:" description="Auth / Profile details / Last name label" />
        </Label>
        <Value>{profile?.lastName}</Value>
      </Row>

      <Row>
        <Label>
          <FormattedMessage defaultMessage="Email:" description="Auth / Profile details / Email label" />
        </Label>
        <Value>{profile?.email}</Value>
      </Row>

      <Row>
        <Label>
          <FormattedMessage defaultMessage="Roles:" description="Auth / Profile details / Roles label" />
        </Label>
        <Value>{profile?.roles?.join(',')}</Value>
      </Row>
    </Container>
  );
};
