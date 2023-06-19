import favoriteIconFilled from '@iconify-icons/ion/star';
import favoriteIconOutlined from '@iconify-icons/ion/star-outline';
import { DemoItemListItemFragmentFragment } from '@sb/webapp-api-client/graphql';
import { Button, Link } from '@sb/webapp-core/components/buttons';
import { Icon } from '@sb/webapp-core/components/icons';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { useIntl } from 'react-intl';

import { RoutesConfig } from '../../../config/routes';
import { imageProps } from '../../../helpers';
import { useFavoriteDemoItem } from '../../../hooks';
import { Container, FavoriteIcon, Thumbnail, Title } from './demoItemListItem.styles';

export type DemoItemListItemProps = {
  id: string;
  item: DemoItemListItemFragmentFragment;
};

export const DemoItemListItem = ({ id, item }: DemoItemListItemProps) => {
  const intl = useIntl();
  const { setFavorite, isFavorite } = useFavoriteDemoItem(id);
  const generateLocalePath = useGenerateLocalePath();
  //   export const FavoriteIcon = styled.button`
  //   padding: 0;
  //   margin: 0;
  //   line-height: 0;
  //   background: none;
  //   border: none;
  //   color: ${color.skyBlueScale.get(50)};
  //   cursor: pointer;

  //   &:focus {
  //     ${border.outline};
  //   }
  // `;

  return (
    <li className="flex items-center w-[100%]">
      <Button
        variant="ghost"
        role="checkbox"
        aria-checked={isFavorite}
        aria-label={intl.formatMessage({
          defaultMessage: 'Is favorite',
          id: 'Demo Item / Is favorite',
        })}
        onClick={(e) => {
          setFavorite(!isFavorite);
        }}
      >
        <Icon icon={isFavorite ? favoriteIconFilled : favoriteIconOutlined} />
      </Button>
      <Link
        className="p-8 w-[100%] justify-start hover:no-underline"
        to={generateLocalePath(RoutesConfig.demoItem, { id })}
      >
        {item.image && <Thumbnail {...imageProps(item.image, { size: { height: 50 } })} role="presentation" />}
        <p>{item.title}</p>
      </Link>
    </li>
  );
};
