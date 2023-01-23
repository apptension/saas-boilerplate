import { useQueryLoader } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { demoItemQuery } from './__generated__/demoItemQuery.graphql';

export const useDemoItemQuery = () => {
  return useQueryLoader<demoItemQuery>(graphql`
    query demoItemQuery($id: String!) {
      demoItem(id: $id) {
        title
        description
        image {
          url
          title
          description
        }
      }
    }
  `);
};
