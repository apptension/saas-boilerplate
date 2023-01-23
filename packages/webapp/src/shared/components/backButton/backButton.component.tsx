import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { Container } from './backButton.styles';

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
    <Container to={to} onClick={handleBackClick}>
      {children ?? <FormattedMessage defaultMessage="Go back" id="Back Button / Go back" />}
    </Container>
  );
};
