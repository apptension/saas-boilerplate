import { contentfulDemoItemFavoriteFactory, demoItemFactory } from '@sb/webapp-api-client/tests/factories';
import { Story } from '@storybook/react';

import { fillDemoItemsAllQuery, fillUseFavouriteDemoItemListQuery } from '../../tests/factories';
import { withProviders } from '../../shared/utils/storybook';
import { DemoItems } from './demoItems.component';

const data = [demoItemFactory(), demoItemFactory(), demoItemFactory()];

const Template: Story = ({ hasFavourite = false, ...args }) => {
  return <DemoItems {...args} />;
};

export default {
  title: 'ContentfulDemo / DemoItems',
  component: DemoItems,
};

export const Default = Template.bind({});
Default.decorators = [
  withProviders({
    apolloMocks: (defaultMocks, { args: { hasFavourite = false } }: any) =>
      defaultMocks.concat([
        fillDemoItemsAllQuery(data),
        fillUseFavouriteDemoItemListQuery(
          hasFavourite
            ? [
                contentfulDemoItemFavoriteFactory({
                  item: { pk: data[0].sys.id },
                  __typename: 'ContentfulDemoItemFavoriteType',
                }),
              ]
            : []
        ),
      ]),
  }),
];

export const WithFavorited = Template.bind({});
WithFavorited.args = { hasFavourite: true };
WithFavorited.decorators = [
  withProviders({
    apolloMocks: (defaultMocks, { args: { hasFavourite = true } }: any) =>
      defaultMocks.concat([
        fillDemoItemsAllQuery(data),
        fillUseFavouriteDemoItemListQuery(
          hasFavourite
            ? [
                contentfulDemoItemFavoriteFactory({
                  item: { pk: data[0].sys.id },
                  __typename: 'ContentfulDemoItemFavoriteType',
                }),
              ]
            : []
        ),
      ]),
  }),
];
