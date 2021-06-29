import { ReactNode } from 'react';
import faker from 'faker';
import { FormattedMessage } from 'react-intl';
import documentIcon from '@iconify-icons/ion/document-text-outline';
import deleteIcon from '@iconify-icons/ion/trash-outline';
import { Icon } from '../../../shared/components/icon';
import { Container, RelativeDate, Name, DeleteButton, IconContainer } from './document.styles';

export type DocumentProps = {
  children?: ReactNode;
};

export const Document = (props: DocumentProps) => {
  return (
    <Container>
      <RelativeDate date={faker.date.recent(2)} />
      <IconContainer>
        <Icon icon={documentIcon} size={32} />
      </IconContainer>
      <Name>filename.pdf</Name>
      <DeleteButton icon={<Icon icon={deleteIcon} />}>
        <FormattedMessage defaultMessage="Delete" description="Documents / Document / Delete button" />
      </DeleteButton>
    </Container>
  );
};
