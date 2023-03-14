import { useIntl } from 'react-intl';

import { useSnackbar } from '../useSnackbar';
import { Message } from './message';
import { Container } from './snackbar.styles';

export const Snackbar = () => {
  const intl = useIntl();
  const {
    snackbar: { messages },
    hideMessage,
  } = useSnackbar();

  return (
    <Container data-testid="snackbar">
      {messages.map((message) => {
        const messageText =
          message.text ??
          intl.formatMessage({
            id: 'Snackbar / Generic error',
            defaultMessage: 'Something went wrong.',
          });

        return (
          <Message
            key={message.id}
            id={message.id}
            text={messageText}
            onDismiss={() => hideMessage(message.id)}
          />
        );
      })}
    </Container>
  );
};
