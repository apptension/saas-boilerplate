import React, { useEffect } from 'react';

import { useHistory, useParams } from 'react-router';
import { useDemoItemQuery } from '../../shared/services/contentful/__generated/hooks';
import { ROUTES } from '../app.constants';
import { useLocaleUrl } from '../useLanguageFromParams/useLanguageFromParams.hook';
import { imageProps } from '../../shared/services/contentful';
import { Container } from './demoItem.styles';

export const DemoItem = () => {
  const { id } = useParams<{ id: string }>();
  const { data, loading } = useDemoItemQuery({ variables: { itemId: id } });
  const item = data?.demoItem;
  const fallbackUrl = useLocaleUrl(ROUTES.notFound);
  const history = useHistory();

  useEffect(() => {
    if (!loading && !item) {
      history.push(fallbackUrl);
    }
  }, [loading, fallbackUrl, history, item]);

  return (
    <Container>
      <h1>{item?.title}</h1>
      <h1>{item?.description}</h1>
      {item?.image && <img {...imageProps(item.image)} />}
    </Container>
  );
};
