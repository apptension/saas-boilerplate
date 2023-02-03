import { FC, Suspense } from 'react';
import { FormattedMessage } from 'react-intl';

import { useQuery } from '@apollo/client';
import { useFavoriteDemoItemsLoader } from '../../shared/hooks/useFavoriteDemoItem/useFavoriteDemoItem.hook';
import { SchemaType } from '../../shared/services/graphqlApi/apolloClient';
import { Container, Header, List } from './demoItems.styles';
import { DemoItemListItem } from './demoItemListItem';
import { demoItemsAll } from './demoItems.graphql';

export const DemoItems: FC = () => {
  const { data } = useQuery(demoItemsAll, { context: { schemaType: SchemaType.Contentful } });
  const items = data?.demoItemCollection?.items;
  const [queryRef, refresh] = useFavoriteDemoItemsLoader();

  if (!queryRef) {
    return null;
  }

  return (
    <Container>
      <Header>
        <FormattedMessage defaultMessage="Contentful items" id="Contentful Items / List header" />
      </Header>

      <List>
        {items?.map((demoItem) => {
          if (!demoItem) return null;
          return (
            <Suspense key={demoItem.sys.id} fallback={null}>
              <DemoItemListItem id={demoItem.sys.id} item={demoItem} refreshFavorites={refresh} queryRef={queryRef} />
            </Suspense>
          );
        })}
      </List>
    </Container>
  );
};
