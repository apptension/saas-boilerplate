import React from 'react';
import { FormattedMessage } from 'react-intl';
import { ConnectionHandler } from 'relay-runtime';
import graphql from 'babel-plugin-relay/macro';
import { PreloadedQuery } from 'react-relay';

import { crudDemoItemListQuery } from '../../../__generated__/crudDemoItemListQuery.graphql';
import { addCrudDemoItemMutation } from '../../../__generated__/addCrudDemoItemMutation.graphql';
import { BackButton } from '../../../shared/components/backButton/backButton.component';
import { usePromiseMutation } from '../../../shared/services/graphqlApi/usePromiseMutation';
import { useGenerateLocalePath } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../app.constants';
import { CrudDemoItemFormFields } from '../crudDemoItemForm/crudDemoItemForm.component';
import { CrudDemoItemForm } from '../crudDemoItemForm';
import { Container, Header } from './addCrudDemoItem.styles';

export type AddCrudDemoItemProps = () => {
  listQueryRef?: PreloadedQuery<crudDemoItemListQuery> | null;
};

export const AddCrudDemoItem = () => {
  const generateLocalePath = useGenerateLocalePath();
  const [commitCrudDemoItemFormMutation] = usePromiseMutation<addCrudDemoItemMutation>(graphql`
    mutation addCrudDemoItemMutation($input: CreateCrudDemoItemMutationInput!, $connections: [ID!]!) {
      createCrudDemoItem(input: $input) {
        crudDemoItemEdge @appendEdge(connections: $connections) {
          node {
            id
            name
          }
        }
      }
    }
  `);

  const onFormSubmit = async (formData: CrudDemoItemFormFields) => {
    return await commitCrudDemoItemFormMutation({
      variables: {
        input: { name: formData.name },
        connections: [ConnectionHandler.getConnectionID('root', 'crudDemoItemList_allCrudDemoItems')],
      },
    });
  };

  return (
    <Container>
      <BackButton to={generateLocalePath(ROUTES.crudDemoItem.list)} />
      <Header>
        <FormattedMessage defaultMessage={'Add CRUD Example Item'} description={'AddCrudDemoItem / Header'} />
      </Header>
      <CrudDemoItemForm onSubmit={onFormSubmit} />
    </Container>
  );
};
