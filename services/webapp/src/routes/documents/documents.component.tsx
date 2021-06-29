import { FormattedMessage } from 'react-intl';
import { Dropzone } from '../../shared/components/dropzone';
import { Container, Header, List } from './documents.styles';
import { Document } from './document';

export const Documents = () => {
  return (
    <Container>
      <Header>
        <FormattedMessage defaultMessage="Documents" description="Documents / Header" />
      </Header>
      <Dropzone onDrop={console.log} />
      <List>
        <Document />
        <Document />
        <Document />
        <Document />
        <Document />
        <Document />
        <Document />
        <Document />
      </List>
    </Container>
  );
};
