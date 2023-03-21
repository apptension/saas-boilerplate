import { ApiTestProviders } from '@sb/webapp-api-client/tests/utils/rendering';
import { Story } from '@storybook/react';

import { WrapperProps, getWrapper } from '../tests/utils/rendering';

export function withProviders(wrapperProps: WrapperProps = {}) {
  return (StoryComponent: Story, storyContext: any) => {
    const { wrapper: WrapperComponent } = getWrapper(ApiTestProviders, wrapperProps, storyContext);

    return (
      <WrapperComponent {...wrapperProps}>
        <StoryComponent />
      </WrapperComponent>
    );
  };
}
