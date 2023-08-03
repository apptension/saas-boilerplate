import { ReactNode } from 'react';

import { Image } from '../image';
import { Container, Table, Td, Text, Title, Tr } from './layout.styles';

export type LayoutProps = {
  title: ReactNode;
  text: ReactNode;
  children?: ReactNode;
};

export const Layout = ({ title, text, children }: LayoutProps) => {
  return (
    <Container>
      <Table>
        <Tr>
          <Td>
            <Image style={{ display: 'block', margin: '0 auto', width: 256 }} src="logo.png" />
          </Td>
        </Tr>
        <Tr>
          <Title>{title}</Title>
        </Tr>

        <Tr>
          <Text>{text}</Text>
        </Tr>

        <Tr>
          <Td>{children}</Td>
        </Tr>
      </Table>
    </Container>
  );
};
