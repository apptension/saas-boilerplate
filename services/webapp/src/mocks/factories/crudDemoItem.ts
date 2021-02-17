import * as faker from 'faker';
import { mergeDeepRight } from 'ramda';
import { CrudDemoItem } from '../../shared/services/api/crudDemoItem/types';
import { Factory } from './types';

export const crudDemoItemFactory: Factory<CrudDemoItem> = (overrides = {}) =>
  mergeDeepRight(
    {
      id: faker.random.uuid(),
      name: faker.lorem.word(),
    },
    overrides
  );
