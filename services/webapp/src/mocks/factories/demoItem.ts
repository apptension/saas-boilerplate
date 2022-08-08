import { faker } from '@faker-js/faker';
import { ContentfulDemoItem } from '../../shared/services/contentful';
import { createDeepFactory } from './factoryCreators';
import { contentfulSysFactory } from './helpers';

export const demoItemFactory = createDeepFactory<ContentfulDemoItem>(() => ({
  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  sys: contentfulSysFactory(),
  image: {
    sys: contentfulSysFactory(),
    title: faker.lorem.sentence(),
    url: faker.internet.url(),
    contentfulMetadata: { tags: [] },
  },
  contentfulMetadata: { tags: [] },
}));
