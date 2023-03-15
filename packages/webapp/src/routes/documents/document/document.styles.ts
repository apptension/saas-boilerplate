import { Button, ButtonVariant } from '@sb/webapp-core/components/buttons';
import * as coreDateTime from '@sb/webapp-core/components/dateTime';
import { border, size, typography } from '@sb/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.li`
  padding: ${size.sizeUnits(2)};
  border: ${border.light};
  border-radius: ${size.sizeUnits(1)};
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const RelativeDate = styled(coreDateTime.RelativeDate)`
  ${typography.microlabel};
`;

export const Name = styled.a`
  ${typography.labelBold};
  text-decoration: underline;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

export const IconContainer = styled.div`
  ${size.verticalPadding(size.sizeUnits(1))}
`;

export const DeleteButton = styled(Button).attrs({ variant: ButtonVariant.RAW })`
  margin-top: ${size.sizeUnits(1)};
`;
