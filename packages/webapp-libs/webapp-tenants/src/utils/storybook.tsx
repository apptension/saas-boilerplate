import { StoryFn } from '@storybook/react';

import { TenantsTestProviders, WrapperProps, getWrapper } from '../tests/utils/rendering';

export function withProviders(wrapperProps: WrapperProps = {}) {
  return (StoryComponent: StoryFn) => {
    const { wrapper: WrapperComponent } = getWrapper(TenantsTestProviders, wrapperProps);

    return (
      <WrapperComponent {...wrapperProps}>
        <StoryComponent />
      </WrapperComponent>
    );
  };
}
