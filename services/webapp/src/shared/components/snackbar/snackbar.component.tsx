import { useDispatch, useSelector } from 'react-redux';
import closeIcon from '@iconify-icons/ion/close-outline';
import { useIntl } from 'react-intl';
import { selectSnackbarMessages } from '../../../modules/snackbar/snackbar.selectors';
import { snackbarActions } from '../../../modules/snackbar';
import { Icon } from '../icon';
import { Container, MessageText, MessageWrapper, MessageCloseButton } from './snackbar.styles';

const Message = ({ text, onDismiss }: { text: string; onDismiss: () => void }) => {
  const intl = useIntl();

  return (
    <MessageWrapper>
      <MessageText>{text}</MessageText>
      <MessageCloseButton
        onClick={onDismiss}
        aria-label={intl.formatMessage({
          defaultMessage: 'Dismiss',
          description: 'Snackbar message / Dismiss',
        })}
      >
        <Icon icon={closeIcon} />
      </MessageCloseButton>
    </MessageWrapper>
  );
};

export const Snackbar = () => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const messages = useSelector(selectSnackbarMessages);
  const hideMessage = (id: number) => dispatch(snackbarActions.hideMessage(id));

  return (
    <Container>
      {messages.map((message) => {
        const messageText =
          message.text ??
          intl.formatMessage({
            description: 'Snackbar / Generic error',
            defaultMessage: 'Something went wrong.',
          });

        return <Message key={message.id} text={messageText} onDismiss={() => hideMessage(message.id)} />;
      })}
    </Container>
  );
};
