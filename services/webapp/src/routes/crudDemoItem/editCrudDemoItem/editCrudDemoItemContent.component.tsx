import { FormattedMessage } from 'react-intl';
import { PreloadedQuery, usePreloadedQuery } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { BackButton } from '../../../shared/components/backButton';
import { usePromiseMutation } from '../../../shared/services/graphqlApi/usePromiseMutation';
import { RoutesConfig } from '../../../app/config/routes';
import { CrudDemoItemForm } from '../crudDemoItemForm';
import { CrudDemoItemFormFields } from '../crudDemoItemForm/crudDemoItemForm.component';
import { useGenerateLocalePath } from '../../../shared/hooks/localePaths';
import { editCrudDemoItemContentMutation } from './__generated__/editCrudDemoItemContentMutation.graphql';
import EditCrudDemoItemQuery, { editCrudDemoItemQuery } from './__generated__/editCrudDemoItemQuery.graphql';
import { Container, Header } from './editCrudDemoItem.styles';

type EditCrudDemoItemContentProps = {
  queryRef: PreloadedQuery<editCrudDemoItemQuery>;
};

export const EditCrudDemoItemContent = ({ queryRef }: EditCrudDemoItemContentProps) => {
  const generateLocalePath = useGenerateLocalePath();
  const queryData = usePreloadedQuery(EditCrudDemoItemQuery, queryRef);
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
  const data = queryData?.crudDemoItem;

  const onFormSubmit = async (formData: CrudDemoItemFormFields) => {
    if (!data) {
      return {};
    }

    return await commitEditCrudDemoItemMutation({
      variables: {
        input: { id: data.id, name: formData.name },
      },
    });
  };

  return (
    <Container>
      <BackButton to={generateLocalePath(RoutesConfig.crudDemoItem.list)} />
      <Header>
        <FormattedMessage defaultMessage="Edit CRUD Example Item" id="EditCrudDemoItem / Header" />
      </Header>

      <CrudDemoItemForm onSubmit={onFormSubmit} initialData={data} />
    </Container>
  );
};
