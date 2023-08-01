import { useQuery } from '@apollo/client';
import { SchemaType } from '@sb/webapp-api-client/graphql';
import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Suspense, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { DemoItemListItem } from './demoItemListItem';
import { demoItemsAllQuery } from './demoItems.graphql';

export const DemoItems = () => {
  const { data, refetch } = useQuery(demoItemsAllQuery, { context: { schemaType: SchemaType.Contentful } });
  const items = data?.demoItemCollection?.items;

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <PageLayout>
      <PageHeadline
        header={<FormattedMessage defaultMessage="Content items" id="Contentful Items / List header" />}
        subheader={
          <FormattedMessage
            defaultMessage="This demo page showcases a dynamic list of items, each managed by Contentful headless CMS. The list not only presents an array of items but also demonstrates how each item can be synchronized with our application's database. This synchronization enables the integration of the application's business logic with the content managed in Contentful. You can interact with the list by clicking the star icon next to each item."
            id="Contentful Items / List subheader"
          />
        }
      />

      <ul className="w-[100%] [&>*]:border-b [&>*]:border-input [&>*:last-child]:border-none rounded">
        {items?.map((demoItem) => {
          if (!demoItem) return null;
          return (
            <Suspense key={demoItem.sys.id} fallback={null}>
              <DemoItemListItem item={demoItem} id={demoItem.sys.id} />
            </Suspense>
          );
        })}
      </ul>
    </PageLayout>
  );
};
