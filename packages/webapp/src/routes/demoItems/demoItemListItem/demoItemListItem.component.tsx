import favoriteIconFilled from '@iconify-icons/ion/star';
import favoriteIconOutlined from '@iconify-icons/ion/star-outline';
import { useIntl } from 'react-intl';

import { RoutesConfig } from '../../../app/config/routes';
import { Icon } from '../../../shared/components/icon';
import { useGenerateLocalePath } from '../../../shared/hooks/localePaths';
import { useFavoriteDemoItem } from '../../../shared/hooks/useFavoriteDemoItem';
import { imageProps } from '../../../shared/services/contentful';
import { DemoItemListItem_ItemFragment } from '../../../shared/services/graphqlApi/__generated/gql/graphql';
import { Container, FavoriteIcon, Link, Thumbnail, Title } from './demoItemListItem.styles';

export type DemoItemListItemProps = {
  id: string;
  item: DemoItemListItem_ItemFragment;
};

export const DemoItemListItem = ({ id, item }: DemoItemListItemProps) => {
  const intl = useIntl();
  const { setFavorite, isFavorite } = useFavoriteDemoItem(id);
  const generateLocalePath = useGenerateLocalePath();

  return (
    <Container>
      <Link to={generateLocalePath(RoutesConfig.demoItem, { id })}>
        <FavoriteIcon
          role="checkbox"
          aria-checked={isFavorite}
          aria-label={intl.formatMessage({
            defaultMessage: 'Is favorite',
            id: 'Demo Item / Is favorite',
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
