import { Suspense, useEffect } from 'react';
import { useQueryLoader } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { FormattedMessage } from 'react-intl';
import { crudDemoItemListQuery } from '../../../__generated__/crudDemoItemListQuery.graphql';
import { ROUTES } from '../../app.constants';
import { ButtonVariant } from '../../../shared/components/button';
import { useGenerateLocalePath } from '../../useLanguageFromParams/useLanguageFromParams.hook';
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
      <AddNewLink to={generateLocalePath(ROUTES.crudDemoItem.add)} variant={ButtonVariant.PRIMARY}>
        <FormattedMessage description={'CrudDemoItemList / Add new'} defaultMessage={'Add new item'} />
      </AddNewLink>

      {listQueryRef && (
        <Suspense fallback={<span>Loading ...</span>}>
          <CrudDemoItemListContent queryRef={listQueryRef} />
        </Suspense>
      )}
    </Container>
  );
};
