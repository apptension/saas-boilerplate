import { useQueryLoader } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { demoItemsAllQuery } from './__generated__/demoItemsAllQuery.graphql';

export const useDemoItemsAllQuery = () =>
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
