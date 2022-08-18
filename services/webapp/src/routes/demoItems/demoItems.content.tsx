import { FC, Suspense } from 'react';
import { FormattedMessage } from 'react-intl';
import { PreloadedQuery, usePreloadedQuery } from 'react-relay';

import demoItemsAllQueryNode, { demoItemsAllQuery } from '../../__generated__/demoItemsAllQuery.graphql';
import { useFavoriteDemoItemsLoader } from '../../shared/hooks/useFavoriteDemoItem/useFavoriteDemoItem.hook';
import { Container, Header, List } from './demoItems.styles';
import { DemoItemListItem } from './demoItemListItem';

type DemoItemsContentProps = {
  loadItemsQueryRef: PreloadedQuery<demoItemsAllQuery>;
};

export const DemoItemsContent: FC<DemoItemsContentProps> = ({ loadItemsQueryRef }) => {
  const { demoItemCollection } = usePreloadedQuery(demoItemsAllQueryNode, loadItemsQueryRef);
  const items = demoItemCollection?.items;
  const [queryRef, refresh] = useFavoriteDemoItemsLoader();

  if (!queryRef) {
    return null;
  }

  return (
    <Container>
      <Header>
        <FormattedMessage defaultMessage="Contentful items" description="Contentful Items / List header" />
      </Header>

      <List>
        {items?.map((demoItem) => {
          return demoItem ?
            (
              <Suspense fallback={null}>
                <DemoItemListItem
                  key={demoItem.sys.id}
                  id={demoItem.sys.id}
                  item={demoItem}
                  refreshFavorites={refresh}
                  queryRef={queryRef}
                />
              </Suspense>
            ): null;
        })}
      </List>
    </Container>
  );
};
