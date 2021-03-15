import React from 'react';

import { useParams } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { CrudDemoItemForm } from '../crudDemoItemForm';
import { useCrudDemoItem } from '../useCrudDemoItem';
import { useLocaleUrl } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../app.constants';
import { BackButton } from '../../../shared/components/backButton/backButton.component';
import { Container, Header } from './editCrudDemoItem.styles';

export const EditCrudDemoItem = () => {
  const { id } = useParams<{ id: string }>();
  const itemData = useCrudDemoItem(id);
  const goBackUrl = useLocaleUrl(ROUTES.crudDemoItem.list);

  return (
    <Container>
      <BackButton to={goBackUrl} />
      <Header>
        <FormattedMessage defaultMessage={'Edit CRUD Example Item'} description={'EditCrudDemoItem / Header'} />
      </Header>
      <CrudDemoItemForm data={itemData} />
    </Container>
  );
};
