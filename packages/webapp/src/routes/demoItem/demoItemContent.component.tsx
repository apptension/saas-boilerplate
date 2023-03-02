import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router';

import { RoutesConfig } from '../../app/config/routes';
import { BackButton } from '../../shared/components/backButton';
import { useGenerateLocalePath } from '../../shared/hooks';
import { imageProps } from '../../shared/services/contentful';
import { DemoItemQueryQuery } from '../../shared/services/graphqlApi/__generated/gql/graphql';
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
