import { FragmentType, getFragmentData } from '@sb/webapp-api-client/graphql';
import { Button } from '@sb/webapp-core/components/buttons';
import { ConfirmDialog } from '@sb/webapp-core/components/confirmDialog';
import { RelativeDate } from '@sb/webapp-core/components/dateTime';
import { reportError } from '@sb/webapp-core/utils/reportError';
import { File, Trash2 } from 'lucide-react';
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
    <li className="flex items-center justify-between px-3 py-6 rounded border border-input">
      <div className="w-fit h-fit">
        <File size={32} />
      </div>
      <div className="flex justify-center flex-col px-4 w-[100%] max-w-[100%] overflow-hidden whitespace-nowrap">
        <a
          className="text-sm text-ellipsis overflow-hidden whitespace-nowrap text-blue-500"
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
          defaultMessage: 'Delete',
          id: 'Documents / Document / Confirm Dialog / Title',
        })}
        description={intl.formatMessage({
          id: 'Documents / Document / Confirm Dialog / Description',
          defaultMessage: 'Are you sure you want to delete this document?',
        })}
      >
        <Button
          variant="ghost"
          className="px-1"
          aria-label={intl.formatMessage({
            defaultMessage: 'Delete',
            id: 'Documents / Document / Delete button',
          })}
        >
          <Trash2 size={20} />
        </Button>
      </ConfirmDialog>
    </li>
  );
};
