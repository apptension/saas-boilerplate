import * as faker from 'faker';
import { mergeDeepRight } from 'ramda';
import { ContentfulDemoItem } from '../../shared/services/contentful';
import { Factory } from './types';
import { contentfulSysFactory } from './helpers';

export const demoItemFactory: Factory<ContentfulDemoItem> = (overrides = {}) =>
  mergeDeepRight(
    {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      sys: contentfulSysFactory(),
      image: {
        sys: contentfulSysFactory(),
        title: faker.lorem.sentence(),
        url: faker.internet.url(),
      },
    },
    overrides
  );
