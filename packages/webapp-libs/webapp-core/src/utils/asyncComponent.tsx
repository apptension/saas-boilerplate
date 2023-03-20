import { ComponentType, Suspense, lazy } from 'react';

export function asyncComponent<P>(asyncLoader: () => Promise<{ default: ComponentType<P> }>) {
  const Component = lazy(asyncLoader);

  return (props: P) => (
    <Suspense>
      <Component {...props} />
    </Suspense>
  );
}
