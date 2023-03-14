import { media, size, zIndex } from '@saas-boilerplate-app/webapp-core/theme';
import styled from 'styled-components';

import { Header as HeaderLayout } from './header';
import { Sidebar as SidebarLayout } from './sidebar';

export const Sidebar = styled(SidebarLayout)``;

export const Header = styled(HeaderLayout)`
  position: fixed;
  z-index: ${zIndex.header};
  top: 0;
  left: 0;
  width: 100%;
`;

export const Content = styled.div<{ withSidebar: boolean }>`
  margin-top: ${size.header};
  ${size.fullContentHeight};
  position: relative;

  ${media.media(media.Breakpoint.TABLET)<{ withSidebar: boolean }>`
    margin-left: ${(props) => (props.withSidebar ? size.sideMenu : 0)};
  `}
`;
