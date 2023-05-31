import documentIcon from '@iconify-icons/ion/document-text-outline';
import deleteIcon from '@iconify-icons/ion/trash-outline';
import { FragmentType, getFragmentData } from '@sb/webapp-api-client/graphql';
import { Button } from '@sb/webapp-core/components/buttons';
import { Icon } from '@sb/webapp-core/components/icons';
import { FormattedMessage } from 'react-intl';

import { documentListItemFragment } from '../../../routes/documents';
import { useHandleDelete } from '../documents.hooks';
import { Container, IconContainer, Name, RelativeDate } from './document.styles';

export type DocumentProps = {
  item: FragmentType<typeof documentListItemFragment>;
};

export const Document = ({ item }: DocumentProps) => {
  const { id, file, createdAt } = getFragmentData(documentListItemFragment, item);

  const handleDelete = useHandleDelete();

  return (
    <Container>
      <RelativeDate date={new Date(createdAt as string)} />
      <IconContainer>
        <Icon icon={documentIcon} size={32} />
      </IconContainer>
      <Name title={file?.name ?? ''} target="_blank" href={file?.url ?? undefined}>
        {file?.name}
      </Name>
      <Button variant="destructive" className="mt-1" icon={<Icon icon={deleteIcon} />} onClick={() => handleDelete(id)}>
        <FormattedMessage defaultMessage="Delete" id="Documents / Document / Delete button" />
      </Button>
    </Container>
  );
};
