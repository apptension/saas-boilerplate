import { MockedResponse } from '@apollo/client/testing';
import { GraphQLError } from 'graphql';
import { Meta, StoryFn, StoryObj } from '@storybook/react';

import {
  contentfulDemoItemFavoriteFactory,
  demoItemFactory,
  fillDemoItemsAllQuery,
  fillUseFavouriteDemoItemListQuery,
} from '../../tests/factories';
import { withProviders } from '../../utils/storybook';
import { demoItemsAllQuery } from './demoItems.graphql';
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

export const Empty: StoryObj<typeof meta> = {
  render: Template,

  decorators: [
    withProviders({
      apolloMocks: (defaultMocks) =>
        defaultMocks.concat([fillDemoItemsAllQuery([]), fillUseFavouriteDemoItemListQuery([])]),
    }),
  ],
};

const networkErrorMock: MockedResponse = {
  request: {
    query: demoItemsAllQuery,
  },
  error: new Error('Failed to fetch'),
  variableMatcher: () => true,
};

export const NotConfigured: StoryObj<typeof meta> = {
  render: Template,

  decorators: [
    withProviders({
      apolloMocks: (defaultMocks) => defaultMocks.concat([networkErrorMock, fillUseFavouriteDemoItemListQuery([])]),
    }),
  ],
};

const graphqlErrorMock: MockedResponse = {
  request: {
    query: demoItemsAllQuery,
  },
  result: {
    errors: [new GraphQLError('Access token invalid')],
  },
  variableMatcher: () => true,
};

export const WithError: StoryObj<typeof meta> = {
  render: Template,

  decorators: [
    withProviders({
      apolloMocks: (defaultMocks) => defaultMocks.concat([graphqlErrorMock, fillUseFavouriteDemoItemListQuery([])]),
    }),
  ],
};
