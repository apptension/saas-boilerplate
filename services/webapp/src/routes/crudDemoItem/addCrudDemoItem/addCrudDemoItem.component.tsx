import React from 'react';

import { FormattedMessage } from 'react-intl';
import { CrudDemoItemForm } from '../crudDemoItemForm';
import { useLocaleUrl } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../app.constants';
import { BackButton } from '../../../shared/components/backButton/backButton.component';
import { Container, Header } from './addCrudDemoItem.styles';

export const AddCrudDemoItem = () => {
  const goBackUrl = useLocaleUrl(ROUTES.crudDemoItem.list);

  return (
    <Container>
      <BackButton to={goBackUrl} />
      <Header>
        <FormattedMessage defaultMessage={'Add CRUD Example Item'} description={'AddCrudDemoItem / Header'} />
      </Header>
      <CrudDemoItemForm />
    </Container>
  );
};
