import { DemoItemQueryQuery } from '@sb/webapp-api-client/graphql';
import { BackButton } from '@sb/webapp-core/components/buttons';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router';

import { RoutesConfig } from '../../config/routes';
import { imageProps } from '../../helpers/image';
import { Container, Description, Image, Title } from './demoItem.styles';

type DemoItemContentProps = {
  data: DemoItemQueryQuery;
  routesConfig: {
    notFound: string;
  };
};

export const DemoItemContent: FC<DemoItemContentProps> = ({ data, routesConfig }) => {
  const item = data.demoItem;

  const generateLocalePath = useGenerateLocalePath();
  const navigate = useNavigate();

  useEffect(() => {
    if (!item) {
      navigate(generateLocalePath(routesConfig.notFound));
    }
  }, [routesConfig.notFound, generateLocalePath, navigate, item]);

  return (
    <Container>
      <BackButton to={generateLocalePath(RoutesConfig.demoItems)} />
      <Title>{item?.title}</Title>
      <Description>{item?.description}</Description>
      {item?.image && <Image {...imageProps(item.image)} />}
    </Container>
  );
};
