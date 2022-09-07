import closeIcon from '@iconify-icons/ion/close-outline';
import { useIntl } from 'react-intl';
import { Icon } from '../../icon';
import { CloseButton, Text, Container } from './message.styles';

type MessageProps = {
  text: string;
  onDismiss: () => void;
};

export const Message = ({ text, onDismiss }: MessageProps) => {
  const intl = useIntl();

  return (
    <Container>
      <Text>{text}</Text>
      <CloseButton
        onClick={onDismiss}
        aria-label={intl.formatMessage({
          defaultMessage: 'Dismiss',
          id: 'Snackbar message / Dismiss',
        })}
      >
        <Icon icon={closeIcon} />
      </CloseButton>
    </Container>
  );
};
