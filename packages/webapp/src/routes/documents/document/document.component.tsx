import documentIcon from '@iconify-icons/ion/document-text-outline';
import deleteIcon from '@iconify-icons/ion/trash-outline';
import { Icon } from '@saas-boilerplate-app/webapp-core/components/icons';
import { FormattedMessage } from 'react-intl';

import { DocumentListItemFragment } from '../../../shared/services/graphqlApi/__generated/gql/graphql';
import { useHandleDelete } from '../documents.hooks';
import { Container, DeleteButton, IconContainer, Name, RelativeDate } from './document.styles';

export type DocumentProps = {
  item: DocumentListItemFragment;
};

export const Document = ({ item }: DocumentProps) => {
  const { id, file, createdAt } = item;

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
      <DeleteButton icon={<Icon icon={deleteIcon} />} onClick={() => handleDelete(id)}>
        <FormattedMessage defaultMessage="Delete" id="Documents / Document / Delete button" />
      </DeleteButton>
    </Container>
  );
};
