import { Suspense, useEffect } from 'react';
import graphql from 'babel-plugin-relay/macro';
import { useParams } from 'react-router';
import { useQueryLoader } from 'react-relay';
import { editCrudDemoItemQuery } from './__generated__/editCrudDemoItemQuery.graphql';
import { EditCrudDemoItemContent } from './editCrudDemoItemContent.component';

export const EditCrudDemoItem = () => {
  type Params = { id: string };
  const { id } = useParams<Params>() as Params;
  const [editCrudDemoItemQueryRef, loadEditCrudDemoItemQuery] = useQueryLoader<editCrudDemoItemQuery>(
    graphql`
      query editCrudDemoItemQuery($id: ID!) {
        crudDemoItem(id: $id) {
          id
          name
        }
      }
    `
  );

  useEffect(() => {
    loadEditCrudDemoItemQuery({ id });
  }, [loadEditCrudDemoItemQuery, id]);

  if (!editCrudDemoItemQueryRef) {
    return null;
  }

  return (
    <Suspense fallback={<span>Loading ...</span>}>
      <EditCrudDemoItemContent queryRef={editCrudDemoItemQueryRef} />
    </Suspense>
  );
};
