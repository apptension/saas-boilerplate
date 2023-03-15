import { imageProps } from '@sb/webapp-api-client/contentful';
import { DemoItemQueryQuery } from '@sb/webapp-api-client/graphql';
import { BackButton } from '@sb/webapp-core/components/buttons';
import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router';

import { RoutesConfig } from '../../app/config/routes';
import { useGenerateLocalePath } from '../../shared/hooks';
import { Container, Description, Image, Title } from './demoItem.styles';

type DemoItemContentProps = {
  data: DemoItemQueryQuery;
};

export const DemoItemContent: FC<DemoItemContentProps> = ({ data }) => {
  const item = data.demoItem;

  const generateLocalePath = useGenerateLocalePath();
  const navigate = useNavigate();

  useEffect(() => {
    if (!item) {
      navigate(generateLocalePath(RoutesConfig.notFound));
    }
  }, [generateLocalePath, navigate, item]);

  return (
    <Container>
      <BackButton to={generateLocalePath(RoutesConfig.demoItems)} />
      <Title>{item?.title}</Title>
      <Description>{item?.description}</Description>
      {item?.image && <Image {...imageProps(item.image)} />}
    </Container>
  );
};
