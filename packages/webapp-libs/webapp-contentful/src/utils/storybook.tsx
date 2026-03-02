import { ApiTestProviders } from '@sb/webapp-api-client/tests/utils/rendering';
import { StoryFn } from '@storybook/react';
import React from 'react';

import { WrapperProps, getWrapper } from '../tests/utils/rendering';

export function withProviders(wrapperProps: WrapperProps = {}) {
  return (StoryComponent: StoryFn, storyContext: any) => {
    const { wrapper: WrapperComponent } = getWrapper(ApiTestProviders, wrapperProps, storyContext);
    const Story = StoryComponent as React.ComponentType;

    return (
      <WrapperComponent {...wrapperProps}>
        <Story />
      </WrapperComponent>
    );
  };
}
