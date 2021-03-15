import React from 'react';

import { useParams } from 'react-router';
import { useCrudDemoItem } from '../useCrudDemoItem';
import { BackButton } from '../../../shared/components/backButton/backButton.component';
import { useLocaleUrl } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../app.constants';
import { Container, Header } from './crudDemoItemDetails.styles';

export const CrudDemoItemDetails = () => {
  const { id } = useParams<{ id: string }>();
  const itemData = useCrudDemoItem(id);
  const goBackUrl = useLocaleUrl(ROUTES.crudDemoItem.list);

  return (
    <Container>
      <BackButton to={goBackUrl} />
      <Header>{itemData?.name}</Header>
    </Container>
  );
};
