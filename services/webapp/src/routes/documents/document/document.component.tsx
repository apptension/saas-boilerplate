import { FormattedMessage } from 'react-intl';
import documentIcon from '@iconify-icons/ion/document-text-outline';
import deleteIcon from '@iconify-icons/ion/trash-outline';
import { useFragment } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { Icon } from '../../../shared/components/icon';
import { useHandleDelete } from '../documents.hooks';
import { documentListItem$key } from './__generated__/documentListItem.graphql';
import { Container, DeleteButton, IconContainer, Name, RelativeDate } from './document.styles';

export type DocumentProps = {
  item: documentListItem$key;
};

export const Document = ({ item }: DocumentProps) => {
  const { id, file, createdAt } = useFragment(
    graphql`
      fragment documentListItem on DocumentDemoItemType {
        id
        file {
          url
          name
        }
        createdAt
      }
    `,
    item
  );
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
