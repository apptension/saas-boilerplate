import React, { useEffect } from 'react';

import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { useAllDemoItemsQuery } from '../../shared/services/contentful/__generated/hooks';
import { demoItemsActions } from '../../modules/demoItems';
import { Container, Header, List } from './demoItems.styles';
import { DemoItemListItem } from './demoItemListItem';

export const DemoItems = () => {
  const { data } = useAllDemoItemsQuery();
  const items = data?.demoItemCollection?.items;
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(demoItemsActions.fetchFavoriteDemoItems());
  }, [dispatch]);

  return (
    <Container>
      <Header>
        <FormattedMessage defaultMessage={'Contentful items'} description={'Contentful Items / List header'} />
      </Header>

      <List>
        {items?.map((demoItem) => {
          return demoItem ? <DemoItemListItem key={demoItem.sys.id} id={demoItem.sys.id} item={demoItem} /> : null;
        })}
      </List>
    </Container>
  );
};
