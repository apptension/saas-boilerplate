import React from 'react';
import { PreloadedQuery, usePreloadedQuery } from 'react-relay';
import CrudDemoItemDetailsQuery, {
  crudDemoItemDetailsQuery,
} from '../../../__generated__/crudDemoItemDetailsQuery.graphql';
import { BackButton } from '../../../shared/components/backButton/backButton.component';
import { useGenerateLocalePath } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../app.constants';
import { Container, Header } from './crudDemoItemDetails.styles';

type CrudDemoItemDetailsContentProps = {
  queryRef: PreloadedQuery<crudDemoItemDetailsQuery>;
};

export const CrudDemoItemDetailsContent = ({ queryRef }: CrudDemoItemDetailsContentProps) => {
  const data = usePreloadedQuery(CrudDemoItemDetailsQuery, queryRef);

  const itemData = data?.crudDemoItem;
  const generateLocalePath = useGenerateLocalePath();

  return (
    <Container>
      <BackButton to={generateLocalePath(ROUTES.crudDemoItem.list)} />
      <Header>{itemData?.name}</Header>
    </Container>
  );
};
