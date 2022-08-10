import { Suspense, useEffect } from 'react';
import { useParams } from 'react-router';

import { DemoItemContent } from './demoItemContent.component';
import { useDemoItemQuery } from './demoItem.graphql';

export const DemoItem = () => {
  type Params = { id: string };
  const { id } = useParams<Params>() as Params;
  const [itemQueryRef, loadItem] = useDemoItemQuery();
  useEffect(() => {
    loadItem({ id });
  }, [loadItem, id]);

  if (!itemQueryRef) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <DemoItemContent itemQueryRef={itemQueryRef} />
    </Suspense>
  );
};
