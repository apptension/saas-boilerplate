import { useQuery } from '@apollo/client';
import { SchemaType } from '@sb/webapp-api-client/graphql';
import { Suspense } from 'react';
import { FormattedMessage } from 'react-intl';

import { DemoItemListItem } from './demoItemListItem';
import { demoItemsAllQuery } from './demoItems.graphql';
import { demoItemFactory } from '@sb/webapp-contentful/tests/factories';

export const DemoItems = () => {
  const { data } = useQuery(demoItemsAllQuery, { context: { schemaType: SchemaType.Contentful } });
  const items = data?.demoItemCollection?.items;

  const item = demoItemFactory({
    image: {
      url: 'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/315.jpg',
    },
  });

  return (
    <div className="py-4 px-12">
      <h1 className="text-2xl mb-3 leading-6 font-bold">
        <FormattedMessage defaultMessage="Contentful items" id="Contentful Items / List header" />
      </h1>

      <ul className="w-[100%] [&>*]:border [&>*]:border-input [&>*]:rounded [&>*]:mb-4 [&>*:last-child]:mb-0">
        <DemoItemListItem id="1231232321" item={item} />
        <DemoItemListItem id="1231221" item={item} />
      </ul>

      {/* <ul className="w-[100%] [&>*]:border-b [&>*]:border-input [&>*:last-child]:border-none rounded">
        <li className="w-[100%]">dasdasdas</li>
        <li className="w-[100%]">dasdasdas</li>

        {items?.map((demoItem) => {
          if (!demoItem) return null;
          return (
            <Suspense key={demoItem.sys.id} fallback={null}>
              <DemoItemListItem id={demoItem.sys.id} item={demoItem} />
            </Suspense>
          );
        })}
      </ul> */}
    </div>
  );
};
