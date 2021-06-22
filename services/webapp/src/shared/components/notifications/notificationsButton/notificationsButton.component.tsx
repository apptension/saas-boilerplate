import React, { Suspense, useEffect } from 'react';
import mailOutlineIcon from '@iconify-icons/ion/mail-outline';
import mailUnreadOutlineIcon from '@iconify-icons/ion/mail-unread-outline';
import { PreloadedQuery, usePreloadedQuery, useRefetchableFragment } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { ButtonProps, ButtonVariant } from '../../button';
import { Icon } from '../../icon';
import NotificationsButtonQuery, {
  notificationsListQuery,
  notificationsListQueryResponse,
} from '../../../../__generated__/notificationsListQuery.graphql';
import { NotificationsButtonRefetch } from '../../../../__generated__/NotificationsButtonRefetch.graphql';
import { notificationsButtonContent$key } from '../../../../__generated__/notificationsButtonContent.graphql';
import { POLLING_INTERVAL } from '../notifications.constants';
import { Button } from './notificationsButton.styles';

export type NotificationsButtonProps = Omit<ButtonProps, 'children' | 'variant'> & {
  listQueryRef: PreloadedQuery<notificationsListQuery>;
};

export const NotificationsButton = ({ listQueryRef, ...props }: NotificationsButtonProps) => {
  const queryResponse = usePreloadedQuery(NotificationsButtonQuery, listQueryRef);

  return (
    <Suspense fallback={<Content hasUnreadNotifications={false} {...props} />}>
      <Wrapper queryResponse={queryResponse} {...props} />
    </Suspense>
  );
};

type WrapperProps = Omit<NotificationsButtonProps, 'listQueryRef'> & {
  queryResponse: notificationsListQueryResponse;
};

export const Wrapper = ({ queryResponse, ...props }: WrapperProps) => {
  const [data, refetch] = useRefetchableFragment<NotificationsButtonRefetch, notificationsButtonContent$key>(
    graphql`
      fragment notificationsButtonContent on ApiQuery @refetchable(queryName: "NotificationsButtonRefetch") {
        hasUnreadNotifications
      }
    `,
    queryResponse
  );

  useEffect(() => {
    const interval = setInterval(() => {
      refetch({}, { fetchPolicy: 'store-and-network' });
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [refetch]);

  return <Content hasUnreadNotifications={data.hasUnreadNotifications ?? false} {...props} />;
};

type ContentProps = Omit<NotificationsButtonProps, 'listQueryRef'> & {
  hasUnreadNotifications: boolean;
};

const Content = ({ hasUnreadNotifications, ...props }: ContentProps) => {
  return (
    <Button variant={ButtonVariant.ROUND} hasUnreadNotifications={hasUnreadNotifications} {...props}>
      <Icon icon={hasUnreadNotifications ? mailUnreadOutlineIcon : mailOutlineIcon} />
    </Button>
  );
};
