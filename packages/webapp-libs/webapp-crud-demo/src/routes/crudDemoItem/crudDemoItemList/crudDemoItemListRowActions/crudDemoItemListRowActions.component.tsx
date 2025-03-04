import { useMutation } from '@apollo/client';
import { Button, ButtonVariant, Link } from '@sb/webapp-core/components/buttons';
import { ConfirmDialog } from '@sb/webapp-core/components/confirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@sb/webapp-core/components/ui/dropdown-menu';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useToast } from '@sb/webapp-core/toast';
import { useGenerateTenantPath } from '@sb/webapp-tenants/hooks';
import { useCurrentTenant } from '@sb/webapp-tenants/providers';
import { LoaderCircle, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { RoutesConfig } from '../../../../config/routes';
import { crudDemoItemListRowActionsDeleteMutation } from './crudDemoItemListRowActions.graphql';

export interface CrudDemoItemListRowActionsProps {
  id: string;
}

export function CrudDemoItemListRowActions({ id }: CrudDemoItemListRowActionsProps) {
  const generateTenantPath = useGenerateTenantPath();
  const { data: currentTenant } = useCurrentTenant();
  const { toast } = useToast();
  const intl = useIntl();
  const [open, setOpen] = useState(false);

  const successMessage = intl.formatMessage({
    id: 'CrudDemoItemListRowActions / Delete CrudDemoItem / Success message',
    defaultMessage: '🎉 Item deleted successfully!',
  });

  const deleteConfirmationTitle = intl.formatMessage({
    id: 'CrudDemoItemListRowActions / Delete CrudDemoItem / Title',
    defaultMessage: 'Delete crud item',
  });

  const deleteConfirmationDescription = intl.formatMessage({
    id: 'CrudDemoItemListRowActions / Delete CrudDemoItem / Description',
    defaultMessage: 'Are you sure you want to delete this item?',
  });

  const [commitDeleteMutation, { loading }] = useMutation(crudDemoItemListRowActionsDeleteMutation, {
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

  const handleDelete = () => {
    if (!currentTenant) return;
    setOpen(false);

    commitDeleteMutation({
      variables: {
        input: { id, tenantId: currentTenant.id },
      },
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-8 w-8">
        <LoaderCircle className="h-[18px] w-[18px] animate-spin" />
      </div>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="ml-auto flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          data-testid="toggle-button"
        >
          <MoreHorizontal />
          <span className="sr-only">
            <FormattedMessage id="CrudDemoItemListRowActions / Menu / Button" defaultMessage="Open menu" />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem className="p-0">
          <Link
            variant={ButtonVariant.GHOST}
            className="m-0 h-8 w-full justify-start py-1 pl-2"
            to={generateTenantPath(RoutesConfig.crudDemoItem.edit, { id })}
            onClick={(e) => e.stopPropagation()}
          >
            <FormattedMessage id="CrudDemoItemListRowActions / Menu / Edit" defaultMessage="Edit" />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="p-0">
          <ConfirmDialog
            onContinue={handleDelete}
            title={deleteConfirmationTitle}
            description={deleteConfirmationDescription}
            continueLabel={intl.formatMessage({
              id: 'CrudDemoItemListRowActions / Delete CrudDemoItem / Button',
              defaultMessage: 'Delete',
            })}
          >
            <Button variant={ButtonVariant.GHOST} className="m-0 h-8 w-full justify-start py-1 pl-2">
              <FormattedMessage id="CrudDemoItemListRowActions / Menu / Delete" defaultMessage="Delete" />
            </Button>
          </ConfirmDialog>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
