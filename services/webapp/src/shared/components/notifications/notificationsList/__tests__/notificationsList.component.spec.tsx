import React from 'react';
import { useQueryLoader } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { makeContextRenderer } from '../../../../utils/testUtils';
import { NotificationsList } from '../notificationsList.component';
import { notificationsListTestQuery } from '../../../../../__generated__/notificationsListTestQuery.graphql';

describe('NotificationsList: Component', () => {
  const TestRenderer = () => {
    const [listQueryRef] = useQueryLoader<notificationsListTestQuery>(
      graphql`
        query notificationsListTestQuery @relay_test_operation {
          ...notificationsListContent
        }
      `
    );

    if (!listQueryRef) return null;

    return <NotificationsList isOpen={true} listQueryRef={listQueryRef} />;
  };

  const render = makeContextRenderer(() => <TestRenderer />);

  it('should render without errors', () => {
    render();
  });
});
