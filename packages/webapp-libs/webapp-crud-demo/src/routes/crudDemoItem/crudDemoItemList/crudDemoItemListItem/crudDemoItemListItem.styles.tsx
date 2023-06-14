import { border, color, media, size, transition, typography } from '@sb/webapp-core/theme';
import styled from 'styled-components';

import { CrudDropdownMenu } from './crudDropdownMenu';

export const Container = styled.li``;

export const LinkContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 60px;
  ${size.verticalPadding(size.sizeUnits(2))};
  ${size.horizontalPadding(size.sizeUnits(2))};

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

  /* ${media.media(media.Breakpoint.TABLET)`
    padding-right: ${size.sizeUnits(3)};
    justify-content: space-between;
  `} */
`;

export const InlineButtons = styled.div`
  flex-shrink: 0;
  margin-left: ${size.sizeUnits(2)};

  & > * {
    background-color: transparent;
  }

  & > *:not(:last-child) {
    margin-right: ${size.sizeUnits(3)};
  }
`;

export const Text = styled.p`
  ${typography.label};
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;
