import React from 'react';

import { generatePath, Link } from 'react-router-dom';
import { ROUTES } from '../app.constants';
import { useLocale } from '../useLanguageFromParams/useLanguageFromParams.hook';
import { useAllDemoItemsQuery } from '../../shared/services/contentful/__generated/hooks';
import { Container } from './demoItems.styles';

export const DemoItems = () => {
  const locale = useLocale();
  const { data } = useAllDemoItemsQuery();
  const items = data?.demoItemCollection?.items;

  const renderItemLink = (item: NonNullable<NonNullable<typeof items>[number]>) => {
    const id = item.sys.id;
    return (
      <Link key={id} to={`/${locale}${generatePath(ROUTES.demoItem, { id })}`}>
        {item.title}
      </Link>
    );
  };

  return (
    <Container>
      {items?.map((demoItem) => {
        return demoItem ? renderItemLink(demoItem) : null;
      })}
    </Container>
  );
};
