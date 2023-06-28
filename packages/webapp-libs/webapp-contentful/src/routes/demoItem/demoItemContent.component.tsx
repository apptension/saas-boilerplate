import { DemoItemQueryQuery } from '@sb/webapp-api-client/graphql';
import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router';

import { imageProps } from '../../helpers/image';

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
    <PageLayout>
      <PageHeadline hasBackButton header={item?.title} />
      {item?.image && (
        <div className="bg-black p-2 inline-block rounded-md">
          <img className="max-w-[100%] object-cover" {...imageProps(item.image)} />
        </div>
      )}
      <p className="text-base whitespace-pre-wrap">{item?.description}</p>
    </PageLayout>
  );
};
