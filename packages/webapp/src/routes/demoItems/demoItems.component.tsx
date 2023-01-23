import { Suspense, useEffect } from 'react';

import { useDemoItemsAllQuery } from './demoItems.graphql';
import { DemoItemsContent } from './demoItems.content';

export const DemoItems = () => {
  const [loadItemsQueryRef, loadItemsQuery] = useDemoItemsAllQuery();

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
