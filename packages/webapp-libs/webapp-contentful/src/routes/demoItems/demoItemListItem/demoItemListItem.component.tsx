import { DemoItemListItemFragmentFragment } from '@sb/webapp-api-client/graphql';
import { Button, Link } from '@sb/webapp-core/components/buttons';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { cn } from '@sb/webapp-core/lib/utils';
import { useToast } from '@sb/webapp-core/toast';
import { Loader2, Star } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';

import { RoutesConfig } from '../../../config/routes';
import { ResizingBehavior, imageProps } from '../../../helpers';
import { useFavoriteDemoItem } from '../../../hooks';

export type DemoItemListItemProps = {
  id: string;
  item: DemoItemListItemFragmentFragment;
};

export const DemoItemListItem = ({ id, item }: DemoItemListItemProps) => {
  const intl = useIntl();
  const { toast } = useToast();

  const { setFavorite, isFavorite, isLoading } = useFavoriteDemoItem(id);

  const generateLocalePath = useGenerateLocalePath();

  const { alt, src } = imageProps(item?.image, {
    size: { width: 50, height: 50 },
    resizingBehavior: ResizingBehavior.PAD,
  });

  const handleFavoriteClick = async () => {
    try {
      await setFavorite(!isFavorite);
    } catch {
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Failed to update favorite. Please check your backend configuration and try again.',
          id: 'Demo Item / Favorite error',
        }),
        variant: 'destructive',
      });
    }
  };

  return (
    <li className="group">
      <div className="flex items-center justify-between w-full p-4 transition-colors hover:bg-muted/50">
        <Link
          className="flex items-center gap-4 flex-1 min-w-0 hover:no-underline"
          to={generateLocalePath(RoutesConfig.demoItem, { id })}
        >
          {src && (
            <div className="flex-shrink-0 bg-muted p-2 rounded-md">
              <img
                className="object-cover rounded h-10 w-10"
                alt={alt}
                src={src}
                role="presentation"
              />
            </div>
          )}
          <p className="text-base font-medium text-foreground transition-colors group-hover:text-primary overflow-hidden whitespace-nowrap text-ellipsis">
            {item.title}
          </p>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          role="checkbox"
          aria-checked={isFavorite}
          aria-label={intl.formatMessage({
            defaultMessage: 'Is favorite',
            id: 'Demo Item / Is favorite',
          })}
          className={cn(
            'ml-4 flex-shrink-0 transition-colors',
            isFavorite && 'text-yellow-500 hover:text-yellow-600'
          )}
          disabled={isLoading}
          onClick={(e) => {
            e.preventDefault();
            handleFavoriteClick();
          }}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Star
              className={cn(
                'h-5 w-5 transition-all',
                isFavorite ? 'fill-current' : 'fill-none'
              )}
            />
          )}
        </Button>
      </div>
    </li>
  );
};
