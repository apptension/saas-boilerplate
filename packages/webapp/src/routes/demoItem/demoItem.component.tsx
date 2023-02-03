import { Suspense } from 'react';
import { useParams } from 'react-router';
import { useQuery } from '@apollo/client';

import { SchemaType } from '../../shared/services/graphqlApi/apolloClient';

import { DemoItemContent } from './demoItemContent.component';
import { demoItemQuery } from './demoItem.graphql';

type Params = { id: string };

export const DemoItem = () => {
  const { id } = useParams<Params>() as Params;
  const { data } = useQuery(demoItemQuery, {
    variables: { id },
    context: { schemaType: SchemaType.Contentful },
  });

  if (!data) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <DemoItemContent data={data} />
    </Suspense>
  );
};
