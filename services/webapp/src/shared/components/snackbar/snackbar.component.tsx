import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { selectSnackbarMessages } from '../../../modules/snackbar/snackbar.selectors';
import { snackbarActions } from '../../../modules/snackbar';
import { Container } from './snackbar.styles';
import { Message } from './message';

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
            id: 'Snackbar / Generic error',
            defaultMessage: 'Something went wrong.',
          });

        return <Message key={message.id} text={messageText} onDismiss={() => hideMessage(message.id)} />;
      })}
    </Container>
  );
};
