import { useQuery } from '@apollo/client';
import { gql } from '@sb/webapp-api-client/graphql';
import { ButtonVariant, Link } from '@sb/webapp-core/components/buttons';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { mapConnection } from '@sb/webapp-core/utils/graphql';
import { PlusCircle } from 'lucide-react';
import { FormattedMessage } from 'react-intl';

import { RoutesConfig } from '../../../config/routes';
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
      <Link
        className="flex w-fit items-center rounded-md border border-input px-3 py-2 text-sm ring-offset-background
        placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        to={generateLocalePath(RoutesConfig.crudDemoItem.add)}
        variant={ButtonVariant.PRIMARY}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        <FormattedMessage id="CrudDemoItemList / Add new" defaultMessage="Add new item" />
      </Link>

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
