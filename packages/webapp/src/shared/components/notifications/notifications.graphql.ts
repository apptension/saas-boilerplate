import { gql } from '../../services/graphqlApi/__generated/gql';

export const NOTIFICATIONS_LIST_QUERY = gql(/* GraphQL */ `
  query notificationsListQuery($count: Int = 20, $cursor: String) {
    ...notificationsListContentFragment
    ...notificationsButtonContent
  }
`);
