import styled from 'styled-components';
import { Header as HeaderLayout } from '../shared/components/header';
import { Sidebar as SidebarLayout } from '../shared/components/sidebar';

export const Layout = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    'header header'
    'sidebar content';
  min-height: 100vh;
`;

export const Sidebar = styled(SidebarLayout)`
  grid-area: sidebar;
`;

export const Header = styled(HeaderLayout)`
  grid-area: header;
`;

export const Content = styled.div`
  grid-area: content;
`;
