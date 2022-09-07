import mailOutlineIcon from '@iconify-icons/ion/mail-outline';
import mailUnreadOutlineIcon from '@iconify-icons/ion/mail-unread-outline';
import { PreloadedQuery, useFragment, usePreloadedQuery } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { useIntl } from 'react-intl';
import { ButtonProps, ButtonVariant } from '../../forms/button';
import { Icon } from '../../icon';
import notificationsListQueryGraphql, {
  notificationsListQuery,
  notificationsListQuery$data,
} from '../__generated__/notificationsListQuery.graphql';
import { notificationsButtonContent$key } from './__generated__/notificationsButtonContent.graphql';
import { Button } from './notificationsButton.styles';

export type NotificationsButtonProps = Omit<ButtonProps, 'children' | 'variant'> & {
  listQueryRef: PreloadedQuery<notificationsListQuery>;
};

export const NotificationsButton = ({ listQueryRef, ...props }: NotificationsButtonProps) => {
  const queryResponse = usePreloadedQuery(notificationsListQueryGraphql, listQueryRef);

  return <Wrapper queryResponse={queryResponse} {...props} />;
};

type WrapperProps = Omit<NotificationsButtonProps, 'listQueryRef'> & {
  queryResponse: notificationsListQuery$data;
};

export const Wrapper = ({ queryResponse, ...props }: WrapperProps) => {
  const data = useFragment<notificationsButtonContent$key>(
    graphql`
      fragment notificationsButtonContent on Query {
        hasUnreadNotifications
      }
    `,
    queryResponse
  );

  return <Content hasUnreadNotifications={data.hasUnreadNotifications ?? false} {...props} />;
};

type ContentProps = Omit<NotificationsButtonProps, 'listQueryRef'> & {
  hasUnreadNotifications: boolean;
};

const Content = ({ hasUnreadNotifications, ...props }: ContentProps) => {
  const intl = useIntl();

  return (
    <Button
      variant={ButtonVariant.ROUND}
      hasUnreadNotifications={hasUnreadNotifications}
      aria-label={intl.formatMessage({
        defaultMessage: 'Open notifications',
        id: 'Notifications / Notifications Button / Label',
      })}
      {...props}
    >
      <Icon icon={hasUnreadNotifications ? mailUnreadOutlineIcon : mailOutlineIcon} />
    </Button>
  );
};

NotificationsButton.Fallback = () => <Content hasUnreadNotifications={false} />;
