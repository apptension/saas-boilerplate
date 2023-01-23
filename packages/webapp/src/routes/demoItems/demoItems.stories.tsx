import { Story } from '@storybook/react';
import { RelayMockEnvironment } from 'relay-test-utils';

import {
  contentfulDemoItemFavoriteFactory,
  demoItemFactory,
  fillDemoItemsAllQuery,
  fillUseFavouriteDemoItemListQuery,
} from '../../mocks/factories';
import { withProviders } from '../../shared/utils/storybook';
import { fillCommonQueryWithUser } from '../../shared/utils/commonQuery';
import { DemoItems } from './demoItems.component';

const data = { items: [demoItemFactory(), demoItemFactory(), demoItemFactory()] };

const relayEnvironment = (env: RelayMockEnvironment, { args: { hasFavourite = false } }: any) => {
  fillCommonQueryWithUser(env);
  fillDemoItemsAllQuery(env, data);
  fillUseFavouriteDemoItemListQuery(
    env,
    hasFavourite ? contentfulDemoItemFavoriteFactory({ item: { pk: data.items[0].sys.id } }) : undefined
  );
};

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
    relayEnvironment,
  }),
];

export const WithFavorited = Template.bind({});
WithFavorited.args = { hasFavourite: true };
WithFavorited.decorators = [
  withProviders({
    relayEnvironment,
  }),
];
