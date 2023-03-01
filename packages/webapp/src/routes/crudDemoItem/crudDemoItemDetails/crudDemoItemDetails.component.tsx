import { useQuery } from '@apollo/client';
import { useParams } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { gql } from '../../../shared/services/graphqlApi/__generated/gql';
import { useGenerateLocalePath } from '../../../shared/hooks/';
import { BackButton } from '../../../shared/components/backButton';
import { RoutesConfig } from '../../../app/config/routes';
import { Container, Header } from './crudDemoItemDetails.styles';

export const crudDemoItemDetailsQuery = gql(/* GraphQL */ `
  query crudDemoItemDetailsQuery($id: ID!) {
    crudDemoItem(id: $id) {
      id
      name
    }
  }
`);

export const CrudDemoItemDetails = () => {
  type Params = {
    id: string;
  };
  const generateLocalePath = useGenerateLocalePath();
  const { id } = useParams<keyof Params>() as Params;

  const { loading, data } = useQuery(crudDemoItemDetailsQuery, {
    variables: {
      id,
    },
  });

  if (loading) {
    return (
      <span>
        <FormattedMessage defaultMessage="Loading ..." id="Loading message" />
      </span>
    );
  }

  const itemData = data?.crudDemoItem;

  return (
    <Container>
      <BackButton to={generateLocalePath(RoutesConfig.crudDemoItem.list)} />
      <Header>{itemData?.name}</Header>
    </Container>
  );
};
