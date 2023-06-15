import { useQuery } from '@apollo/client';
import { gql } from '@sb/webapp-api-client/graphql';
import { BackButton } from '@sb/webapp-core/components/buttons';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router';

import { RoutesConfig } from '../../../config/routes';

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
    <div className="py-4 px-12">
      <BackButton to={generateLocalePath(RoutesConfig.crudDemoItem.list)} />
      <h1 className="text-2xl mb-3 leading-6 font-bold">{itemData?.name}</h1>
    </div>
  );
};
