import { DemoItemQueryQuery } from '@sb/webapp-api-client/graphql';
import { BackButton } from '@sb/webapp-core/components/buttons';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router';

import { RoutesConfig } from '../../config/routes';
import { imageProps } from '../../helpers/image';
import { Container, Description, Image, Title } from './demoItem.styles';
import { demoItemFactory } from '@sb/webapp-contentful/tests/factories';

type DemoItemContentProps = {
  // data: DemoItemQueryQuery;
  routesConfig: {
    notFound: string;
  };
};

export const DemoItemContent: FC<DemoItemContentProps> = ({ routesConfig }) => {
  // const item = data.demoItem;

  const item = demoItemFactory({
    image: {
      url: 'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/315.jpg',
    },
  });
  const generateLocalePath = useGenerateLocalePath();
  const navigate = useNavigate();

  useEffect(() => {
    if (!item) {
      navigate(generateLocalePath(routesConfig.notFound));
    }
  }, [routesConfig.notFound, generateLocalePath, navigate, item]);

  return (
    <div className="flex flex-col items-start">
      <BackButton to={generateLocalePath(RoutesConfig.demoItems)} />
      <Title>{item?.title}</Title>
      <Description>{item?.description}</Description>
      {item?.image && <Image {...imageProps(item.image)} />}
    </div>
  );
};
