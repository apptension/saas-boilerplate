import { Suspense, lazy, ComponentType } from 'react';

export const asyncComponent = (asyncLoader: () => Promise<{ default: ComponentType<unknown> }>) => {
  const Component = lazy(asyncLoader);

  return () => (
    <Suspense>
      <Component />
    </Suspense>
  );
};
