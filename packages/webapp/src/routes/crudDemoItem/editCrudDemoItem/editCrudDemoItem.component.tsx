import { useParams } from 'react-router';
import { useQuery } from '@apollo/client';
import { FormattedMessage } from 'react-intl';
import { graphql } from 'react-relay';

import { BackButton } from '../../../shared/components/backButton';
import { usePromiseMutation } from '../../../shared/services/graphqlApi/usePromiseMutation';
import { RoutesConfig } from '../../../app/config/routes';
import { CrudDemoItemForm } from '../crudDemoItemForm';
import { CrudDemoItemFormFields } from '../crudDemoItemForm/crudDemoItemForm.component';
import { useGenerateLocalePath } from '../../../shared/hooks/localePaths';
import { editCrudDemoItemContentMutation } from './__generated__/editCrudDemoItemContentMutation.graphql';

import { Container, Header } from './editCrudDemoItem.styles';

import { CRUD_DEMO_ITEM_EDIT_QUERY } from './editCrudDemoItem.graphql';

type Params = { id: string };

export const EditCrudDemoItem = () => {
  const { id } = useParams<Params>();

  const { data } = useQuery(CRUD_DEMO_ITEM_EDIT_QUERY, { variables: { id } });
  const crudDemoItem = data?.crudDemoItem;

  const generateLocalePath = useGenerateLocalePath();
  const [commitEditCrudDemoItemMutation] = usePromiseMutation<editCrudDemoItemContentMutation>(graphql`
    mutation editCrudDemoItemContentMutation($input: UpdateCrudDemoItemMutationInput!) {
      updateCrudDemoItem(input: $input) {
        crudDemoItem {
          id
          name
        }
      }
    }
  `);

  if (!crudDemoItem)
    return (
      <span>
        <FormattedMessage defaultMessage="Loading ..." id="Loading message" />
      </span>
    );

  const onFormSubmit = async (formData: CrudDemoItemFormFields) => {
    if (!crudDemoItem) return {};

    return await commitEditCrudDemoItemMutation({
      variables: {
        input: { id: crudDemoItem.id, name: formData.name },
      },
    });
  };

  return (
    <Container>
      <BackButton to={generateLocalePath(RoutesConfig.crudDemoItem.list)} />
      <Header>
        <FormattedMessage defaultMessage="Edit CRUD Example Item" id="EditCrudDemoItem / Header" />
      </Header>

      <CrudDemoItemForm onSubmit={onFormSubmit} initialData={crudDemoItem} />
    </Container>
  );
};
