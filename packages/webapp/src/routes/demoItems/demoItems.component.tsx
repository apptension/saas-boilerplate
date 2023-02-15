import { FC, Suspense } from 'react';
import { FormattedMessage } from 'react-intl';

import { useQuery } from '@apollo/client';
import { SchemaType } from '../../shared/services/graphqlApi/apolloClient';
import { Container, Header, List } from './demoItems.styles';
import { DemoItemListItem } from './demoItemListItem';
import { demoItemsAllQuery } from './demoItems.graphql';

export const DemoItems: FC = () => {
  const { data } = useQuery(demoItemsAllQuery, { context: { schemaType: SchemaType.Contentful } });
  const items = data?.demoItemCollection?.items;

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
              <DemoItemListItem id={demoItem.sys.id} item={demoItem} />
            </Suspense>
          );
        })}
      </List>
    </Container>
  );
};
