import documentIcon from '@iconify-icons/ion/document-text-outline';
import deleteIcon from '@iconify-icons/ion/trash-outline';
import { FragmentType, getFragmentData } from '@sb/webapp-api-client/graphql';
import { Button } from '@sb/webapp-core/components/buttons';
import { RelativeDate } from '@sb/webapp-core/components/dateTime';
import { Icon } from '@sb/webapp-core/components/icons';
import { reportError } from '@sb/webapp-core/utils/reportError';
import { FormattedMessage } from 'react-intl';

import { documentListItemFragment } from '../../../routes/documents';
import { useHandleDelete } from '../documents.hooks';

export type DocumentProps = {
  item: FragmentType<typeof documentListItemFragment>;
};

export const Document = ({ item }: DocumentProps) => {
  const { id, file, createdAt } = getFragmentData(documentListItemFragment, item);

  const handleDelete = useHandleDelete();

  return (
    <li className="flex flex-col items-center p-6 rounded border border-input">
      <RelativeDate className="text-base" date={new Date(createdAt as string)} />
      <div className="px-3">
        <Icon icon={documentIcon} size={32} />
      </div>
      <a
        className="text-base underline whitespace-nowrap max-w-[100%] overflow-hidden text-ellipsis"
        title={file?.name ?? ''}
        target="_blank"
        href={file?.url ?? undefined}
        rel="noreferrer"
      >
        {file?.name}
      </a>
      <Button
        variant="destructive"
        className="mt-1"
        icon={<Icon icon={deleteIcon} />}
        onClick={() => {
          handleDelete(id).catch(reportError);
        }}
      >
        <FormattedMessage defaultMessage="Delete" id="Documents / Document / Delete button" />
      </Button>
    </li>
  );
};
