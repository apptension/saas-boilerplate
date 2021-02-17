import React from 'react';

import { useParams } from 'react-router';
import { CrudDemoItemForm } from '../crudDemoItemForm';
import { useCrudDemoItem } from '../useCrudDemoItem';
import { Container } from './editCrudDemoItem.styles';

export const EditCrudDemoItem = () => {
  const { id } = useParams<{ id: string }>();
  const itemData = useCrudDemoItem(id);

  return (
    <Container>
      <CrudDemoItemForm data={itemData} />
    </Container>
  );
};
