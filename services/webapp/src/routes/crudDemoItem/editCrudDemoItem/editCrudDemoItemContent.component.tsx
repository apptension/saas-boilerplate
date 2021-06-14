import React from 'react';
import { FormattedMessage } from 'react-intl';
import { PreloadedQuery, usePreloadedQuery } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';

import EditCrudDemoItemQuery, { editCrudDemoItemQuery } from '../../../__generated__/editCrudDemoItemQuery.graphql';
import { editCrudDemoItemContentMutation } from '../../../__generated__/editCrudDemoItemContentMutation.graphql';
import { BackButton } from '../../../shared/components/backButton/backButton.component';
import { useGenerateLocalePath } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { usePromiseMutation } from '../../../shared/services/graphqlApi/usePromiseMutation';
import { ROUTES } from '../../app.constants';
import { CrudDemoItemForm } from '../crudDemoItemForm';
import { CrudDemoItemFormFields } from '../crudDemoItemForm/crudDemoItemForm.component';
import { Container, Header } from './editCrudDemoItem.styles';

type EditCrudDemoItemContentProps = {
  queryRef: PreloadedQuery<editCrudDemoItemQuery>;
};

export const EditCrudDemoItemContent = ({ queryRef }: EditCrudDemoItemContentProps) => {
  const generateLocalePath = useGenerateLocalePath();
  const queryData = usePreloadedQuery(EditCrudDemoItemQuery, queryRef);
  const [commitEditCrudDemoItemMutation] = usePromiseMutation<editCrudDemoItemContentMutation>(graphql`
    mutation editCrudDemoItemContentMutation($input: CreateOrUpdateCrudDemoItemMutationInput!) {
      createOrUpdateCrudDemoItem(input: $input) {
        crudDemoItem {
          id
          name
        }
        errors {
          field
          messages {
            code
            message
          }
        }
      }
    }
  `);
  const data = queryData?.crudDemoItemById;

  const onFormSubmit = async (formData: CrudDemoItemFormFields) => {
    if (!data) {
      return {};
    }

    console.log('before');
    const { response, errors } = await commitEditCrudDemoItemMutation({
      variables: {
        input: { id: data.id, name: formData.name },
      },
    });
    console.log('after', response, errors);

    return {
      errors: response.createOrUpdateCrudDemoItem?.errors,
    };
  };

  return (
    <Container>
      <BackButton to={generateLocalePath(ROUTES.crudDemoItem.list)} />
      <Header>
        <FormattedMessage defaultMessage={'Edit CRUD Example Item'} description={'EditCrudDemoItem / Header'} />
      </Header>

      <CrudDemoItemForm onSubmit={onFormSubmit} initialData={data} />
    </Container>
  );
};
