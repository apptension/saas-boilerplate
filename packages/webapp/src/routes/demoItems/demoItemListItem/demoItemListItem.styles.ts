import { border, color, media, size, transition, typography } from '@saas-boilerplate-app/webapp-core/theme';
import { Link as LinkBase } from 'react-router-dom';
import styled from 'styled-components';


export const Container = styled.li`
  width: 100%;
`;

export const Link = styled(LinkBase)`
  display: flex;
  flex-direction: row;
  align-items: center;
  ${size.verticalPadding(size.sizeUnits(2))};
  ${size.horizontalPadding(size.sizeUnits(2))};
  ${media.media(media.Breakpoint.TABLET)`
    ${size.horizontalPadding(size.sizeUnits(3))};
  `}

  transition: background-color ${transition.primary}, color ${transition.primary};

  &:focus,
  &:hover {
    background-color: ${color.listItem.hover.background};
  }

  &:focus {
    ${border.outline};
  }

  &:active {
    background-color: ${color.listItem.active.background};
    color: ${color.listItem.active.text};
  }
`;

export const Thumbnail = styled.img`
  width: ${size.sizeUnits(9)};
  height: ${size.sizeUnits(6)};
  margin-left: ${size.sizeUnits(2)};
  object-fit: cover;
  border-radius: 2px;
  flex-shrink: 0;

  ${media.media(media.Breakpoint.TABLET)`
    margin-left: ${size.sizeUnits(4)};
  `}
`;

export const Title = styled.p`
  ${typography.label};
  margin-left: ${size.sizeUnits(2)};
  text-decoration: none;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;

  ${media.media(media.Breakpoint.TABLET)`
    margin-left: ${size.sizeUnits(4)};
  `}
`;

export const FavoriteIcon = styled.button`
  padding: 0;
  margin: 0;
  line-height: 0;
  background: none;
  border: none;
  color: ${color.skyBlueScale.get(50)};
  cursor: pointer;

  &:focus {
    ${border.outline};
  }
`;
