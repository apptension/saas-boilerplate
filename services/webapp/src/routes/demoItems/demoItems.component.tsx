import { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { demoItemsActions } from '../../modules/demoItems';
import { useDemoItemsAllQuery } from './demoItems.graphql';
import { DemoItemsContent } from './demoItems.content';

export const DemoItems = () => {
  const [loadItemsQueryRef, loadItemsQuery] = useDemoItemsAllQuery();

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(demoItemsActions.fetchFavoriteDemoItems());
  }, [dispatch]);

  useEffect(() => {
    loadItemsQuery({});
  }, [loadItemsQuery]);

  if (!loadItemsQueryRef) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <DemoItemsContent loadItemsQueryRef={loadItemsQueryRef} />
    </Suspense>
  );
};
