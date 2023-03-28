import React, { ComponentType, PropsWithRef, PropsWithoutRef, RefAttributes, Suspense, lazy } from 'react';

export function asyncComponent<P>(asyncLoader: () => Promise<{ default: ComponentType<P> }>) {
  const Component = lazy(asyncLoader);

  return (
    props: JSX.IntrinsicAttributes &
      ((PropsWithoutRef<P> & RefAttributes<React.Component<P, any, any>>) | PropsWithRef<P>)
  ) => (
    <Suspense>
      <Component {...props} />
    </Suspense>
  );
}
