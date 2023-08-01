import { useMutation } from '@apollo/client';
import editIcon from '@iconify-icons/ion/pencil-sharp';
import deleteIcon from '@iconify-icons/ion/trash-outline';
import { FragmentType, getFragmentData } from '@sb/webapp-api-client/graphql';
import { Button, ButtonVariant, Link } from '@sb/webapp-core/components/buttons';
import { Icon } from '@sb/webapp-core/components/icons';
import { useGenerateLocalePath, useMediaQuery } from '@sb/webapp-core/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { media } from '@sb/webapp-core/theme';
import { useToast } from '@sb/webapp-core/toast';
import { MouseEvent } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { RoutesConfig } from '../../../../config/routes';
import { crudDemoItemListItemDeleteMutation, crudDemoItemListItemFragment } from './crudDemoItemListItem.graphql';
import { CrudDropdownMenu } from './crudDropdownMenu';

export type CrudDemoItemListItemProps = {
  item: FragmentType<typeof crudDemoItemListItemFragment>;
};

export const CrudDemoItemListItem = ({ item }: CrudDemoItemListItemProps) => {
  const generateLocalePath = useGenerateLocalePath();
  const { matches: isDesktop } = useMediaQuery({ above: media.Breakpoint.TABLET });
  const { toast } = useToast();
  const intl = useIntl();

  const successMessage = intl.formatMessage({
    id: 'CrudDemoItem form / Delete CrudDemoItem / Success message',
    defaultMessage: '🎉 Item deleted successfully!',
  });

  const [commitDeleteMutation, { loading }] = useMutation(crudDemoItemListItemDeleteMutation, {
    update(cache, { data }) {
      data?.deleteCrudDemoItem?.deletedIds?.forEach((deletedId) => {
        const normalizedId = cache.identify({ id: deletedId, __typename: 'CrudDemoItemType' });
        cache.evict({ id: normalizedId });
      });
      cache.gc();
    },
    onCompleted: (data) => {
      const ids = data?.deleteCrudDemoItem?.deletedIds;
      trackEvent('crud', 'delete', ids?.join(', '));
      toast({ description: successMessage });
    },
  });

  const data = getFragmentData(crudDemoItemListItemFragment, item);

  const handleDelete = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    commitDeleteMutation({
      variables: {
        input: { id: data.id },
      },
    });
  };

  const renderInlineButtons = () => (
    <div className="flex ml-3 shrink-0 [&>*]:mr-4 [&>*:last-child]:mr-0">
      <Link
        variant={ButtonVariant.GHOST}
        className="border"
        to={generateLocalePath(RoutesConfig.crudDemoItem.edit, { id: data.id })}
        icon={<Icon size={14} icon={editIcon} />}
      >
        <FormattedMessage id="CrudDemoItem list / Edit link" defaultMessage="Edit" />
      </Link>
      <Button
        variant={ButtonVariant.GHOST}
        onClick={handleDelete}
        className="border"
        disabled={loading}
        icon={<Icon size={14} icon={deleteIcon} />}
      >
        <FormattedMessage id="CrudDemoItem list / Delete button" defaultMessage="Delete" />
      </Button>
    </div>
  );

  const renderButtonsMenu = () => (
    <CrudDropdownMenu className="w-40" itemId={data.id} handleDelete={handleDelete} loading={loading} />
  );

  return (
    <li className="group dark:hover:text-slate-500">
      <div className="group flex items-center justify-between w-full min-w-15 p-4 transition focus:outline-none hover:bg-secondary hover:text-secondary-foreground dark:hover:text-slate-100">
        <Link
          className="border-input transition-colors group-hover:dark:text-slate-100 hover:no-underline w-full justify-start min-w-0 max-w-full cursor-pointer"
          to={generateLocalePath(RoutesConfig.crudDemoItem.details, { id: data.id })}
        >
          <p className="dark:hover:text-slate-500 text-base transition-colors whitespace-nowrap overflow-hidden text-ellipsis">
            {data.name}
          </p>
        </Link>
        {isDesktop ? renderInlineButtons() : renderButtonsMenu()}
      </div>
    </li>
  );
};
