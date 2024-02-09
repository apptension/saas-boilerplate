import {NetworkStatus, useQuery, useSubscription} from '@apollo/client';
import {ResultOf} from '@graphql-typed-document-node/core';
import {Popover, PopoverContent, PopoverTrigger} from '@sb/webapp-core/components/popover';
import {ElementType, FC} from 'react';

import {notificationCreatedSubscription, notificationsListQuery} from './notifications.graphql';
import {NotificationTypes} from './notifications.types';
import {NotificationsButton, NotificationsButtonFallback} from './notificationsButton';
import {NotificationsList, notificationsListContentFragment} from './notificationsList';
import {NOTIFICATIONS_PER_PAGE} from './notificationsList/notificationsList.constants';

type NotificationsProps = {
    templates: Record<NotificationTypes, ElementType>;
};

export const Notifications: FC<NotificationsProps> = ({templates}) => {
    const {loading, data, fetchMore, networkStatus} = useQuery(notificationsListQuery);
    useSubscription(notificationCreatedSubscription, {
        onData: (options) => {
            options.client.cache.updateQuery({query: notificationsListQuery}, (prev: ResultOf<typeof notificationsListContentFragment>) => ({
                ...prev,
                allNotifications: {
                    __typename: 'NotificationConnection',
                    pageInfo: {
                        __typename: 'PageInfo',
                        endCursor: null,
                        hasNextPage: false,
                    },
                    ...(prev?.allNotifications ?? {}),

                    edges: [
                        ...(options.data.data?.notificationCreated?.notification ? [{node: options.data.data?.notificationCreated.notification}] : []),
                        ...(prev.allNotifications?.edges ?? []),
                    ],
                },
                hasUnreadNotifications: true,
            }));
        },
    });

    if (loading && networkStatus === NetworkStatus.loading) {
        return <NotificationsButtonFallback/>;
    }

    const onLoadMore = async (cursor: string, count = NOTIFICATIONS_PER_PAGE) => {
        await fetchMore({
            variables: {
                cursor,
                count,
            },
        });
    };

    return (
        <Popover>
            <PopoverTrigger data-testid="notifications-trigger-testid" asChild>
                <NotificationsButton queryResult={data}/>
            </PopoverTrigger>
            <PopoverContent className="md:w-96 w-72" align="end" side="bottom" sideOffset={15}>
                <NotificationsList templates={templates} queryResult={data} loading={loading} onLoadMore={onLoadMore}/>
            </PopoverContent>
        </Popover>
    );
};
