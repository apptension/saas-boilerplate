import React from 'react';

import { generatePath, Link } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { ROUTES } from '../../app.constants';
import { useLocale } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { Checkbox } from '../../../shared/components/checkbox';
import { useFavoriteDemoItem } from '../../../shared/hooks/useFavoriteDemoItem';
import { imageProps } from '../../../shared/services/contentful';
import { Container, Thumbnail } from './demoItemListItem.styles';

export interface DemoItemListItemProps {
  id: string;
  item: {
    title?: string;
    image?: {
      title?: string;
      url?: string;
    };
  };
}

export const DemoItemListItem = ({ id, item }: DemoItemListItemProps) => {
  const locale = useLocale();
  const intl = useIntl();
  const { setFavorite, isFavorite } = useFavoriteDemoItem(id);

  return (
    <Container>
      <Link to={`/${locale}${generatePath(ROUTES.demoItem, { id })}`}>
        {item.title}
        {item.image && <Thumbnail {...imageProps(item.image, { size: { height: 50 } })} role="presentation" />}
      </Link>
      <Checkbox
        aria-label={intl.formatMessage({
          defaultMessage: 'Is favorite',
          description: 'Demo Item / Is favorite',
        })}
        checked={isFavorite}
        onChange={(e) => setFavorite(e.target.checked)}
      />
    </Container>
  );
};
