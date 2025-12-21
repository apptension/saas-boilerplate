import { FragmentType, getFragmentData } from '@sb/webapp-api-client/graphql';
import { Button } from '@sb/webapp-core/components/buttons';
import { ConfirmDialog } from '@sb/webapp-core/components/confirmDialog';
import { RelativeDate } from '@sb/webapp-core/components/dateTime';
import { cn } from '@sb/webapp-core/lib/utils';
import { reportError } from '@sb/webapp-core/utils/reportError';
import { FileText, Trash2 } from 'lucide-react';
import { useIntl } from 'react-intl';

import { documentListItemFragment } from '../../../routes/documents';
import { useHandleDelete } from '../documents.hooks';

export type DocumentProps = {
  item: FragmentType<typeof documentListItemFragment>;
};

export const Document = ({ item }: DocumentProps) => {
  const intl = useIntl();

  const { id, file, createdAt } = getFragmentData(documentListItemFragment, item);

  const handleDelete = useHandleDelete();

  return (
    <li
      className={cn(
        'group relative flex items-center gap-3 p-4',
        'rounded-lg border bg-card text-card-foreground',
        'transition-all duration-200',
        'hover:shadow-md hover:border-primary/20'
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 flex items-center justify-center',
          'w-12 h-12 rounded-lg bg-muted',
          'group-hover:bg-primary/10 transition-colors'
        )}
      >
        <FileText className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <a
          className={cn(
            'block text-sm font-medium truncate',
            'text-foreground hover:text-primary',
            'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'rounded-sm'
          )}
          title={file?.name ?? ''}
          target="_blank"
          href={file?.url ?? undefined}
          rel="noreferrer"
        >
          {file?.name}
        </a>
        <RelativeDate className="text-xs text-muted-foreground" date={new Date(createdAt as string)} />
      </div>

      <ConfirmDialog
        onContinue={() => handleDelete(id).catch(reportError)}
        variant="destructive"
        title={intl.formatMessage({
          defaultMessage: 'Delete document',
          id: 'Documents / Document / Confirm Dialog / Title',
        })}
        description={intl.formatMessage({
          id: 'Documents / Document / Confirm Dialog / Description',
          defaultMessage: 'Are you sure you want to delete this document? This action cannot be undone.',
        })}
      >
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-8 w-8 flex-shrink-0',
            'opacity-0 group-hover:opacity-100',
            'text-muted-foreground hover:text-destructive hover:bg-destructive/10',
            'transition-all duration-200'
          )}
          aria-label={intl.formatMessage({
            defaultMessage: 'Delete document',
            id: 'Documents / Document / Delete button',
          })}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </ConfirmDialog>
    </li>
  );
};
