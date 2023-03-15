import { DocumentDemoItemType } from '../../graphql';
import { createDeepFactory, makeId } from '../utils';

export const documentFactory = createDeepFactory<Partial<DocumentDemoItemType>>(() => ({
  id: makeId(32),
  createdAt: new Date().toISOString(),
  file: {
    name: `${makeId(32)}.png`,
    url: `http://localhost/image/${makeId(32)}.pdf`,
  },
}));
