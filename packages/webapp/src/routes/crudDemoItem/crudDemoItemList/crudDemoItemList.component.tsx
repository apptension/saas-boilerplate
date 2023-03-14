import { useQuery } from '@apollo/client';
import { ButtonVariant } from '@saas-boilerplate-app/webapp-core/components/buttons';
import { FormattedMessage } from 'react-intl';

import { RoutesConfig } from '../../../app/config/routes';
import { useGenerateLocalePath } from '../../../shared/hooks';
import { gql } from '../../../shared/services/graphqlApi/__generated/gql';
import { mapConnection } from '../../../shared/utils/graphql';
import { AddNewLink, Container, Header, List } from './crudDemoItemList.styles';
import { CrudDemoItemListItem } from './crudDemoItemListItem';

export const crudDemoItemListQuery = gql(/* GraphQL */ `
  query crudDemoItemListQuery {
    allCrudDemoItems(first: 100) {
      edges {
        node {
          id
          ...crudDemoItemListItem
        }
      }
    }
  }
`);

export const CrudDemoItemList = () => {
  const generateLocalePath = useGenerateLocalePath();
  const { loading, data } = useQuery(crudDemoItemListQuery);

  const renderList = () => {
    if (data) {
      return (
        <List>
          {mapConnection(
            (node) => (
              <CrudDemoItemListItem item={node} key={node.id} />
            ),
            data.allCrudDemoItems
          )}
        </List>
      );
    }
    return null;
  };

  return (
    <Container>
      <Header>CRUD Example Items</Header>
      <AddNewLink to={generateLocalePath(RoutesConfig.crudDemoItem.add)} variant={ButtonVariant.PRIMARY}>
        <FormattedMessage id="CrudDemoItemList / Add new" defaultMessage="Add new item" />
      </AddNewLink>

      {loading ? (
        <span>
          <FormattedMessage defaultMessage="Loading ..." id="Loading message" />
        </span>
      ) : (
        renderList()
      )}
    </Container>
  );
};
