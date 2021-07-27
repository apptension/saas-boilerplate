import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { ReactNode } from 'react';
import { Container } from './backButton.styles';

export type BackButtonProps = {
  to?: string;
  children?: ReactNode;
};

export const BackButton = ({ to, children }: BackButtonProps) => {
  const history = useHistory();

  const handleBackClick = () => {
    if (to) return;
    history.goBack();
  };

  return (
    <Container to={to} onClick={handleBackClick}>
      {children ?? <FormattedMessage defaultMessage="Go back" description="Back Button / Go back" />}
    </Container>
  );
};
