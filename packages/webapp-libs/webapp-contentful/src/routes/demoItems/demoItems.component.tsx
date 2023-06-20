import { useQuery } from '@apollo/client';
import { SchemaType } from '@sb/webapp-api-client/graphql';
import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Suspense } from 'react';
import { FormattedMessage } from 'react-intl';

import { DemoItemListItem } from './demoItemListItem';
import { demoItemsAllQuery } from './demoItems.graphql';
import { demoItemFactory } from '@sb/webapp-contentful/tests/factories';

export const DemoItems = () => {
  const { data } = useQuery(demoItemsAllQuery, { context: { schemaType: SchemaType.Contentful } });
  const items = data?.demoItemCollection?.items;

  return (
    <PageLayout>
      <PageHeadline
        header={<FormattedMessage defaultMessage="Contentful items" id="Contentful Items / List header" />}
        subheader={<FormattedMessage defaultMessage="List of contentful items" id="Contentful Items / List header" />}
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
