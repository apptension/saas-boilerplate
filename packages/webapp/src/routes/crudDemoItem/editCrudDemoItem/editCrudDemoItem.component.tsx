import { Navigate, useParams } from 'react-router';
import { useMutation, useQuery } from '@apollo/client';
import { FormattedMessage, useIntl } from 'react-intl';

import { BackButton } from '../../../shared/components/backButton';
import { RoutesConfig } from '../../../app/config/routes';
import { CrudDemoItemForm } from '../crudDemoItemForm';
import { CrudDemoItemFormFields } from '../crudDemoItemForm/crudDemoItemForm.component';
import { useGenerateLocalePath } from '../../../shared/hooks/localePaths';
import { useSnackbar } from '../../../modules/snackbar';

import { Container, Header } from './editCrudDemoItem.styles';
import { CRUD_DEMO_ITEM_EDIT_MUTATION, CRUD_DEMO_ITEM_EDIT_QUERY } from './editCrudDemoItem.graphql';

type Params = { id: string };

export const EditCrudDemoItem = () => {
  const { id } = useParams<Params>();
  const { data, loading } = useQuery(CRUD_DEMO_ITEM_EDIT_QUERY, { variables: { id } });
  const crudDemoItem = data?.crudDemoItem;

  const { showMessage } = useSnackbar();
  const intl = useIntl();

  const successMessage = intl.formatMessage({
    id: 'CrudDemoItem form / Success message',
    defaultMessage: '🎉 Changes saved successfully!',
  });

  const generateLocalePath = useGenerateLocalePath();
  const [commitEditCrudDemoItemMutation, { error, loading: loadingMutation }] = useMutation(
    CRUD_DEMO_ITEM_EDIT_MUTATION,
    {
      onCompleted: () => showMessage(successMessage),
    }
  );

  if (loading)
    return (
      <Container>
        <FormattedMessage defaultMessage="Loading ..." id="Loading message" />
      </Container>
    );
  if (!crudDemoItem) return <Navigate to={generateLocalePath(RoutesConfig.crudDemoItem.index)} />;

  const onFormSubmit = (formData: CrudDemoItemFormFields) => {
    commitEditCrudDemoItemMutation({ variables: { input: { id: crudDemoItem.id, name: formData.name } } });
  };

  return (
    <Container>
      <BackButton to={generateLocalePath(RoutesConfig.crudDemoItem.list)} />
      <Header>
        <FormattedMessage defaultMessage="Edit CRUD Example Item" id="EditCrudDemoItem / Header" />
      </Header>

      <CrudDemoItemForm onSubmit={onFormSubmit} initialData={crudDemoItem} error={error} loading={loadingMutation} />
    </Container>
  );
};
