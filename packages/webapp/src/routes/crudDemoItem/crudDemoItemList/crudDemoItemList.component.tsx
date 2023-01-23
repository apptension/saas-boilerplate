import { Suspense, useEffect } from 'react';
import { useQueryLoader } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { FormattedMessage } from 'react-intl';
import { RoutesConfig } from '../../../app/config/routes';
import { ButtonVariant } from '../../../shared/components/forms/button';
import { useGenerateLocalePath } from '../../../shared/hooks/localePaths';
import { crudDemoItemListQuery } from './__generated__/crudDemoItemListQuery.graphql';
import { AddNewLink, Container, Header } from './crudDemoItemList.styles';
import { CrudDemoItemListContent } from './crudDemoItemListContent';

export const CrudDemoItemList = () => {
  const generateLocalePath = useGenerateLocalePath();
  const [listQueryRef, loadListQuery] = useQueryLoader<crudDemoItemListQuery>(
    graphql`
      query crudDemoItemListQuery {
        allCrudDemoItems(first: 100) @connection(key: "crudDemoItemList_allCrudDemoItems") {
          edges {
            node {
              id
              ...crudDemoItemListItem
            }
          }
        }
      }
    `
  );

  useEffect(() => {
    loadListQuery({});
  }, [loadListQuery]);

  return (
    <Container>
      <Header>CRUD Example Items</Header>
      <AddNewLink to={generateLocalePath(RoutesConfig.crudDemoItem.add)} variant={ButtonVariant.PRIMARY}>
        <FormattedMessage id="CrudDemoItemList / Add new" defaultMessage="Add new item" />
      </AddNewLink>

      {listQueryRef && (
        <Suspense fallback={<span>Loading ...</span>}>
          <CrudDemoItemListContent queryRef={listQueryRef} />
        </Suspense>
      )}
    </Container>
  );
};
