import React, { useEffect } from 'react';

import { useDispatch } from 'react-redux';
import { useAllDemoItemsQuery } from '../../shared/services/contentful/__generated/hooks';
import { demoItemsActions } from '../../modules/demoItems';
import { Container } from './demoItems.styles';
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
      {items?.map((demoItem) => {
        return demoItem ? <DemoItemListItem key={demoItem.sys.id} id={demoItem.sys.id} title={demoItem.title} /> : null;
      })}
    </Container>
  );
};
