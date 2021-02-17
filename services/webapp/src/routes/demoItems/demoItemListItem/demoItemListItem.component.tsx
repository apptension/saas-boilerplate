import React from 'react';

import { generatePath, Link } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { ROUTES } from '../../app.constants';
import { useLocale } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { Checkbox } from '../../../shared/components/checkbox';
import { useFavoriteDemoItem } from '../../../shared/hooks/useFavoriteDemoItem';
import { Container } from './demoItemListItem.styles';

export interface DemoItemListItemProps {
  id: string;
  title?: string;
}

export const DemoItemListItem = ({ id, title }: DemoItemListItemProps) => {
  const locale = useLocale();
  const intl = useIntl();
  const { setFavorite, isFavorite } = useFavoriteDemoItem(id);

  return (
    <Container>
      <Link to={`/${locale}${generatePath(ROUTES.demoItem, { id })}`}>{title}</Link>
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
