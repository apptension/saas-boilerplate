import styled from 'styled-components';
import { Link as LinkBase } from 'react-router-dom';
import { label } from '../../../theme/typography';
import { horizontalPadding, sizeUnits, verticalPadding } from '../../../theme/size';
import { Breakpoint, media } from '../../../theme/media';
import { border, color, transition } from '../../../theme';
import { skyBlueScale } from '../../../theme/color';

export const Container = styled.li`
  width: 100%;
`;

export const Link = styled(LinkBase)`
  display: flex;
  flex-direction: row;
  align-items: center;
  ${verticalPadding(sizeUnits(2))};
  ${horizontalPadding(sizeUnits(2))};
  ${media(Breakpoint.TABLET)`
    ${horizontalPadding(sizeUnits(3))};
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
  width: ${sizeUnits(9)};
  height: ${sizeUnits(6)};
  margin-left: ${sizeUnits(2)};
  object-fit: cover;
  border-radius: 2px;
  flex-shrink: 0;

  ${media(Breakpoint.TABLET)`
    margin-left: ${sizeUnits(4)};
  `}
`;

export const Title = styled.p`
  ${label};
  margin-left: ${sizeUnits(2)};
  text-decoration: none;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;

  ${media(Breakpoint.TABLET)`
    margin-left: ${sizeUnits(4)};
  `}
`;

export const FavoriteIcon = styled.button`
  padding: 0;
  margin: 0;
  line-height: 0;
  background: none;
  border: none;
  color: ${skyBlueScale.get(50)};
  cursor: pointer;

  &:focus {
    ${border.outline};
  }
`;
