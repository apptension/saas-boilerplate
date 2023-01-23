import styled from 'styled-components';
import { Button, ButtonVariant } from '../../../shared/components/forms/button';
import { labelBold, microlabel } from '../../../theme/typography';
import { RelativeDate as RelativeDateBase } from '../../../shared/components/dateTime/relativeDate';
import { border } from '../../../theme';
import { sizeUnits, verticalPadding } from '../../../theme/size';

export const Container = styled.li`
  padding: ${sizeUnits(2)};
  border: ${border.light};
  border-radius: ${sizeUnits(1)};
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const RelativeDate = styled(RelativeDateBase)`
  ${microlabel};
`;

export const Name = styled.a`
  ${labelBold};
  text-decoration: underline;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

export const IconContainer = styled.div`
  ${verticalPadding(sizeUnits(1))}
`;

export const DeleteButton = styled(Button).attrs({ variant: ButtonVariant.RAW })`
  margin-top: ${sizeUnits(1)};
`;
