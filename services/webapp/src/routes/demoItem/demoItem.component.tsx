import React, { useEffect } from 'react';

import { useHistory, useParams } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { useDemoItemQuery } from '../../shared/services/contentful/__generated/hooks';
import { ROUTES } from '../app.constants';
import { useLocaleUrl } from '../useLanguageFromParams/useLanguageFromParams.hook';
import { imageProps } from '../../shared/services/contentful';
import { BackButton } from '../../shared/components/backButton/backButton.component';
import { Container, Image, Description, Title } from './demoItem.styles';

export const DemoItem = () => {
  const { id } = useParams<{ id: string }>();
  const { data, loading } = useDemoItemQuery({ variables: { itemId: id } });
  const item = data?.demoItem;
  const goBackUrl = useLocaleUrl(ROUTES.demoItems);
  const fallbackUrl = useLocaleUrl(ROUTES.notFound);
  const history = useHistory();

  useEffect(() => {
    if (!loading && !item) {
      history.push(fallbackUrl);
    }
  }, [loading, fallbackUrl, history, item]);

  return (
    <Container>
      <BackButton to={goBackUrl} />
      <Title>{item?.title}</Title>
      <Description>{item?.description}</Description>
      {item?.image && <Image {...imageProps(item.image)} />}
    </Container>
  );
};
