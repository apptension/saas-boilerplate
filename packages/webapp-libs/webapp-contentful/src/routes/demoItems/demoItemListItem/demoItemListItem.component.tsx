import { DemoItemListItemFragmentFragment } from '@sb/webapp-api-client/graphql';
import { Button, Link } from '@sb/webapp-core/components/buttons';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { cn } from '@sb/webapp-core/lib/utils';
import { Star } from 'lucide-react';
import { useIntl } from 'react-intl';

import { RoutesConfig } from '../../../config/routes';
import { ResizingBehavior, imageProps } from '../../../helpers';
import { useFavoriteDemoItem } from '../../../hooks';

export type DemoItemListItemProps = {
  id: string;
  item: DemoItemListItemFragmentFragment;
};

export const DemoItemListItem = ({ id, item }: DemoItemListItemProps) => {
  const intl = useIntl();

  const { setFavorite, isFavorite } = useFavoriteDemoItem(id);

  const generateLocalePath = useGenerateLocalePath();

  const { alt, src } = imageProps(item?.image, {
    size: { width: 50, height: 50 },
    resizingBehavior: ResizingBehavior.PAD,
  });
  return (
    <li className="flex items-center p-2">
      <Link
        className="p-8 min-w-0 w-[100%] justify-start hover:no-underline"
        to={generateLocalePath(RoutesConfig.demoItem, { id })}
      >
        {src && (
          <div className="bg-black p-2 inline-block rounded-md">
            <img className="object-cover rounded h-12" alt={alt} src={src} role="presentation" />
          </div>
        )}
        <p className="text-lg text-muted-foreground px-4 overflow-hidden whitespace-nowrap text-ellipsis">
          {item.title}
        </p>
      </Link>

      <Button
        variant="ghost"
        role="checkbox"
        aria-checked={isFavorite}
        aria-label={intl.formatMessage({
          defaultMessage: 'Is favorite',
          id: 'Demo Item / Is favorite',
        })}
        className="mr-2"
        onClick={(e) => {
          setFavorite(!isFavorite);
        }}
      >
        <Star
          className={cn({
            'fill-none text-slate-700 dark:fill-none': !isFavorite,
            'fill-slate-700 dark:fill-slate-400 dark:text-slate-400': isFavorite,
          })}
        />
      </Button>
    </li>
  );
};
