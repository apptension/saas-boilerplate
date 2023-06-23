import { ApiTestProviders } from '@sb/webapp-api-client/tests/utils/rendering';
import { StoryFn } from '@storybook/react';

import { WrapperProps, getWrapper } from '../../tests/utils/rendering';

/**
 * [Storybook decorator](https://storybook.js.org/docs/react/writing-stories/decorators) to be used in `webapp` package
 * stories. It wraps the story with all needed providers and allows to pass state to it.
 * @param wrapperProps
 * @category utils
 *
 * @example Basic usage:
 * ```tsx title="example.stories.tsx" showLineNumbers
 * export default {
 *   title: 'ExampleComponent',
 *   component: ExampleComponent,
 *   decorators: [
 *     withProviders(),
 *   ],
 * };
 * ```
 *
 * @example Override user profile:
 * ```tsx title="example.stories.tsx" showLineNumbers
 * import { CurrentUserType } from '@sb/webapp-api-client/graphql';
 * import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
 * import { ExampleComponent, ExampleComponentProps } from './example.component';
 *
 * type StoryArgsType = ExampleComponentProps & { profile: CurrentUserType };
 *
 * const Template: StoryFn<StoryArgsType> = ({ profile, ...args }: StoryArgsType) => {
 *   return <ExampleComponent {...args} />;
 * };
 *
 * export default {
 *   title: 'ExampleComponent',
 *   component: ExampleComponent,
 *   decorators: [
 *     withProviders({
 *       apolloMocks: (defaultMocks, { args: { profile } }: any) => {
 *         return [fillCommonQueryWithUser(profile)];
 *       },
 *     }),
 *   ],
 * };
 *
 * export const Default = {
 *   render: Template,
 *   args: { profile: currentUserFactory({ firstName: 'First name' }) },
 * };
 * ```
 *
 */
export function withProviders(wrapperProps: WrapperProps = {}) {
  return (StoryComponent: StoryFn, storyContext: any) => {
    const { wrapper: WrapperComponent } = getWrapper(ApiTestProviders, wrapperProps, storyContext) as any;

    return (
      <WrapperComponent {...wrapperProps}>
        <StoryComponent />
      </WrapperComponent>
    );
  };
}
