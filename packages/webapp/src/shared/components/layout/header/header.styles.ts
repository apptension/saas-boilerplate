import { color, media, size } from '@sb/webapp-core/theme';
import styled from 'styled-components';

import { Avatar as AvatarBase } from '../../avatar';

export const Content = styled.div`
  ${size.contentWrapper};
  max-width: none;
  height: ${size.header};
  display: flex;
  align-items: center;
  justify-content: space-between;
  line-height: 0;
  position: relative;
  border-bottom: 1px solid ${color.greyScale.get(95)} ${media.media(media.Breakpoint.TABLET)`
    justify-content: flex-start;
  `};
`;

export const MenuToggleButton = styled.div.attrs(() => ({ role: 'button', tabIndex: 0 }))`
  display: block;
  width: ${size.sizeUnits(3)};
  padding: 6px 2px;
  left: ${size.sizeUnits(2)};
  cursor: pointer;
`;

export const MenuLine = styled.span`
  width: 100%;
  display: block;
  background-color: ${color.black};
  height: 1px;
  margin-top: 3px;
  margin-bottom: 3px;
`;

export const ProfileActions = styled.div`
  position: relative;
  margin-left: ${size.sizeUnits(1)};
  display: none;

  ${media.media(media.Breakpoint.TABLET)`
    display: block;
  `}
`;

export const Menu = styled.div`
  border-radius: 4px;
  overflow: hidden;
  top: ${size.sizeUnits(5)};
  text-align: left;
  display: flex;
  flex-direction: column;
  background-color: ${color.white};

  & > * {
    padding-left: 11px;
  }
`;

export const Avatar = styled(AvatarBase)`
  margin-left: 8px;
  cursor: pointer;
`;
