import { StoryFn } from '@storybook/react';
import React from 'react';

import { CoreTestProviders, WrapperProps, getWrapper } from '../tests/utils/rendering';

export function withProviders(wrapperProps: WrapperProps = {}) {
  return (StoryComponent: StoryFn) => {
    const { wrapper: WrapperComponent } = getWrapper(CoreTestProviders, wrapperProps);
    const Story = StoryComponent as React.ComponentType;

    return (
      <WrapperComponent {...wrapperProps}>
        <Story />
      </WrapperComponent>
    );
  };
}
