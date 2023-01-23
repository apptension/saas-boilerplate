import { PreloadedQuery, usePreloadedQuery } from 'react-relay';
import { BackButton } from '../../../shared/components/backButton';
import { RoutesConfig } from '../../../app/config/routes';
import { useGenerateLocalePath } from '../../../shared/hooks/localePaths';
import CrudDemoItemDetailsQuery, { crudDemoItemDetailsQuery } from './__generated__/crudDemoItemDetailsQuery.graphql';
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
      <BackButton to={generateLocalePath(RoutesConfig.crudDemoItem.list)} />
      <Header>{itemData?.name}</Header>
    </Container>
  );
};
