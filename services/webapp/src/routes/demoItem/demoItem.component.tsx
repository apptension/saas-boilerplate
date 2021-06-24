import React, { useEffect } from 'react';
import { useHistory, useParams } from 'react-router';
import { useDemoItemQuery } from '../../shared/services/contentful/__generated/hooks';
import { ROUTES } from '../app.constants';
import { useGenerateLocalePath } from '../useLanguageFromParams/useLanguageFromParams.hook';
import { imageProps } from '../../shared/services/contentful';
import { BackButton } from '../../shared/components/backButton/backButton.component';
import { Container, Description, Image, Title } from './demoItem.styles';

export const DemoItem = () => {
  const { id } = useParams<{ id: string }>();
  const { data, loading } = useDemoItemQuery({ variables: { itemId: id } });
  const item = data?.demoItem;
  const generateLocalePath = useGenerateLocalePath();
  const history = useHistory();

  useEffect(() => {
    if (!loading && !item) {
      history.push(generateLocalePath(ROUTES.notFound));
    }
  }, [loading, generateLocalePath, history, item]);

  return (
    <Container>
      <BackButton to={generateLocalePath(ROUTES.demoItems)} />
      <Title>{item?.title}</Title>
      <Description>{item?.description}</Description>
      {item?.image && <Image {...imageProps(item.image)} />}
    </Container>
  );
};
