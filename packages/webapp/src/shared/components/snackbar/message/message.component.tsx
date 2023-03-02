import closeIcon from '@iconify-icons/ion/close-outline';
import { useIntl } from 'react-intl';

import { Icon } from '../../icon';
import { CloseButton, Container, Text } from './message.styles';

type MessageProps = {
  text: string;
  id: number;
  onDismiss: () => void;
};

export const Message = ({ id, text, onDismiss }: MessageProps) => {
  const intl = useIntl();

  return (
    <Container data-testid={`snackbar-message-${id}`}>
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
