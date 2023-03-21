import { useQuery } from '@apollo/client';
import { gql } from '@sb/webapp-api-client/graphql';
import { BackButton } from '@sb/webapp-core/components/buttons';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router';

import { RoutesConfig } from '../../../config/routes';
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
