import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { horizontalPadding, sizeUnits, verticalPadding } from '../../../../theme/size';
import { label } from '../../../../theme/typography';
import { border, color, transition } from '../../../../theme';
import { Breakpoint, media } from '../../../../theme/media';
import { CrudDropdownMenu } from './crudDropdownMenu';

export const Container = styled.li``;

export const LinkContainer = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 60px;
  ${verticalPadding(sizeUnits(2))};
  ${horizontalPadding(sizeUnits(2))};

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

  ${media(Breakpoint.TABLET)`
    padding-right: ${sizeUnits(3)};
    justify-content: space-between;
  `}
`;

export const InlineButtons = styled.div`
  flex-shrink: 0;
  margin-left: ${sizeUnits(2)};

  & > * {
    background-color: transparent;
  }

  & > *:not(:last-child) {
    margin-right: ${sizeUnits(3)};
  }
`;

export const Text = styled.p`
  ${label}
`;

export const DropdownMenu = styled(CrudDropdownMenu)`
  padding-left: ${sizeUnits(2)};
`;
