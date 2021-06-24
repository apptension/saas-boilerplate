import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { empty } from 'ramda';
import { Container } from './backButton.styles';

export type BackButtonProps = {
  to?: string;
};

export const BackButton = ({ to }: BackButtonProps) => {
  const history = useHistory();

  const handleBackClick = () => {
    history.goBack();
  };

  return (
    <Container to={to} onClick={to ? empty : handleBackClick}>
      <FormattedMessage defaultMessage={'Go back'} description={'Contentful Item / Bo back button'} />
    </Container>
  );
};
