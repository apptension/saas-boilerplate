import { FC } from 'react';
import { FormattedMessage } from 'react-intl';
import { PreloadedQuery, usePreloadedQuery } from 'react-relay';

import demoItemsAllQueryNode, { demoItemsAllQuery } from '../../__generated__/demoItemsAllQuery.graphql';
import { Container, Header, List } from './demoItems.styles';
import { DemoItemListItem } from './demoItemListItem';

type DemoItemsContentProps = {
  loadItemsQueryRef: PreloadedQuery<demoItemsAllQuery>;
};

export const DemoItemsContent: FC<DemoItemsContentProps> = ({ loadItemsQueryRef }) => {
  const { demoItemCollection } = usePreloadedQuery(demoItemsAllQueryNode, loadItemsQueryRef);
  const items = demoItemCollection?.items;

  return (
    <Container>
      <Header>
        <FormattedMessage defaultMessage="Contentful items" description="Contentful Items / List header" />
      </Header>

      <List>
        {items?.map((demoItem) => {
          return demoItem ? <DemoItemListItem key={demoItem.sys.id} id={demoItem.sys.id} item={demoItem} /> : null;
        })}
      </List>
    </Container>
  );
};
