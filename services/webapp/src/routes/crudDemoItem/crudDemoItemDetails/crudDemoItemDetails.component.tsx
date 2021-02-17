import React from 'react';

import { useParams } from 'react-router';
import { useCrudDemoItem } from '../useCrudDemoItem';
import { H1 } from '../../../theme/typography';
import { Container } from './crudDemoItemDetails.styles';

export const CrudDemoItemDetails = () => {
  const { id } = useParams<{ id: string }>();
  const itemData = useCrudDemoItem(id);

  return (
    <Container>
      <H1>
        [{itemData?.id}] {itemData?.name}
      </H1>
    </Container>
  );
};
