import { DemoItemListItemFragmentFragment } from '@sb/webapp-api-client/graphql';
import { Button, Link } from '@sb/webapp-core/components/buttons';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { cn } from '@sb/webapp-core/lib/utils';
import { Star } from 'lucide-react';
import { useIntl } from 'react-intl';

import { RoutesConfig } from '../../../config/routes';
import { imageProps } from '../../../helpers';
import { useFavoriteDemoItem } from '../../../hooks';

export type DemoItemListItemProps = {
  id: string;
  item: DemoItemListItemFragmentFragment;
};

export const DemoItemListItem = ({ id, item }: DemoItemListItemProps) => {
  const intl = useIntl();
  const { setFavorite, isFavorite } = useFavoriteDemoItem(id);
  const generateLocalePath = useGenerateLocalePath();

  return (
    <li className="flex items-center w-[100%]">
      <Link
        className="p-8 w-[100%] justify-start hover:no-underline"
        to={generateLocalePath(RoutesConfig.demoItem, { id })}
      >
        {item.image && (
          <img
            className="object-cover rounded w-16 h-12"
            {...imageProps(item.image, { size: { height: 50 } })}
            role="presentation"
          />
        )}
        <p className="px-4">{item.title}</p>
      </Link>

      <Button
        variant="ghost"
        role="checkbox"
        aria-checked={isFavorite}
        aria-label={intl.formatMessage({
          defaultMessage: 'Is favorite',
          id: 'Demo Item / Is favorite',
        })}
        className="mr-4"
        onClick={(e) => {
          setFavorite(!isFavorite);
        }}
      >
        <Star
          className={cn({
            'fill-none': !isFavorite,
            'text-slate-700': !isFavorite,
            'fill-slate-700': isFavorite,
            'dark:fill-slate-400': isFavorite,
            'dark:text-slate-400': isFavorite,
            'dark:fill-none': !isFavorite,
          })}
        />
      </Button>
    </li>
  );
};
