import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { PreloadedQuery, usePreloadedQuery } from 'react-relay';

import { Routes } from '../../app/config/routes';
import { imageProps } from '../../shared/services/contentful';
import { BackButton } from '../../shared/components/backButton';
import { useGenerateLocalePath } from '../../shared/hooks/localePaths';
import demoItemQueryNode, { demoItemQuery } from '../../__generated__/demoItemQuery.graphql';
import { Container, Description, Image, Title } from './demoItem.styles';

type DemoItemContentProps = {
  itemQueryRef: PreloadedQuery<demoItemQuery>;
};

export const DemoItemContent: FC<DemoItemContentProps> = ({ itemQueryRef }) => {
  const { demoItem: item } = usePreloadedQuery(demoItemQueryNode, itemQueryRef);
  const generateLocalePath = useGenerateLocalePath();
  const navigate = useNavigate();

  useEffect(() => {
    if (!item) {
      navigate(generateLocalePath(Routes.notFound));
    }
  }, [generateLocalePath, navigate, item]);

  return (
    <Container>
      <BackButton to={generateLocalePath(Routes.demoItems)} />
      <Title>{item?.title}</Title>
      <Description>{item?.description}</Description>
      {item?.image && <Image {...imageProps(item.image)} />}
    </Container>
  );
};
