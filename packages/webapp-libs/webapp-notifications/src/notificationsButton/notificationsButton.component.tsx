import { FragmentType, getFragmentData, gql } from '@sb/webapp-api-client/graphql';
import { Button, ButtonProps } from '@sb/webapp-core/components/buttons';
import { Mail, MailPlus } from 'lucide-react';
import * as React from 'react';
import { useIntl } from 'react-intl';

export const NOTIFICATIONS_BUTTON_CONTENT_FRAGMENT = gql(/* GraphQL */ `
  fragment notificationsButtonContent on Query {
    hasUnreadNotifications
  }
`);

export type NotificationsButtonProps = Omit<ButtonProps, 'children' | 'variant'> & {
  queryResult?: FragmentType<typeof NOTIFICATIONS_BUTTON_CONTENT_FRAGMENT>;
};

export const NotificationsButton = React.forwardRef<HTMLButtonElement, NotificationsButtonProps>(
  ({ queryResult, ...props }: NotificationsButtonProps, ref) => {
    const data = getFragmentData(NOTIFICATIONS_BUTTON_CONTENT_FRAGMENT, queryResult);

    return <Content hasUnreadNotifications={data?.hasUnreadNotifications ?? false} {...props} ref={ref} />;
  }
);

type ContentProps = Omit<NotificationsButtonProps, 'queryResult'> & {
  hasUnreadNotifications: boolean;
};

const Content = React.forwardRef<HTMLButtonElement, ContentProps>(
  ({ hasUnreadNotifications, ...props }: ContentProps, ref) => {
    const intl = useIntl();

    return (
      <Button
        data-unread={hasUnreadNotifications}
        aria-label={intl.formatMessage({
          defaultMessage: 'Open notifications',
          id: 'Notifications / Notifications Button / Label',
        })}
        {...props}
        ref={ref}
      >
        {hasUnreadNotifications ? <MailPlus className="w-8 h-6" /> : <Mail className="w-7 h-5" />}
      </Button>
    );
  }
);

export const NotificationsButtonFallback = () => <Content hasUnreadNotifications={false} />;
