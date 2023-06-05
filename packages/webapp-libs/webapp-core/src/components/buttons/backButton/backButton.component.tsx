import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { ButtonVariant } from '../';
import { BackIcon, Container } from './backButton.styles';

export type BackButtonProps = {
  to?: string;
  children?: ReactNode;
};

export const BackButton = ({ to, children }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (to) return;
    navigate(-1);
  };

  return (
    <Container to={to} onClick={handleBackClick} icon={<BackIcon />} variant={ButtonVariant.GHOST}>
      {children ?? <FormattedMessage defaultMessage="Go back" id="Back Button / Go back" />}
    </Container>
  );
};
