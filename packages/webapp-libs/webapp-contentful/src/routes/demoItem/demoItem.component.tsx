import { useQuery } from '@apollo/client';
import { SchemaType } from '@sb/webapp-api-client';
import { FC, Suspense } from 'react';
import { useParams } from 'react-router';

import { demoItemQuery } from './demoItem.graphql';
import { DemoItemContent } from './demoItemContent.component';

type Params = { id: string };

type DemoItemProps = {
  routesConfig: {
    notFound: string;
  };
};

export const DemoItem: FC<DemoItemProps> = ({ routesConfig }) => {
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
      <DemoItemContent data={data} routesConfig={routesConfig} />
    </Suspense>
  );
};
