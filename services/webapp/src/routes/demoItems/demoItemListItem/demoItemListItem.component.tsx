import React from 'react';
import { useIntl } from 'react-intl';
import favoriteIconFilled from '@iconify-icons/ion/star';
import favoriteIconOutlined from '@iconify-icons/ion/star-outline';
import { ROUTES } from '../../app.constants';
import { useGenerateLocalePath } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { useFavoriteDemoItem } from '../../../shared/hooks/useFavoriteDemoItem';
import { imageProps } from '../../../shared/services/contentful';
import { Icon } from '../../../shared/components/icon';
import { Container, FavoriteIcon, Link, Thumbnail, Title } from './demoItemListItem.styles';

export type DemoItemListItemProps = {
  id: string;
  item: {
    title?: string;
    image?: {
      title?: string;
      url?: string;
    };
  };
};

export const DemoItemListItem = ({ id, item }: DemoItemListItemProps) => {
  const intl = useIntl();
  const { setFavorite, isFavorite } = useFavoriteDemoItem(id);
  const generateLocalePath = useGenerateLocalePath();

  return (
    <Container>
      <Link to={generateLocalePath(ROUTES.demoItem, { id })}>
        <FavoriteIcon
          role={'checkbox'}
          aria-checked={isFavorite}
          aria-label={intl.formatMessage({
            defaultMessage: 'Is favorite',
            description: 'Demo Item / Is favorite',
          })}
          onClick={(e) => {
            e.preventDefault();
            setFavorite(!isFavorite);
          }}
        >
          <Icon icon={isFavorite ? favoriteIconFilled : favoriteIconOutlined} />
        </FavoriteIcon>

        {item.image && <Thumbnail {...imageProps(item.image, { size: { height: 50 } })} role="presentation" />}
        <Title>{item.title}</Title>
      </Link>
    </Container>
  );
};
