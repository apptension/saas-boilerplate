import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { Container } from './backButton.styles';

export type BackButtonProps = {
  to?: string;
};

export const BackButton = ({ to }: BackButtonProps) => {
  const history = useHistory();

  const handleBackClick = () => {
    if (to) return;
    history.goBack();
  };

  return (
    <Container to={to} onClick={handleBackClick}>
      <FormattedMessage defaultMessage={'Go back'} description={'Contentful Item / Bo back button'} />
    </Container>
  );
};
