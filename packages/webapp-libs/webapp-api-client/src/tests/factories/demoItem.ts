import { ContentfulDemoItem } from '../../contentful';
import { ContentfulDemoItemFavoriteType } from '../../graphql';
import { createDeepFactory, makeId } from '../utils';
import { contentfulSysFactory } from './helpers';

export const demoItemFactory = createDeepFactory<ContentfulDemoItem>(() => ({
  title: 'Demo item mock title',
  description: 'Demo item mock description',
  sys: contentfulSysFactory(),
  image: {
    sys: contentfulSysFactory(),
    title: 'Image title mock',
    description: '',
    url: `http://localhost/image/${makeId(32)}.png`,
    contentfulMetadata: { tags: [] },
  },
  contentfulMetadata: { tags: [] },
}));

export const contentfulDemoItemFavoriteFactory = createDeepFactory<Partial<ContentfulDemoItemFavoriteType>>(() => ({
  item: {
    contentfuldemoitemfavoriteSet: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
    },
    id: makeId(32),
    isPublished: false,
    fields: '',
  },
}));
