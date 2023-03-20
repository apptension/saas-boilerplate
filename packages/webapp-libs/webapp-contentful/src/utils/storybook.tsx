import { Story } from '@storybook/react';

import { DefaultTestProviders, DefaultTestProvidersProps, WrapperProps, getWrapper } from '../tests/utils/rendering';

export function withProviders<P extends DefaultTestProvidersProps = DefaultTestProvidersProps>(
  wrapperProps: WrapperProps<P> = {}
) {
  return (StoryComponent: Story) => {
    const { wrapper: WrapperComponent } = getWrapper(DefaultTestProviders, wrapperProps);

    return (
      <WrapperComponent
        routerProps={wrapperProps.routerProps}
        intlMessages={wrapperProps.intlMessages}
        intlLocale={wrapperProps.intlLocale}
      >
        <StoryComponent />
      </WrapperComponent>
    );
  };
}
