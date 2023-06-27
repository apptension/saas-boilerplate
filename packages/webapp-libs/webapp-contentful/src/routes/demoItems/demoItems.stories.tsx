import { Meta, StoryFn, StoryObj } from '@storybook/react';

import {
  contentfulDemoItemFavoriteFactory,
  demoItemFactory,
  fillDemoItemsAllQuery,
  fillUseFavouriteDemoItemListQuery,
} from '../../tests/factories';
import { withProviders } from '../../utils/storybook';
import { DemoItems } from './demoItems.component';

const data = [demoItemFactory(), demoItemFactory(), demoItemFactory()];

const Template: StoryFn = ({ hasFavourite = false, ...args }) => {
  return <DemoItems {...args} />;
};

const meta: Meta = {
  title: 'Contentful Demo / DemoItems',
  component: DemoItems,
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: Template,

  decorators: [
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
  ],
};

export const WithFavorited: StoryObj<typeof meta> = {
  render: Template,
  args: { hasFavourite: true },

  decorators: [
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
  ],
};
