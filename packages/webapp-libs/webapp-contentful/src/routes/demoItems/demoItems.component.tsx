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

  const item1 = demoItemFactory({
    title: 'Lotem Lotem Lotem Lotem Lotem Lotem Lotem Lotem Lotem Lotem ',
    image: {
      url: 'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/315.jpg',
    },
  });
  const item2 = demoItemFactory({
    image: {
      url: 'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/315.jpg',
    },
  });
  const item3 = demoItemFactory({
    image: {
      url: 'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/315.jpg',
    },
  });

  return (
    <PageLayout>
      <PageHeadline
        header={<FormattedMessage defaultMessage="Contentful items" id="Contentful Items / List header" />}
        subheader={<FormattedMessage defaultMessage="List of contentful items" id="Contentful Items / List header" />}
      />

      <ul className="w-[100%] [&>*]:border-b [&>*]:border-input [&>*:last-child]:border-none rounded">
        <DemoItemListItem id="dasdasdsa" item={item1} />
        <DemoItemListItem id="dasdasdsa" item={item2} />
        <DemoItemListItem id="dasdasdsa" item={item3} />

        {/* {items?.map((demoItem) => {
          if (!demoItem) return null;
          return (
            <Suspense key={demoItem.sys.id} fallback={null}>
              <DemoItemListItem id={demoItem.sys.id} />
            </Suspense>
          );
        })} */}
      </ul>
    </PageLayout>
  );
};
