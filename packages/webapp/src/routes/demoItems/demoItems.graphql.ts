import { useQueryLoader } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { demoItemsAllQuery } from './__generated__/demoItemsAllQuery.graphql';

export const useDemoItemsAllQuery = () =>
  // todo: pass context: { schemaType = SchemaType.Contentful } when use Apollo client
  useQueryLoader<demoItemsAllQuery>(graphql`
    query demoItemsAllQuery {
      demoItemCollection {
        items {
          sys {
            id
          }
          ...demoItemListItem_item
        }
      }
    }
  `);
