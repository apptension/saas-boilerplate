import { ApiTestProviders } from '@sb/webapp-api-client/tests/utils/rendering';
import { StoryFn } from '@storybook/react';

import { WrapperProps, getWrapper } from '../tests/utils/rendering';

export function withProviders(wrapperProps: WrapperProps = {}) {
  return (StoryComponent: StoryFn) => {
    const { wrapper: WrapperComponent } = getWrapper(ApiTestProviders, wrapperProps);

    return (
      <WrapperComponent {...wrapperProps}>
        <StoryComponent />
      </WrapperComponent>
    );
  };
}
